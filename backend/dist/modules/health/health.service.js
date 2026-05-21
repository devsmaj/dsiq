"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = getHealthStatus;
function getHealthStatus() {
    return {
        service: "dsiq-backend",
        status: "ok",
        timestamp: new Date().toISOString(),
    };
}
