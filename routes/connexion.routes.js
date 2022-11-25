import e from "express";
import passport from "passport";
import { refreshToken, userLogin, userLogout, userSignup } from "../controllers/connexion.controllers.js";

const router = e.Router()

router.post('/login', userLogin);
router.post('/signup', userSignup);
router.post('/logout', passport.authenticate('jwt', { session: false }), userLogout);
router.post('/refreshToken', passport.authenticate('jwt', { session: false }), refreshToken);


export default router;