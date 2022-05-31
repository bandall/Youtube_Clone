import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    //console.log(req.session);
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "WeTube"
    res.locals.loggedInUser = req.session.user;
    next();
};

export const protectorMiddleWare = (req, res, next) => {
    if(req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login");
    }
};

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        return next();
    } else {
        res.redirect("/");
    }
};

export const uploadFiles = multer({
    dest:"uploads/"
});