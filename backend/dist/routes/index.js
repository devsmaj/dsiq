"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const chat_routes_1 = require("../modules/chat/chat.routes");
const health_routes_1 = require("../modules/health/health.routes");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.use("/chat", chat_routes_1.chatRouter);
exports.apiRouter.use("/health", health_routes_1.healthRouter);
