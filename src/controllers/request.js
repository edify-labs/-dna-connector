import fs from 'fs';
import https from 'https';
import axios from 'axios';
import { errors, respond } from '../utils';
import { getConfig } from '../constants';

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

    if (config.ca && config.cert) {
      axiosConfig.httpsAgent = new https.Agent({
        ca: fs.readFileSync(config.ca),
        cert: fs.readFileSync(config.cert),
      });
    }

    let response = {};
    try {
      response = await axios(axiosConfig);
    } catch (error) {
      const status = error.message?.includes('connectTimeout') ? 408 : 500;
      return res.status(status).json({
        message: 'Error executing request',
        error: {
          message: error.message,
          stack: error.stack,
        },
        missingEnvKeys: config.missingKeys,
      });
    }

    return respond.withOk(req, res, { response: response.data });
  } catch (error) {
    return next(error);
  }
}
