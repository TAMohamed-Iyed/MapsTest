import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '.env') });

const PORT = process.env.PORT || 4000;
const DB = process.env.DB_URL || '';

export { PORT, DB };
