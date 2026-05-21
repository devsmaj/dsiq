"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = healthController;
const health_service_1 = require("./health.service");
function healthController(_request, response) {
    response.status(200).json((0, health_service_1.getHealthStatus)());
}
