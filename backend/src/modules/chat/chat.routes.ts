import { Router } from "express";

import { createChatCompletion } from "./chat.controller";

export const chatRouter = Router();

chatRouter.post("/", createChatCompletion);
