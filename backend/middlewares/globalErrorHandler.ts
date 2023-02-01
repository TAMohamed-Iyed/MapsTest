import { Request, Response, NextFunction } from 'express';
import { ApiError, BadRequestError, InternalError } from '../core/errors';
import { BadRequestResponse } from '../core/responses';

export default (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
  } else {
    if (process.env.NODE_ENV === 'development') {
      throw new BadRequestError(err.message);
    }
    ApiError.handle(new InternalError(), res);
  }
};
