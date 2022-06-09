import { async } from "regenerator-runtime";
import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import session from "express-session";


export const home = async (req, res) => {
    try {
        const videos = await Video.find({}).sort({createdAt: "desc"}).populate("owner");
        return res.render("home", { pageTitle: "Home", videos: videos});
    } catch (error) {
        return res.render("404");
    }
};
export const watch = async (req, res) => {
    try {
        const { id }= req.params;
        const video = await Video.findById(id).populate("owner").populate("comments");
        if(video == null){
            return res.status(400).render("404", { pageTitle: "Video Not Found!"});
        }
        return res.render("watch", { pageTitle: video.title, video});
    } catch (error) {
        return res.render("404");
    }
};

export const getEdit = async (req, res) => {
    try {
        const { id }= req.params;
        const {
            user: { _id },
        } = req.session;
        const video = await Video.findById(id);
        if(!video){
            return res.status(404).render("404", { pageTitle: "Video Not Found!"});
        }
        if(String(video.owner) !== String(_id)) {
            req.flash("error", "Not Authorized");
            return res.status(403).redirect("/");
        }
        return res.render("edit", { pageTitle: `Edit ${video.title}`, video:video});
    } catch (error) {
        return res.render("404");
    }
};

export const postEdit = async (req, res) => { 
    try {
        const {
            user: { _id },
        } = req.session;
        const { id }= req.params;
        const { title, description, hashtags } = req.body;
        const video = await Video.exists({_id: id});
        if(!video){
            return res.status(404).render("404", { pageTitle: "Video Not Found!"});
        }
        if(String(video.owner) !== String(_id)) {
            req.flash("error", "Not Authorized");
            return res.status(403).redirect("/");
        }
    
        await Video.findByIdAndUpdate(id, {
            title,
            description,
            hashtags: Video.formatHastages(hashtags),
        });
        return res.redirect(`/videos/${id}`);
    } catch (error) {
        return res.render("404");
    }
};
export const search = async (req, res) => {
   try {
        const { keyword } = req.query;
        let videos = [];
        if(keyword) {
            videos = await Video.find({
                title: {
                    $regex: new RegExp(`${keyword}$`, "i")
                },
            }).populate("owner");
            return res.render("search", {pageTitle: "Search", videos});
        }
        return res.render("search", {pageTitle: "Search", videos});
   } catch (error) {
        return res.render("404");
   }
}

export const getUpload = (req, res) => {
    try {
        return res.render("upload", {pageTitle: "Upload Videos"});
    } catch (error) {
        return res.render("404");
    }
}
export const postUpload = async (req, res) => {
    const { video, thumb } = req.files;
    const {
        user: { _id },
    } = req.session;
    const isHeroku = process.env.NODE_ENV === "production";
    //make Default Thumbnail
    let thumUrl;
    if(thumb == null) {
        thumUrl = isHeroku ? "https://wetube-bandall.s3.ap-northeast-2.amazonaws.com/c0a5ab8be74d392c2b9003bb41103d7d" : "/uploads/video/defaultThumb.jpg";
    }
    else {
        thumUrl = isHeroku ? thumb[0].location : thumb[0].path;
    }

    try {
        const { title, description, hashtags } = req.body;
        const newVideo = await Video.create({
            title,
            fileUrl: isHeroku ? video[0].location : video[0].path,
            thumbUrl: thumUrl,
            description,
            owner: _id,
            hashtags: Video.formatHastages(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
    } catch (error) {
        console.log(error);
        return res.status(400).render("upload", {pageTitle: "Upload Videos", errMsg:error._message});
    }
    return res.redirect("/");
}

export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            user: { _id },
        } = req.session;
        const video = await Video.findById(id).populate("owner");
        if(!video){
            return res.status(404).render("404", { pageTitle: "Video Not Found!"});
        }
        console.log(String(video.owner._id), String(_id));
        if(String(video.owner._id) !== String(_id)) {
            req.flash("error", "Not Authorized");
            return res.status(403).redirect("/");
        }
        const comments = video.comments;
        for(let i = 0; i < comments.length; i++) {
            await Comment.findByIdAndDelete(String(comments[i]));
        }
        const user = video.owner;
        for(let i = 0; i < user.videos.length; i++)
        {
            if(String(user.videos[i]) === String(id))
                user.videos.splice(i, 1);
        }
        await user.save();
        await Video.findByIdAndDelete(id);
        return res.redirect("/");
    } catch (error) {
        return res.render("404");
    }
}

export const registerView = async (req, res) => {
   try {
        const { id } = req.params;
        const video = await Video.findById(id);
        if(!video) {
            return res.sendStatus(404);
        }
        video.meta.views = video.meta.views + 1;
        await video.save();
        return res.sendStatus(200);
   } catch (error) {
        return res.render("404");
   }
}

export const addComment = async (req, res) => {
    try {
        const {
            session: { user },
            body: { text },
            params: { id },
        } = req;
        const video = await Video.findById(id);
        if(!video) {
            return res.sendStatus(404);
        }
        const newComment = await Comment.create({
            owner: user._id,
            text,
            video: id
        });
        video.comments.push(newComment._id);
        await video.save();
        return res.status(201).json({ commentId:newComment._id });
    } catch (error) {
        return res.sendStatus(404);
    }
}

export const deleteComment = async (req, res) => {
    try {
        const {
            params: { id },
            session: { user },
        } = req;
        const comment = await Comment.findById(id).populate("owner").populate("video");

        const video = comment.video;
        for(let i = 0; i < video.comments.length; i++)
        {
            if(String(video.comments[i]) === String(id))
                video.comments.splice(i, 1);
        }
        await video.save();
        if(!comment) {
            return res.sendStatus(404);
        }
        if(String(comment.owner._id) !== String(user._id)) {
            return res.sendStatus(403);
        }
        await Comment.findByIdAndDelete(id);
    } catch (error) {
        return res.sendStatus(404);
    }
    return res.sendStatus(204);
};