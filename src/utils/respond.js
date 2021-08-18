const HttpStatus = require('http-status-codes');

const respond = {};

respond.withOk = (_req, res, responseObject = {}) => {
  res.status(HttpStatus.OK).json(responseObject);
};

respond.withBadRequest = (_req, res, message = 'Bad Request') => {
  res.status(HttpStatus.BAD_REQUEST).json({ message });
};

respond.withUnprocessableEntity = (_req, res, message = 'Unprocessible Entity', errors = []) => {
  res.status(HttpStatus.UNPROCESSABLE_ENTITY);
  res.json({ message, errors });
};

respond.withNotFound = (_req, res, message = 'Not Found') => {
  res.status(HttpStatus.NOT_FOUND);
  res.json({ message });
};

respond.withInternalError = (_req, res, message = 'Internal Server Error', errors = []) => {
  res.status(HttpStatus.INTERNAL_SERVER_ERROR);
  res.json({ message, errors });
};

respond.withUnauthorized = (_req, res, message = 'Unauthorized') => {
  res.status(HttpStatus.UNAUTHORIZED);
  res.json({ message });
};

respond.withForbidden = (_req, res, message = 'Forbidden') => {
  res.status(HttpStatus.FORBIDDEN);
  res.json({ message });
};

respond.withTooManyRequests = (_req, res, message = 'Too Many Requests', errors = []) => {
  res.status(HttpStatus.TOO_MANY_REQUESTS);
  res.json({ message, errors });
};

respond.withRequestTimeout = (_req, res, message = 'Request Timeout') => {
  res.status(HttpStatus.REQUEST_TIMEOUT);
  res.json({ message });
};

export default respond;
