import { async } from "regenerator-runtime";
const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteComments = document.querySelectorAll("#deleteComment");

const addFakeComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment"
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span);
    videoComments.prepend(newComment);
}

const handleSubmit = async (event) => {
    const textarea = form.querySelector("textarea");
    event.preventDefault();
    const text = textarea.value;
    if(text === "") return;
    const videoId = videoContainer.dataset.id;
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    
    
    if(response.status === 201)  {
        const { commentId } = await response.json();
        addFakeComment(text, commentId);
        textarea.value = "";
    }
    //window.location.reload();
};

const handleDelete = async (event) => {
    console.log("Here");
    const videoId = videoContainer.dataset.id;
    const commentId = event.target.parentElement.dataset.id;
    const response = await fetch(`/api/comment/${commentId}`, {
        method: "DELETE",
    });
    if(response.status === 204) {
        console.log("success");
    }
    else {
        console.log("fail");
    }
}

if(form) {
    form.addEventListener("submit", handleSubmit);
}

if(deleteComments) {
    deleteComments.forEach((del)=> {
        del.addEventListener("click", handleDelete);
    });
}