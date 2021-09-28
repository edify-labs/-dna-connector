import express from 'express';
import { request, pullLatest, getToken, getLogFile, clearLogFile } from './controllers';

const router = express.Router();

router.post('/request', request);
router.post('/sandbox/request', request);
router.post('/pull-latest', pullLatest);
router.get('/token', getToken);
router.get('/sandbox/token', getToken);
router.get('/logFile', getLogFile);
router.delete('/logFile', clearLogFile);

export default router;
