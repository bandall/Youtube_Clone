const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const volumnRange = document.getElementById("volumn");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let volumeVal = 0.5;
video.volume = volumeVal;
let controlsTimeOut = null;
let controlsMovementTimeOut = null;

const handlePlay = () => {
    if(video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};


const handleMute = (e) => {
    if(video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumnRange.value = video.muted ? 0 : volumeVal;
};

const handleVolumnChange = (event) => {
    const {target: {value}} = event;
    if(video.muted) {
        video.muted = false;
    }
    volumeVal = value;
    video.volume = value;
}

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
}

const handleTimeUpdate = () => {
    currenTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
}

const handleTimelineChange = (event) => {
    const {target: {value}} = event;
    video.currentTime = value;
}

const handleFullScreen = () => {
    const fullScreen = document.fullscreenElement;
    if(fullScreen) {
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
}

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
    if(controlsTimeOut) {
        clearTimeout(controlsTimeOut);
        controlsTimeOut = null;
    }
    if(controlsMovementTimeOut) {
        clearTimeout(controlsMovementTimeOut);
        controlsMovementTimeOut = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeOut = setTimeout(hideControls, 3000);
}
const handleMouseLeave = () => {
    controlsTimeOut = setTimeout(hideControls, 3000);
}

const handleMouseOver = () => {
    if(controlsTimeOut) {
        clearTimeout(controlsTimeOut);
        controlsTimeOut = null;
    }
    if(controlsMovementTimeOut) {
        clearTimeout(controlsMovementTimeOut);
        controlsMovementTimeOut = null;
    }
}

const handleKeyDownEvent = (event) => {
    if(event.keyCode === 32)
        handlePlay();
    event.preventDefault();
}

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("click", handlePlay);
video.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown", handleKeyDownEvent);
videoControls.addEventListener("mouseover", handleMouseOver);
playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
volumnRange.addEventListener("input", handleVolumnChange);