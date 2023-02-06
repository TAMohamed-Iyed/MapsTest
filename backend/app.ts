import express from 'express';
import router from './routes';
import compress from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import nocache from 'nocache';

const app = express();

app.use(hpp());
app.use(helmet());
app.use(nocache());
app.use(bodyParser.json());
app.use(compress());
app.use(morgan('tiny'));
app.use(cors());

//swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Map API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/**/*.ts'],
};

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

app.use('/api', router);

export default app;
