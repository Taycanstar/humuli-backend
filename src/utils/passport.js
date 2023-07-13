"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_oauth2_1 = require("passport-oauth2");
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("./client");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const clientID = (0, client_1.generateClientId)();
// Passport OAuth2 Strategy configuration
passport_1.default.use("oauth2", new passport_oauth2_1.Strategy({
    authorizationURL: "http://localhost:8000/auth/authorize",
    tokenURL: "http://localhost:8000/auth/token",
    clientID: clientID,
    clientSecret: process.env.CLIENT,
    callbackURL: "http://localhost:8000/auth/oauth2/callback",
}, function (accessToken, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findOneAndUpdate({ oauthID: profile.id }, {
                $setOnInsert: {
                    email: profile.emails[0].value,
                    oauthID: profile.id,
                },
            }, { new: true, upsert: true });
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    });
}));
exports.default = passport_1.default;
