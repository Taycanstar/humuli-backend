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
const User_1 = __importDefault(require("./User"));
const Token_1 = __importDefault(require("./Token"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.default = {
    getUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email });
            if (!user) {
                return false; // user not found
            }
            // Check if the password is valid
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            // const isMatch = await user.isPasswordMatch(password);
            if (!isMatch) {
                return false; // password does not match
            }
            return user;
        });
    },
    saveToken(token, client, user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new token and save it in the database
            const accessToken = new Token_1.default({
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.accessTokenExpiresAt,
                client: client.id,
                user: user._id,
            });
            yield accessToken.save();
            return {
                accessToken: accessToken.accessToken,
                accessTokenExpiresAt: accessToken.accessTokenExpiresAt,
                client: client.id,
                user: user._id,
            };
        });
    },
    getAccessToken(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the token in the database
            const token = yield Token_1.default.findOne({ accessToken: accessToken });
            if (!token) {
                return false; // Token not found
            }
            return {
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.accessTokenExpiresAt,
                client: token.client,
                user: token.user,
            };
        });
    },
    verifyScope(token, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (token.scope === scope) {
                return true; // The token's scope matches the required scope
            }
            return false; // The token's scope does not match the required scope
        });
    },
    getClient(clientId, clientSecret) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement the logic to retrieve the client from the database
            // You can use the provided clientId and clientSecret to find the matching client
            // Return the client object if found, otherwise return false
            // Example:
            // const client = await Client.findOne({ clientId: clientId, clientSecret: clientSecret });
            // return client || false;
        });
    },
};
