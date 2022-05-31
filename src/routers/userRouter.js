import express from "express"
import { 
    remove,
    logout, 
    see, 
    startGithubLogin, 
    finishGithubLogin,
    postEdit,
    getEdit,
 } from "../controllers/userController";
import { protectorMiddleWare, publicOnlyMiddleware } from "../middlewares";
const userRouter = express.Router();

userRouter.route("/edit").all(protectorMiddleWare).get(getEdit).post(postEdit);
userRouter.get("/logout", protectorMiddleWare, logout);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/callback", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see);
export default userRouter;