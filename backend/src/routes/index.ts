import { Router } from "express";

import { chatRouter } from "../modules/chat/chat.routes";
import { healthRouter } from "../modules/health/health.routes";

export const apiRouter = Router();

apiRouter.use("/chat", chatRouter);
apiRouter.use("/health", healthRouter);
