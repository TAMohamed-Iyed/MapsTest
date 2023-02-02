import { validate, ValidationSource } from '../../middlewares/joiValidation';
import { Router } from 'express';

import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
} from '../../controllers/locationController';
import locationSchema from './schema';

const router = Router();

//Swagger

//TAGS
/**
 * @swagger
 * tags:
 *  name: Locations
 *  description: Locations API
 */

//Routes

// create a new location

/**
 * @swagger
 * /api/locations :
 *  post:
 *    summary: create new location
 *    tags: [Locations]
 *    requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/CreateLocation'
 *    responses:
 *      200:
 *         description: location successfully created
 *         content:
 *            application/json:
 *              schema:
 *                  $ref: '#/components/schemas/Location'
 *      400:
 *        description: 	Validation Failed
 *      401:
 *        description: Error Token
 *      403:
 *        description: Access Denied / Unauthorized
 *      500:
 *        description: Internal server error
 */

router.post('/', validate(locationSchema.create), createLocation);

// get all locations

/**
 * @swagger
 * /api/locations :
 *  get:
 *    summary: get all locations
 *    tags: [Locations]
 *    parameters:
 *      - in: query
 *        name: maxDistance
 *        description: the max length of each trip (in kilometers)
 *      - in: query
 *        name: maxDuration
 *        description: the max duration of each trip (in seconds)
 *      - in: query
 *        name: maxTrips
 *        description: max number of trips
 *    responses:
 *      200:
 *        description: Get all locations
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Location'
 *      400:
 *        description: 	Validation Failed
 *      401:
 *        description: Error Token
 *      403:
 *        description: Access Denied / Unauthorized
 *      500:
 *        description: Internal server error
 */

router.get('/', validate(locationSchema.getAllQueryParams, ValidationSource.QUERY), getAllLocations);

// get location by id

/*
 * @swagger
 * /api/locations/{id} :
 *  get:
 *     summary: get location by id
 *     tags: [Locations]
 *      parameters:
 *       - in: path
 *         name: id
 *         schema:
 *              type: string
 *         required: true
 *         description: location id
 *      respones:
 *       200:
 *         description: get location by id
 *         content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Location'
 *       400:
 *          description: Validation Failed
 *       401:
 *          description: Error Token
 *       403:
 *          description: Access Denied / Unauthorized
 *       404:
 *          description: location Not Found
 *      500:
 *          description: Internal Server Error
 */

router.get('/:id', validate(locationSchema.id, ValidationSource.PARAM), getLocationById);

// Update location

/**
 * @swagger
 *  /api/locations/{id} :
 *   patch:
 *     summary: update location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *              type: string
 *         required: true
 *         description: location id
 *     requesBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Location'
 *     responses:
 *      200:
 *         description: location updated successfully
 *         content:
 *            application/json:
 *              schema:
 *                  $ref: '#/components/schemas/CreateLocation'
 *      400:
 *        description: 	Validation Failed
 *      401:
 *        description: Error Token
 *      403:
 *        description: Access Denied / Unauthorized
 *      404:
 *        description: Location Not Found
 *      500:
 *        description: Internal server error
 */
router.patch(
  '/:id',
  validate(locationSchema.id, ValidationSource.PARAM),
  validate(locationSchema.update),
  updateLocation,
);

/**
 * @swagger
 * /api/locations/{id} :
 *  delete:
 *      summary: delete location
 *      tags: [Locations]
 *      parameters:
 *       - in: path
 *         name: id
 *         schema:
 *              type: string
 *         required: true
 *         description: location id
 *      respones:
 *       200:
 *          description: location deleted successfully
 *       400:
 *          description: 	Validation Failed
 *       401:
 *          description: Error Token
 *       403:
 *          description: Access Denied / Unauthorized
 *       404:
 *          description: location Not Found
 *       500:
 *          description: Internal server error
 */
router.delete('/:id', validate(locationSchema.id, ValidationSource.PARAM), deleteLocation);

export default router;
