import e from "express";
import passport from "passport";
import { getAllUsers, getMyInfo, uploadProfile } from "../controllers/account.controllers.js";
import multer from "multer";

const router = e.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/me', passport.authenticate('jwt', { session: false }), getMyInfo);
router.post('/all', passport.authenticate('jwt', { session: false }), getAllUsers);
router.post('/upladphoto', passport.authenticate('jwt', { session: false }), upload.single('myfile'), uploadProfile);


export default router;