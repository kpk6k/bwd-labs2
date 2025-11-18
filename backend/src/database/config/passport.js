import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import userModel from "../model/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const user = await userModel.findByPk(payload.id);
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

export default passport;
