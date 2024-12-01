// domain.js
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  document
    .querySelectorAll("#active-list li, #allowed-list li, #blocked-list li")
    .forEach((item) => {
      const domainName = item.querySelector("span").textContent.toLowerCase();
      if (domainName.includes(searchTerm)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
});
