import User from "../models/User";
import Video from "../models/Video";
//ideo.find({}, (error, videos) => {});

export const home = async (req, res) => {
    try {
        const videos = await Video.find({}).sort({createdAt: "desc"}).populate("owner");
        console.log(videos);
        return res.render("home", { pageTitle: "Home", videos: videos});
    } catch (error) {
        return res.render("server-error", {error});
    }
};
export const watch = async (req, res) => {
    const { id }= req.params;
    const video = await Video.findById(id).populate("owner");
    if(video == null){
        return res.status(400).render("404", { pageTitle: "Video Not Found!"});
    }
    return res.render("watch", { pageTitle: video.title, video});
};

export const getEdit = async (req, res) => {
    const { id }= req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", { pageTitle: "Video Not Found!"});
    }
    if(String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video:video});
};

export const postEdit = async (req, res) => { 
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
        return res.status(403).redirect("/");
    }

    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHastages(hashtags),
    });
    return res.redirect(`/videos/${id}`);
};
export const search = async (req, res) => {
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
}

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle: "Upload Videos"});
}
export const postUpload = async (req, res) => {
    const { path: fileUrl } = req.file;
    const {
        user: { _id },
    } = req.session;
    try {
        const { title, description, hashtags } = req.body;
        const newVideo = await Video.create({
            title,
            fileUrl,
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
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await findById(id);
    if(!video){
        return res.status(404).render("404", { pageTitle: "Video Not Found!"});
    }
    if(String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}
