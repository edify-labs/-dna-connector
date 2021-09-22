import path from 'path';
import { getSsoToken, writeToErrorFile } from '../utils';

const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);

export default async function getToken(req, res, next) {
  let token;
  try {
    token = await getSsoToken(req.url.includes('/sandbox'));
    return res.json({ token });
  } catch (e) {
    const eJSON = e.toJSON ? e.toJSON() : {};
    const writeObj = eJSON && Object.keys(eJSON).length ? eJSON : e;
    if (e.response?.data) {
      writeObj.responseData = e.response.data;
    }

    writeToErrorFile(JSON.stringify(writeObj, null, 2));
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
}
