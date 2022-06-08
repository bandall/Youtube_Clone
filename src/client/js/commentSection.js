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
    span2.innerText = " ❌";
    span2.classList = "video__comment-delete";
    span2.id = "deleteComment";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    span2.addEventListener("click", handleDelete);
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
};

const handleDelete = async (event) => {
    const element = event.target.parentElement;
    const commentId = element.dataset.id;
    const response = await fetch(`/api/comment/${commentId}`, {
        method: "DELETE",
    });
    if(response.status === 204) {
        element.remove();
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