import path from 'path';
import axios from 'axios';
import { getConfig } from '../constants';

const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);

export default async function getWsdl(req, res, next) {
  const { service } = req.params;
  const config = getConfig(req.url.includes('/sandbox'));
  let response;
  const useUrl = service === 'dna' ? config.url : config.safUrl;

  try {
    response = await axios({
      method: 'get',
      url: `${useUsrl}?wsdl`,
    });
  } catch (e) {
    const eJSON = e.toJSON ? e.toJSON() : {};
    let status;
    if (e?.response?.status) {
      status = e.response.status;
    } else {
      status = e.message?.includes('connectTimeout') ? 408 : 500;
    }

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
      requestConfig:
        eJSON && eJSON.config
          ? { url: eJSON.config.url, headers: eJSON.config.headers, data: eJSON.config.data }
          : {},
      responseData: e.response?.data || {},
    });
  }

  if (!response.data) {
    return res.status(500).json({ message: 'Error fetching wsdl' });
  }

  return res.status(200).send(response.data);
}
