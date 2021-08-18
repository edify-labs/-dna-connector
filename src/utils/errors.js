/* eslint-disable max-classes-per-file */

export class EdifyError extends Error {
  constructor(message) {
    super(message);
    this.isEdifyError = true;
  }
}

export class BadRequestError extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    Error.captureStackTrace(this, BadRequestError);
  }
}

export class UnprocessableError extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'UnprocessableError';
    Error.captureStackTrace(this, UnprocessableError);
  }
}

export class NotFoundError extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    Error.captureStackTrace(this, NotFoundError);
  }
}

export class InternalError extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'InternalError';
    Error.captureStackTrace(this, InternalError);
  }
}

export class UnauthorizedError extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    Error.captureStackTrace(this, UnauthorizedError);
  }
}

export class ForbiddenError extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    Error.captureStackTrace(this, ForbiddenError);
  }
}

export class TooManyRequestsError extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'TooManyRequestsError';
    Error.captureStackTrace(this, TooManyRequestsError);
  }
}
export class RequestTimeout extends EdifyError {
  constructor(message) {
    super(message);
    this.name = 'RequestTimeout';
    Error.captureStackTrace(this, RequestTimeout);
  }
}