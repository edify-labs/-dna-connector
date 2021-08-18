import axios from 'axios';
import { errors, respond } from '../utils';
import { config } from '../constants';
import { getRequestFromTemplate } from '../functions';

export default async function query(req, res, next) {
  try {
    const { request: dnaRequest } = req.body;

    if (!dnaRequest) {
      throw new errors.UnprocessableError('request is required');
    }

    const request = getRequestFromTemplate(dnaRequest);
    let response = {};
    try {
      response = await axios({ ...config, data: request });
    } catch (error) {
      throw error.message?.includes('connectTimeout')
        ? new errors.RequestTimeout('Unable to connect')
        : new errors.InternalError(`Error executing request: ${error.message || dnaRequest}`);
    }

    return respond.withOk(req, res, { response: response.data });
  } catch (error) {
    console.log(error)
    return next(error);
  }
}
