import { errors } from '../utils';

export default function verifyAuthHeader(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new errors.UnauthorizedError('Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    if (!token || token !== process.env.EDIFY_AUTH_HEADER) {
      throw new errors.UnauthorizedError('Unauthorized');
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
