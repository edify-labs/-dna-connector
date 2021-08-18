import express from 'express';
// import { verifyAuthHeader } from './middleware';
import { request } from './controllers';

const router = express.Router();

// router.use(verifyAuthHeader);

router.post('/request', request);

export default router;
