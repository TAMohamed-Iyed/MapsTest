import { Router } from 'express';
import globalErrorHandler from '../middlewares/globalErrorHandler';
import LocationRoutes from './location';

const router = Router();

router.use('/locations', LocationRoutes);

router.use(globalErrorHandler);

export default router;
