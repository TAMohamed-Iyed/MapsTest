import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Types } from 'mongoose';
import { BadRequestError } from '../core/errors';
import asyncHandler from '../utils/asyncHandler';

export enum ValidationSource {
  BODY = 'body',
  HEADER = 'headers',
  QUERY = 'query',
  PARAM = 'params',
}

export const validate = (schema: Joi.ObjectSchema, source: ValidationSource = ValidationSource.BODY) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[source], { abortEarly: true });

    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    return next();
  });
export const JoiObjectId = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }, 'Object Id Validation');
