import { JoiObjectId } from '../../middlewares/joiValidation';
import Joi from 'joi';

//Schemas
/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         latitude:
 *           type: number
 *           description: location latitude
 *           example: 35.10
 *         longitude:
 *           type: number
 *           description: location longitude
 *           example: 10.1410
 *     CreateLocation:
 *       type: object
 *       required:
 *         - latitude
 *         - longitude
 *       properties:
 *         latitude:
 *           type: number
 *           description: location latitude
 *           example: 35.10
 *         longitude:
 *           type: number
 *           description: location longitude
 *           example: 10.124
 */

export default {
  create: Joi.object().keys({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }),
  update: Joi.object().keys({
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  }),
  id: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
};
