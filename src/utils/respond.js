const HttpStatus = require('http-status-codes');
const path = require('path');
const packagePath = path.join(`${__dirname}`, '..', '..', 'package.json');
const pjson = require(packagePath);
const respond = {};

respond.withOk = (_req, res, responseObject = {}) => {
  res.status(HttpStatus.OK).json(responseObject);
};

respond.withBadRequest = (_req, res, message = 'Bad Request') => {
  res.status(HttpStatus.BAD_REQUEST).json({ message, version: pjson.version });
};

respond.withUnprocessableEntity = (_req, res, message = 'Unprocessible Entity', errors = []) => {
  res.status(HttpStatus.UNPROCESSABLE_ENTITY);
  res.json({ message, errors, version: pjson.version });
};

respond.withNotFound = (_req, res, message = 'Not Found') => {
  res.status(HttpStatus.NOT_FOUND);
  res.json({ message, version: pjson.version });
};

respond.withInternalError = (_req, res, message = 'Internal Server Error', errors = []) => {
  res.status(HttpStatus.INTERNAL_SERVER_ERROR);
  res.json({ message, errors, version: pjson.version });
};

respond.withUnauthorized = (_req, res, message = 'Unauthorized') => {
  res.status(HttpStatus.UNAUTHORIZED);
  res.json({ message, version: pjson.version });
};

respond.withForbidden = (_req, res, message = 'Forbidden') => {
  res.status(HttpStatus.FORBIDDEN);
  res.json({ message, version: pjson.version });
};

respond.withTooManyRequests = (_req, res, message = 'Too Many Requests', errors = []) => {
  res.status(HttpStatus.TOO_MANY_REQUESTS);
  res.json({ message, errors, version: pjson.version });
};

respond.withRequestTimeout = (_req, res, message = 'Request Timeout') => {
  res.status(HttpStatus.REQUEST_TIMEOUT);
  res.json({ message, version: pjson.version });
};

export default respond;
