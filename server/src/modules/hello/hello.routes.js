import { Router } from 'express';
import { helloController } from './hello.controller.js';

const router = Router();

router.get('/', helloController);

export const helloRoutes = router;
