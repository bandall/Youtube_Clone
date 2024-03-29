import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required:true, trim: true, maxlength:80 },
    fileUrl: { type: String, required: true },
    thumbUrl: { type: String },
    description:  { type: String, required:true, trim: true, maxlength: 200 },
    createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{type: String, trim: true}],
    meta: {
        views:{ type:Number, default: 0, required:true },
        rating:{ type:Number, default: 0, required: true },
    },
    comments: [{ type:mongoose.Schema.Types.ObjectId, required: true, ref:"Comment" }],
    owner: { type:mongoose.Schema.Types.ObjectId, required: true, ref:"User" },
});

videoSchema.static('formatHastages', function(hashtags) {
    return hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`);
})
videoSchema.static("changePathSlash", function(urlPath) {
    return urlPath.replace("/\\/g", "/");
})
const Video = mongoose.model("Video", videoSchema);
export default Video;