import express from "express";

import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST");
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }

    next();
  });
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.status(200).send("DSIQ backend is running");
  });

  app.use("/api", apiRouter);

  return app;
}
