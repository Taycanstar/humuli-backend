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
const oauth2_server_1 = require("oauth2-server");
const oauthModel_1 = __importDefault(require("../models/oauthModel"));
const oauth = new oauth2_server_1.OAuth2Server({
    model: oauthModel_1.default,
});
const oauthServer = {
    oauth,
    authenticate: () => (req, res, next) => {
        return oauth.authenticate()(req, res, next);
    },
    authorizeEndpoint: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield oauth.authorize()(req, res, next);
            // Handle the result if needed
        }
        catch (error) {
            // Handle any error that occurred during authorization
            next(error);
        }
    }),
    tokenEndpoint: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield oauth.token()(req, res, next);
            // Handle the result if needed
        }
        catch (error) {
            // Handle any error that occurred during token generation
            next(error);
        }
    }),
};
exports.default = oauthServer;
