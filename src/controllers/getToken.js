import path from 'path';
import { getSsoToken } from '../utils';

const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);

export default async function getToken(req, res, next) {
  let token;
  try {
    token = await getSsoToken(req.url.includes('/sandbox'));
    return res.json({ token });
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
    });
  }
}
