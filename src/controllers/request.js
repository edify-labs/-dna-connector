import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { errors, respond, createSoapRequest, getWhois } from '../utils';
import { getConfig } from '../constants';

const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);

export default async function query(req, res, next) {
  try {
    let { requestXml, requestJson } = req.body;
    const isSandbox = req.url.includes('/sandbox');

    if (!requestXml && !requestJson) {
      throw new errors.UnprocessableError('requestXml or requestJson is required');
    }

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

    const config = getConfig(isSandbox);
    const mustaches = {
      '{{dnaPassword}}': 'dnaPassword',
      '{{dnaApplicationId}}': 'dnaApplicationId',
      '{{dnaNetworkNodeName}}': 'dnaNetworkNodeName',
    };

    let useData;
    let contentType = 'application/json';
    if (requestJson) {
      useData = requestJson;
    } else if (requestXml) {
      useData = requestXml;
      contentType = 'text/xml';
    }

    for (const [mustache, variable] of Object.entries(mustaches)) {
      if (variable === 'dnaPassword') {
        useData = useData.replace(mustache, whois);
      } else if (useData.includes(mustache) && config.vars[variable]) {
        useData = useData.replace(mustache, config.vars[variable]);
      }
    }

    const axiosConfig = {
      url: config.url,
      headers: { 'Content-Type': contentType },
      method: 'post',
      data: useData,
    };

    console.log('REQUEST DATA\n------------\n', useData);
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
      if (e?.response?.status) {
        status = e.response.status;
      } else {
        status = e.message?.includes('connectTimeout') ? 408 : 500;
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
        sentData: dnaRequest,
        responseData: e.response?.data || {},
      });
    }

    return respond.withOk(req, res, { response: response.data, version: pjson.version });
  } catch (error) {
    return next(error);
  }
}
