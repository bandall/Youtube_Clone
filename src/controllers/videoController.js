import Video from "../models/Video";
//ideo.find({}, (error, videos) => {});

export const home = async (req, res) => {
    try {
        const videos = await Video.find({});
        console.log(videos);
        return res.render("home", { pageTitle: "Home", videos: videos});
    } catch (error) {
        return res.render("server-error", {error});
    }
};
export const watch = (req, res) => {
    const { id }= req.params;

    res.render("watch", { pageTitle: `Watching`});
};
export const getEdit = (req, res) => {
    const { id }= req.params;
    res.render("edit", { pageTitle: `Editing`});
};
export const postEdit = (req, res) => { 
    const { id }= req.params;
    const { title } = req.body;
    return res.redirect(`/videos/${id}`);
};
export const search = (req, res) => {

}

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle: "Upload Videos"});
}
export const postUpload = async (req, res) => {
    try {
        const { title, description, hashtags } = req.body;
        await Video.create({
            title,
            description,
            hashtags: hashtags.split(",").map((word) => `#${word}`),
        });
    } catch (error) {
        console.log(error);
        return res.render("upload", {pageTitle: "Upload Videos", errMsg:error._message});
    }
    return res.redirect("/");
}
