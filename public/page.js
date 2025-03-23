// List of videos to play in sequence
const videos = ["Video1.mp4", "Video2.mp4", "Video3.mp4"];

let videoIndex = 0; // Track the current video
const videoPlayer = document.getElementById("videoPlayer");

// Function to play the next video
function playNextVideo() {
    videoPlayer.src = videos[videoIndex];
    videoPlayer.play();
    videoIndex = (videoIndex + 1) % videos.length; // Loop back to the first video
}

// When the video ends, play the next one
videoPlayer.addEventListener("ended", playNextVideo);

// Start playing the first video
playNextVideo();
