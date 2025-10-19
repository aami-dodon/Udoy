import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { createPresignedUrl } from './uploads.controller.js';

const router = Router();

router.post(
  '/uploads/presign',
  authenticate,
  authorize({
    resource: 'storage:uploads',
    action: (req) => {
      const operation =
        typeof req.body?.operation === 'string' && req.body.operation.trim()
          ? req.body.operation.trim().toLowerCase()
          : 'put';

      return operation === 'get' ? 'read' : 'write';
    },
  }),
  createPresignedUrl
);

export default router;
