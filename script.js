const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const message = document.getElementById("message");
const loginBox = document.getElementById("loginBox");

let images = [];
let draggedIndex = null;
let cropIndex = null;
let cropImg = new Image();

// ---------------- LOGIN TOGGLE ----------------
document.getElementById("loginBtn").onclick = toggleLogin;

function toggleLogin() {
  loginBox.style.display =
    loginBox.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function (e) {
  const loginBtn = document.getElementById("loginBtn");

  if (!loginBox.contains(e.target) && e.target !== loginBtn) {
    loginBox.style.display = "none";
  }
});

// ---------------- LOGIN LOGIC ----------------
const loginSubmit = document.getElementById("loginSubmit");
const loginMessage = document.getElementById("loginMessage");

let users = [];

loginSubmit.addEventListener("click", function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "" || password === "") {
    loginMessage.textContent = "Please enter username and password";
    loginMessage.style.color = "red";
    return;
  }

  users.push({ username, password });
  console.log(users);

  loginMessage.textContent = "Login successful ✅";
  loginMessage.style.color = "green";

  setTimeout(() => {
    loginBox.style.display = "none";
    loginMessage.textContent = "";
  }, 1200);

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
});

// ---------------- IMAGE UPLOAD ----------------
imageInput.addEventListener("change", function (e) {
  const files = Array.from(e.target.files);

  files.forEach(function (file) {
    const reader = new FileReader();
    reader.onload = function () {
      images.push(reader.result);
      renderImages();
      message.textContent = "";
    };
    reader.readAsDataURL(file);
  });
});

function renderImages() {
  preview.innerHTML = "";

  images.forEach(function (img, index) {
    const div = document.createElement("div");
    div.className = "image-card";
    div.draggable = true;

    div.innerHTML = `
      <img src="${img}">
      <div class="card-actions">
        <button onclick="openCrop(${index})">Crop</button>
        <button onclick="deleteImage(${index})">✕</button>
      </div>
    `;

    div.addEventListener("dragstart", () => draggedIndex = index);
    div.addEventListener("dragover", e => e.preventDefault());
    div.addEventListener("drop", () => {
      [images[draggedIndex], images[index]] =
      [images[index], images[draggedIndex]];
      renderImages();
    });

    preview.appendChild(div);
  });
}

function deleteImage(index) {
  images.splice(index, 1);
  renderImages();
}

function clearImages() {
  images = [];
  preview.innerHTML = "";
}

// ---------------- CROP ----------------
function openCrop(index) {
  cropIndex = index;
  cropImg.src = images[index];

  const canvas = document.getElementById("cropCanvas");
  const ctx = canvas.getContext("2d");

  cropImg.onload = function () {
    canvas.width = 300;
    canvas.height = 300;
    ctx.drawImage(cropImg, 0, 0, 300, 300);
    document.getElementById("cropBox").style.display = "flex";
  };
}

function applyCrop() {
  const canvas = document.getElementById("cropCanvas");
  images[cropIndex] = canvas.toDataURL("image/jpeg", 0.8);
  closeCrop();
  renderImages();
}

function closeCrop() {
  document.getElementById("cropBox").style.display = "none";
}

// ---------------- PDF ----------------
function convertToPDF() {
  if (images.length === 0) {
    message.textContent = "Please upload images before converting.";
    return;
  }

  const { jsPDF } = window.jspdf;
  const orientation = document.getElementById("orientation").value;
  const pageSize = document.getElementById("pageSize").value;

  const pdf = new jsPDF({ orientation, unit: "mm", format: pageSize });

  images.forEach((img, i) => {
    if (i !== 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 10, 10, 190, 270);
  });

  pdf.save("images.pdf");
}
