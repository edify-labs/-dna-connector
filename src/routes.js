import express from 'express';
// import { verifyAuthHeader } from './middleware';
import { request, pullLatest, getToken, getWsdl } from './controllers';

const router = express.Router();

// router.use(verifyAuthHeader);

router.post('/request', request);
router.post('/sandbox/request', request);
router.post('/pull-latest', pullLatest);
router.get('/token', getToken);
router.get('/sandbox/token', getToken);
router.get('/sandbox/wsdl/:service', getWsdl);
router.get('/wsdl/:service', getWsdl);
export default router;
