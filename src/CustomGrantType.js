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
Object.defineProperty(exports, "__esModule", { value: true });
const oauth2_server_1 = require("oauth2-server");
class CustomGrantType {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate the request parameters
                const { grant_type, custom_parameter } = req.body;
                if (grant_type !== "custom_grant_type") {
                    throw new oauth2_server_1.InvalidGrantError("Invalid grant type");
                }
                if (!custom_parameter) {
                    throw new oauth2_server_1.InvalidGrantError("Missing custom parameter");
                }
                // Perform custom logic and generate access token
                const accessToken = oauth2_server_1.OAuthUtils.generateToken();
                const accessTokenExpiresIn = 3600; // Set the expiration time in seconds
                // Return the access token in the response
                return res.json({
                    access_token: accessToken,
                    token_type: "Bearer",
                    expires_in: accessTokenExpiresIn,
                });
            }
            catch (error) {
                // Handle any errors that occurred during the custom grant type handling
                return res.status(error.code || 500).json({
                    error: error.name,
                    error_description: error.message,
                });
            }
        });
    }
}
exports.default = CustomGrantType;
