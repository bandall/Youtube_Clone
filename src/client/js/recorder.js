import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { async } from "regenerator-runtime";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumb.jpg"
}

const downloadFile = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
}

const handleDownload = async () => {
    actionBtn.removeEventListener("click", handleDownload);
    actionBtn.innerText = "Transcoding";
    actionBtn.disabled = true;
    const ffmpeg = createFFmpeg({ 
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
        log: true 
    });
    await ffmpeg.load();
    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

    await ffmpeg.run("-i", files.input, "-r", "60", files.output);
    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb);

    const thumbFile = ffmpeg.FS("readFile", files.thumb);
    const jpgBlob = new Blob([thumbFile.buffer], {type : "image/jpg"});
    const jpgUrl = URL.createObjectURL(jpgBlob);

    const mp4File = ffmpeg.FS("readFile", files.output);
    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const mp4Url = URL.createObjectURL(mp4Blob);

    downloadFile(mp4Url, "MyRecording,mp4");
    downloadFile(jpgUrl, "MyThumbnail.jpg");

    ffmpeg.FS("unlink", files.input);
    ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink", files.thumb);

    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(jpgUrl);

    actionBtn.innerText = "Record Again";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleStart);
};

const handleStart = async () => {
    await init();
    actionBtn.innerText = "Stop Recording";
    actionBtn.removeEventListener("click", handleStart);

    recorder = new MediaRecorder(stream, {mimeType: "video/webm"});
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
        actionBtn.innerText = "Download";
        actionBtn.disabled = false;
        actionBtn.addEventListener("click", handleDownload);
    }
    recorder.start();
    setTimeout(() => {
        recorder.stop();
    }, 5000);
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
        video: {
            width: 1024,
            height: 576,
        },
    });
    video.srcObject = stream;
    video.play();
};


actionBtn.addEventListener("click", handleStart);