import e from "express";
import passport from "passport";
import { refreshToken, userLogin, userLogout, userSignup } from "../controllers/connexion.controllers";

const router = e.Router()

router.post('/login', userLogin);
router.post('/signup', userSignup);
router.post('/logout', passport.authenticate('jwt'), userLogout);
router.post('/refreshToken', passport.authenticate('jwt'), refreshToken);


export default router;