import { FilterQuery, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import Repositorie from '.';
import Location, { ILocation } from '../models/Location';

export default class LocationRepo extends Repositorie<ILocation>(Location) {}
