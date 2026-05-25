"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((request, response, next) => {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (request.method === "OPTIONS") {
            response.sendStatus(204);
            return;
        }
        next();
    });
    app.use(express_1.default.json());
    app.get("/", (_request, response) => {
        response.status(200).send("DSIQ backend is running");
    });
    app.use("/api", routes_1.apiRouter);
    return app;
}
