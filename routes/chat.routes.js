import e from "express";
import passport from "passport";
import { getOneChat, sendMessage } from "../controllers/chat.controllers.js";

const router = e.Router()

router.post('/sendtext', passport.authenticate('jwt', { session: false }), sendMessage)
router.get('/getchat', passport.authenticate('jwt', { session: false }), getOneChat)

export default router