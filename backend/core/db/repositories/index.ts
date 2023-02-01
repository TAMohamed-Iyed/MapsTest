import { FilterQuery, UpdateQuery, UpdateWithAggregationPipeline, model as _model, Types } from 'mongoose';

export type Model<T> = ReturnType<typeof _model<T, any>>;

const Repositorie = <T>(model: Model<T>) => {
  return class {
    static readonly model: Model<T> = model;

    static async create<T>(body: T): Promise<T> {
      return model.create(body);
    }

    static async findById<T>(id: Types.ObjectId): Promise<T | null> {
      return model.findById(id).lean();
    }

    static async findAll<T>(filters: FilterQuery<T>): Promise<T[] | null> {
      return model.find(filters).lean();
    }

    static async findOne<T>(filters: FilterQuery<T>): Promise<T | null> {
      return model.findOne(filters).lean();
    }

    static async updateOne<T>(
      filters: FilterQuery<T>,
      payload: UpdateWithAggregationPipeline | UpdateQuery<T>,
    ): Promise<T | null> {
      return model.updateOne(filters, payload, { new: true }).lean();
    }

    static async deleteOne<T>(filters: FilterQuery<T>): Promise<void> {
      await model.deleteOne(filters);
    }
  };
};

export default Repositorie;
