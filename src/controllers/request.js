import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { errors, respond } from '../utils';
import { getConfig } from '../constants';

const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);
export default async function query(req, res, next) {
  try {
    let { request: dnaRequest } = req.body;

    if (!dnaRequest) {
      throw new errors.UnprocessableError('request is required');
    }

    const config = getConfig(req.url.includes('/sandbox'));
    const mustaches = [
      '{{dnaUserId}}',
      '{{dnaPassword}}',
      '{{dnaApplicationId}}',
      '{{dnaNetworkNodeName}}',
    ];

    for (const mustache of mustaches) {
      if (dnaRequest.includes(mustache) && config.vars[mustache]) {
        dnaRequest = dnaRequest.replace(mustache, config.vars[mustache]);
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
      });
    }

    return respond.withOk(req, res, { response: response.data, version: pjson.version });
  } catch (error) {
    return next(error);
  }
}
