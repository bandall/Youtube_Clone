import multer from "multer";
import multerS3 from "multer-s3";
import aws, { S3 } from "aws-sdk";

const s3 = new S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    }
})

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: "wetube-bandall/images",
    acl: 'public-read',
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: "wetube-bandall/videos",
    acl: 'public-read',
});

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "WeTube"
    res.locals.loggedInUser = req.session.user;
    res.locals.isHeroku = isHeroku;
    next();
};

export const protectorMiddleWare = (req, res, next) => {
    if(req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "Not Authorized");
        return res.redirect("/login");
    }
};

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not Authorized");
        res.redirect("/");
    }
};

export const avatarUpload = multer({
    dest:"uploads/avatar",
    limits: {
        fileSize: 3000000,
    },
    storage: isHeroku ? s3ImageUploader : undefined,
});
export const videoUpload = multer({
    dest:"uploads/video",
    limits: {
        fileSize: 1000000000,
    },
    storage: isHeroku ? s3VideoUploader : undefined,
});