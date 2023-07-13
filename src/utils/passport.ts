import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import User from "../models/User";
import dotenv from "dotenv";
import path from "path";
import { generateClientId } from "./client";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const clientID: string = generateClientId();
// Passport OAuth2 Strategy configuration
passport.use(
  "oauth2",
  new OAuth2Strategy(
    {
      authorizationURL: "http://localhost:8000/auth/authorize", // OAuth2 provider's authorization URL
      tokenURL: "http://localhost:8000/auth/token", // OAuth2 provider's token URL
      clientID: clientID, // Client ID from OAuth2 provider
      clientSecret: process.env.CLIENT as string,
      callbackURL: "http://localhost:8000/auth/oauth2/callback",
    },
    async function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) {
      try {
        const user = await User.findOneAndUpdate(
          { oauthID: profile.id },
          {
            $setOnInsert: {
              email: profile.emails[0].value,
              oauthID: profile.id,
            },
          },
          { new: true, upsert: true }
        );

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
