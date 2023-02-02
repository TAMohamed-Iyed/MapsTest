import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ILocation } from '../core/db/models/Location';
import LocationRepo from '../core/db/repositories/LocationRepo';
import { SuccessMsgResponse, SuccessResponse } from '../core/responses';
import checkHandler from '../services/checkHandler';
import LocationsService from '../services/LocationService';
import asyncHandler from '../utils/asyncHandler';

// add newlocation
export const createLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await LocationRepo.create(req.body as ILocation);
  return new SuccessResponse('success', location).send(res);
});

//get all locations
export const getAllLocations = asyncHandler(async (req: Request, res: Response) => {
  let roads: ILocation[] | null = await LocationRepo.findAll({});
  return new SuccessResponse('success', LocationsService.sortLocations(roads)).send(res);
});

// get location by id
export const getLocationById = asyncHandler(async (req: Request, res: Response) => {
  const id = new Types.ObjectId(req.params.id);

  await checkHandler.checkElementExistence<ILocation>(LocationRepo, 'location', id);

  const location = await LocationRepo.findById(id);
  return new SuccessResponse('success', location).send(res);
});

// updatelocation
export const updateLocation = async (req: Request, res: Response) => {
  const id = new Types.ObjectId(req.params.id);

  await checkHandler.checkElementExistence<ILocation>(LocationRepo, 'location', id);

  const location = await LocationRepo.updateOne({ _id: id }, req.body as ILocation);
  return new SuccessResponse('location updated successfully', location).send(res);
};

// deletelocation
export const deleteLocation = asyncHandler(async (req: Request, res: Response) => {
  const id = new Types.ObjectId(req.params.id);
  await checkHandler.checkElementExistence<ILocation>(LocationRepo, 'location', id);
  await LocationRepo.deleteOne({ _id: id });
  return new SuccessMsgResponse('location deleted successfully.').send(res);
});
