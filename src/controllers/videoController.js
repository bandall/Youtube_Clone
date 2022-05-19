export const trending = (req, res) => {
    const videos = [
        {
            title: "Hello",
            rating:5,
            comments:2,
            createdAt: "2 minutes ago",
            views: 59,
            id: 1,
        },
        {
            title: "Hello",
            rating:5,
            comments:2,
            createdAt: "2 minutes ago",
            views: 59,
            id: 1,
        }, 
        {
            title: "Hello",
            rating:5,
            comments:2,
            createdAt: "2 minutes ago",
            views: 59,
            id: 1,
        },
    ]
    res.render("home", {pageTitle: "Home", videos});
}
export const see = (req, res) => res.render("watch");
export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => res.send("Delete Video");
