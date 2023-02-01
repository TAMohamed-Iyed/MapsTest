import app from './app';
import { PORT } from './config';
import connectDB from './core/db/connectDB';

connectDB();

app.listen(PORT, () => {
  console.log(`server listen on port : ${PORT}`);
});
