import { Types } from 'mongoose';
import { ILocation } from '../core/db/models/Location';
import Repositorie from '../core/db/repositories';
import { NotFoundError } from '../core/errors';

export default class {
  public static async checkElementExistence<T>(
    Repo: ReturnType<typeof Repositorie<T>>,
    name: string,
    id: Types.ObjectId,
  ) {
    if (!(await Repo.findById(id))) {
      throw new NotFoundError(`${name} does not exist`);
    }
  }
}
