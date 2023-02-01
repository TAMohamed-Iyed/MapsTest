import { Schema, model } from 'mongoose';

export interface ILocation {
  latitude: number;
  longitude: number;
}

const LocationSchema = new Schema({
  latitude: {
    type: Number,
    required: [true, 'location must have a latitude coordinate'],
  },
  longitude: {
    type: Number,
    required: [true, 'location must have a longitude coordinate'],
  },
});

const Location = model<ILocation>('Location', LocationSchema);

export default Location;
