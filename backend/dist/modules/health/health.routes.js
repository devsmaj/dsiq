"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const health_controller_1 = require("./health.controller");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get("/", health_controller_1.healthController);
