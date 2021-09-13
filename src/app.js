import express from 'express';
import { respond } from './utils';
import routes from './routes';
import path from 'path';
const packagePath = path.join(`${__dirname}`, '..', 'package.json');
const pjson = require(packagePath);
const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/healthcheck', (_req, res) => {
  const envKeys = Object.keys(process.env).filter((k) => k.includes('DNA_'));
  res.status(200);
  res.send({ envKeys, version: pjson.version });
});

// Routes
app.use(routes);

// Error Handling
app.use('*', (_req, res) => {
  res.status(404).send('Route not found');
});

app.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  switch (err.name) {
    case 'BadRequestError':
      return respond.withBadRequest(req, res, err.message);
    case 'UnprocessableError':
      return respond.withUnprocessableEntity(req, res, err.message);
    case 'NotFoundError':
      return respond.withNotFound(req, res, err.message);
    case 'InternalError': {
      // const message = err.isEdifyError ? err.message : null;
      return respond.withInternalError(req, res, err.message);
    }
    case 'UnauthorizedError':
      return respond.withUnauthorized(req, res, err.message);
    case 'TypeError':
      return respond.withInternalError(req, res);
    case 'ForbiddenError':
      return respond.withForbidden(req, res, err.message);
    case 'RequestTimeout':
      return respond.withRequestTimeout(req, res, err.message);
    default:
      return respond.withInternalError(req, res);
  }
});

export default app;
