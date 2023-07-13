"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.token = exports.decision = exports.authorization = void 0;
const passport_1 = __importDefault(require("passport"));
const oauth2orize_1 = __importDefault(require("oauth2orize"));
const Token_1 = __importDefault(require("../models/Token"));
const Code_1 = __importDefault(require("../models/Code"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Client_1 = __importDefault(require("../models/Client"));
const server = oauth2orize_1.default.createServer();
server.serializeClient(function (client, done) {
    done(null, client._id);
});
server.deserializeClient(function (id, done) {
    Client_1.default.findById(id, function (err, client) {
        if (err) {
            return done(err);
        }
        return done(null, client);
    });
});
server.grant(oauth2orize_1.default.grant.code(function (client, redirectUri, user, ares, done) {
    const code = crypto_1.default.randomBytes(32).toString("hex");
    const ac = new Code_1.default({
        value: code,
        clientId: client.id,
        redirectUri: redirectUri,
        userId: user._id,
    });
    ac.save()
        .then((code) => {
        done(null, code);
    })
        .catch((err) => {
        done(err);
    });
}));
server.exchange(oauth2orize_1.default.exchange.code(function (client, code, redirectUri, done) {
    Code_1.default.findOne({ value: code }, function (err, authCode) {
        if (err) {
            return done(err);
        }
        if (!authCode) {
            return done(null, false);
        }
        if (client.id.toString() !== authCode.clientId) {
            return done(null, false);
        }
        if (client.redirectUri.toString() !== redirectUri) {
            return done(null, false);
        }
        authCode.remove(function (err) {
            if (err) {
                return done(err);
            }
            const token = jsonwebtoken_1.default.sign({ _id: authCode.userId }, process.env.SECRET, { expiresIn: "1h" });
            const accessToken = new Token_1.default({
                value: token,
                clientId: authCode.clientId,
                userId: authCode.userId,
            });
            accessToken
                .save()
                .then(() => {
                done(null, token);
            })
                .catch((err) => {
                done(err);
            });
        });
    });
}));
exports.authorization = [
    passport_1.default.authenticate("local", { session: false }),
    server.authorization(function (clientId, redirectUri, done) {
        Client_1.default.findOne({ id: clientId }, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.redirectUri.toString() !== redirectUri) {
                return done(null, false);
            }
            return done(null, client, redirectUri);
        });
    }),
    function (req, res) {
        var _a, _b;
        res.json({
            transactionID: (_a = req.oauth2) === null || _a === void 0 ? void 0 : _a.transactionID,
            user: req.user,
            client: (_b = req.oauth2) === null || _b === void 0 ? void 0 : _b.client,
        });
    },
];
exports.decision = [
    passport_1.default.authenticate("local", { session: false }),
    server.decision(),
];
exports.token = [
    passport_1.default.authenticate("local", { session: false }),
    server.token(),
    server.errorHandler(),
];
