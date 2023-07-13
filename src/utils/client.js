"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateClientId = void 0;
const uuid_1 = require("uuid");
const generateClientId = () => {
    const clientId = (0, uuid_1.v4)();
    return clientId;
};
exports.generateClientId = generateClientId;
