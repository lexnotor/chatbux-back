import e from "express";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt"
import { allUserOnline, privateKey } from "./psw-manager/index.js";
import connectRouter from './routes/connexion.routes.js'

const app = e();

app.use(e.urlencoded({ extended: false }));

app.use('/api/v1/connect', connectRouter);



// The passport strategy to use jwt
const passportOption = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: privateKey,
    passReqToCallback: true
}
passport.use(new Strategy(passportOption, (req, jwt_playload, done) => {
    const { id, username } = jwt_playload;
    const userInstance = allUserOnline.find(user => (user.id == id && user.username == username));
    if (!userInstance) {
        return done(null, null)
    }
    const userData = { token: (req.headers.authorization + '').replace(/^Bearer\s*/, ''), ...jwt_playload }
    return done(null, userData)
}))


export default app