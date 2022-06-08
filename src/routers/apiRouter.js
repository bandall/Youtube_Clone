import express from "express";
import { registerView, addComment, deleteComment } from "../controllers/videoController";
import { protectorMiddleWare } from "../middlewares";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.all(protectorMiddleWare).post("/videos/:id([0-9a-f]{24})/comment", addComment);
apiRouter.all(protectorMiddleWare).delete("/comment/:id([0-9a-f]{24})", deleteComment);

export default apiRouter;