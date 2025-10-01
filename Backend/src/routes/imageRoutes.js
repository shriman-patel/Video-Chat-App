

import express from 'express';
import { getRandomWallpaper } from '../controller/imageController.js'; 

const router = express.Router();
router.get('/random-wallpaper', getRandomWallpaper); 

export default router;