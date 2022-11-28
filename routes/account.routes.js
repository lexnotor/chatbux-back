import e from "express";
import passport from "passport";
import { getAllUsers, getMyInfo } from "../controllers/account.controllers.js";

const router = e.Router()

router.post('/me', passport.authenticate('jwt', { session: false }), getMyInfo);
router.post('/all', passport.authenticate('jwt', { session: false }), getAllUsers);


export default router;