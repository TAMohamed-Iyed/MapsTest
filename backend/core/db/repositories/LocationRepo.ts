import Repositorie from '.';
import Location, { ILocation } from '../models/Location';

(async () => {
  //   await Location.create({
  //     longitude: 15,
  //     latitude: 13,
  //   });
  //   await Location.deleteMany();
})();

export default class LocationRepo extends Repositorie<ILocation>(Location) {}
