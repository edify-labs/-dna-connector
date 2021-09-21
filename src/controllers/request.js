import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { errors, respond, getSsoToken } from '../utils';
import { getConfig } from '../constants';

const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);

export default async function query(req, res, next) {
  try {
    let { request: dnaRequest } = req.body;
    const isSandbox = req.url.includes('/sandbox');

    if (!dnaRequest) {
      throw new errors.UnprocessableError('request is required');
    }

    let token;
    try {
      token = await getSsoToken(isSandbox);
    } catch (e) {
      const eJSON = e.toJSON ? e.toJSON() : {};
      const status = e.message?.includes('connectTimeout') ? 408 : 500;
      return res.status(status).json({
        message: 'Error executing request',
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

    if (!token) {
      throw new errors.InternalError('Error fetching sso token');
    }

    const config = getConfig(isSandbox);
    const mustaches = {
      // '{{dnaUserId}}': 'dnaUserId',
      '{{dnaPassword}}': 'dnaPassword',
      '{{dnaApplicationId}}': 'dnaApplicationId',
      '{{dnaNetworkNodeName}}': 'dnaNetworkNodeName',
    };

    for (const [mustache, variable] of Object.entries(mustaches)) {
      if (variable === 'dnaPassword') {
        dnaRequest = dnaRequest.replace(mustache, token);
      } else if (dnaRequest.includes(mustache) && config.vars[variable]) {
        dnaRequest = dnaRequest.replace(mustache, config.vars[variable]);
      }
    }

    const axiosConfig = {
      url: config.url,
      data: dnaRequest,
      headers: { 'Content-Type': 'application/xml' },
      method: 'post',
    };

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
      const eJSON = error.toJSON ? error.toJSON() : {};
      const status = error.message?.includes('connectTimeout') ? 408 : 500;
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
