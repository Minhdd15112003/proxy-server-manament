// tabs.js
document.querySelectorAll(".tab-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".tab-content").forEach(function (content) {
      content.classList.add("hidden");
    });
    document.getElementById(this.dataset.tab).classList.remove("hidden");
    document.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.classList.remove("bg-white", "border-b-2", "border-blue-500");
      btn.classList.add("bg-gray-200");
    });
    this.classList.remove("bg-gray-200");
    this.classList.add("bg-white", "border-b-2", "border-blue-500");
  });
});

document.querySelector(".tab-btn").click();
