"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
exports.chatRouter = (0, express_1.Router)();
exports.chatRouter.post("/", chat_controller_1.createChatCompletion);
