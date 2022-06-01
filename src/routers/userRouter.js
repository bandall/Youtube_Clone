import express from "express"
import { 
    remove,
    logout, 
    see, 
    startGithubLogin, 
    finishGithubLogin,
    postEdit,
    getEdit,
    getChangePassword,
    postChangePassword,
 } from "../controllers/userController";
import { protectorMiddleWare, publicOnlyMiddleware, avatarUpload } from "../middlewares";
const userRouter = express.Router();

userRouter.route("/edit").all(protectorMiddleWare).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/logout", protectorMiddleWare, logout);
userRouter.route("/change-password").all(protectorMiddleWare).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/callback", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see);
export default userRouter;