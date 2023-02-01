import mongoose from 'mongoose';
import { DB } from '../../config';

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(DB);
  console.log('DB conenction successful!');
};

export default connectDB;
