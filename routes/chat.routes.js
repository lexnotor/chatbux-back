import e from "express";
import passport from "passport";
import { getOneChat, sendMessage, getAllChat } from "../controllers/chat.controllers.js";
import multer from "multer";

const router = e.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/sendtext', passport.authenticate('jwt', { session: false }), sendMessage)
router.post('/sendimage', passport.authenticate('jwt', { session: false }), upload.single('myfile'), sendMessage)
router.get('/getchats', passport.authenticate('jwt', { session: false }), getAllChat)
router.get('/getchat', passport.authenticate('jwt', { session: false }), getOneChat)

export default router