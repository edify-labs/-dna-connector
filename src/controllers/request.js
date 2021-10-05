import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { errors, respond, getWhois } from '../utils';
import { getConfig } from '../constants';

const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);

export default async function query(req, res, next) {
  try {
    let { requestXml, requestJson, rawRequest } = req.body;
    const isSandbox = req.url.includes('/sandbox');

    if (!requestXml && !requestJson && !rawRequest) {
      throw new errors.UnprocessableError('requestXml or requestJson or rawRequest is required');
    }

    let useData;
    let contentType = 'application/json';
    const config = getConfig(isSandbox);
    let useUrl = config.urls.coreJson;
    if (!rawRequest) {
      let whois;
      try {
        whois = await getWhois(isSandbox);
      } catch (e) {
        console.log(e);
        const eJSON = e.toJSON ? e.toJSON() : {};
        let status;
        if (e?.response?.status) {
          status = e.response.status;
        } else {
          status = e.message?.includes('connectTimeout') ? 408 : 500;
        }

        return res.status(status).json({
          message: 'Error executing request (error getting whois)',
          error: {
            message: e.message,
            stack: e.stack,
            jsonMessage: eJSON.message || e.message,
            jsonStack: eJSON.stack || e.stack,
            jsonCode: eJSON.code || 'no code',
          },
          version: pjson.version,
          requestConfig: eJSON && eJSON.config && eJSON.config.data ? eJSON.config.data : 'no data',
          responseData: e.response?.data || {},
        });
      }

      if (!whois) {
        throw new errors.InternalError('Error fetching whois');
      }

      const mustaches = {
        '{{dnaPassword}}': 'dnaPassword',
        '{{dnaApplicationId}}': 'dnaApplicationId',
        '{{dnaNetworkNodeName}}': 'dnaNetworkNodeName',
      };

      if (requestJson) {
        useData = JSON.stringify(requestJson);
      } else if (requestXml) {
        useData = requestXml;
        contentType = 'text/xml';
        useUrl = config.urls.coreSoap;
      }

      console.log('pre mustache data', useData);
      for (const [mustache, variable] of Object.entries(mustaches)) {
        if (variable === 'dnaPassword' && !requestJson) {
          console.log('pre replace', whois);
          // whois = whois.replace(/"/g, '\\"');
          console.log('post replace', whois);
          useData = useData.replace(mustache, whois);
        } else if (useData.includes(mustache) && config.vars[variable]) {
          useData = useData.replace(mustache, config.vars[variable]);
        }
      }

      if (requestJson) {
        useData = JSON.parse(useData);
        if (useData?.Input?.UserAuthentication?.Password) {
          useData.Input.UserAuthentication.Password = whois;
        }
      }
    } else {
      console.log('run from raw request');
      useData = rawRequest;
    }

    const axiosConfig = {
      url: useUrl,
      headers: { 'Content-Type': contentType },
      method: 'post',
      data: useData,
    };

    console.log(JSON.stringify(axiosConfig));
    console.log('REQUEST DATA\n------------\n', JSON.stringify(useData));
    const ca = fs.readFileSync(config.ca);
    const cert = fs.readFileSync(config.cert);
    if (config.ca && config.cert) {
      axiosConfig.httpsAgent = new https.Agent({
        ca: `${ca}\n${cert}`,
      });
    }

    let response = {};
    try {
      response = await axios(axiosConfig);
    } catch (error) {
      console.log(error);
      const eJSON = error.toJSON ? error.toJSON() : {};
      let status;
      if (error?.response?.status) {
        status = error.response.status;
      } else {
        status = error.message?.includes('connectTimeout') ? 408 : 500;
      }

      const envKeys = Object.keys(process.env).filter((k) => k.includes('DNA_'));
      return res.status(status).json({
        message: 'Error executing request',
        error: {
          message: error.message,
          stack: error.stack,
          jsonMessage: eJSON.message || error.message,
          jsonStack: eJSON.stack || error.stack,
          jsonCode: eJSON.code || 'no code',
        },
        missingEnvKeys: config.missingKeys,
        ca: config.ca || 'missing',
        cert: config.cert || 'missing',
        dnaKeys: envKeys,
        version: pjson.version,
        sentData: useData,
        responseData: error.response?.data || {},
      });
    }

    return respond.withOk(req, res, {
      response: response.data,
      version: pjson.version,
      sentData: useData,
    });
  } catch (error) {
    return next(error);
  }
}
