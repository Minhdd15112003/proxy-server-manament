async function handleAddDomain(
  domainId,
  domainName,
  statusDomain,
  blockWhiteStatus
) {
  try {
    const response = await fetch(`/postDomain/${domainId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domainName,
        statusDomain,
        blockWhiteStatus,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      const errorDiv = document.getElementById("error-message");
      errorDiv.innerText = result.message;
      errorDiv.classList.remove("hidden");
      return false;
    }
    window.location.reload();
  } catch (error) {
    console.log("handleAddDomain: ", error);
  }
}
// domain.js
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();

  document.querySelectorAll(".tab-content .domain-item").forEach((item) => {
    const domainName = item.querySelector("span").textContent.toLowerCase();

    if (domainName.includes(searchTerm)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
});

const idIp = document.getElementById("domainInput").dataset.id;

document
  .getElementById("blockListDomainBtn")
  .addEventListener("click", async function () {
    const domain = document.getElementById("domainInput").value;
    if (domain) {
      try {
        await handleAddDomain(idIp, domain, true, 1);
        document.getElementById("domainInput").value = "";
      } catch (error) {
        console.log("handleAddDomain: ", error);
      }
    }
  });

document
  .getElementById("whileListDomainBtn")
  .addEventListener("click", async function () {
    const domain = document.getElementById("domainInput").value;
    if (domain) {
      try {
        await handleAddDomain(idIp, domain, true, 2);
        document.getElementById("domainInput").value = "";
      } catch (error) {
        console.log("handleAddDomain: ", error);
      }
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  // Function to handle switching between tabs
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

  // Function to move domains between lists
  function moveDomain(domainId, fromList, toList) {
    const fromListElement = document.getElementById(`${fromList}-items`);
    const toListElement = document.getElementById(`${toList}-items`);
    const domainItem = fromListElement.querySelector(`[data-id="${domainId}"]`);

    if (domainItem) {
      const clonedItem = domainItem.cloneNode(true);
      const button = clonedItem.querySelector("button");

      // Adjust button text and classes based on the target list
      if (toList === "blocklist") {
        button.textContent = "Move to White List";
        button.classList.replace("bg-red-500", "bg-green-500");
        button.classList.replace("hover:bg-red-600", "hover:bg-green-600");
        button.classList.replace("focus:ring-red-500", "focus:ring-green-500");
        button.setAttribute(
          "onclick",
          `moveDomain('${domainId}', 'whitelist', 'blocklist')`
        );
      } else {
        button.textContent = "Move to Block List";
        button.classList.replace("bg-green-500", "bg-red-500");
        button.classList.replace("hover:bg-green-600", "hover:bg-red-600");
        button.classList.replace("focus:ring-green-500", "focus:ring-red-500");
        button.setAttribute(
          "onclick",
          `moveDomain('${domainId}', 'blocklist', 'whitelist')`
        );
      }

      // Append the new item to the target list and remove the original item
      toListElement.appendChild(clonedItem);
      domainItem.remove();

      // Optionally, update the domain status via an API
      handleUpdateBlockWhiteList(domainId, toList === "blocklist" ? 1 : 2);
    }
  }

  // API call to update domain status
  function handleUpdateBlockWhiteList(domainId, status) {
    fetch(`/updateDomain/${domainId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blockWhiteStatus: status }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Cập nhật trạng thái thành công", data);
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật trạng thái", error);
      });
  }

  // Handle delete domain functionality
  function deleteDomain(domainId, blockWhiteStatus) {
    if (confirm("Are you sure you want to delete this domain?")) {
      fetch(`/updateDomain/${domainId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blockWhiteStatus: blockWhiteStatus }),
      })
        .then((response) => response.json())
        .then((data) => {
          window.location.reload();
          console.log("Cập nhật trạng thái thành công", data);
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật trạng thái", error);
        });
    }
  }

  // Attach event listeners for buttons to move domains
  document.querySelectorAll(".whileListDomainBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const domainId = this.closest("li").dataset.id;
      moveDomain(domainId, "blocklist", "whitelist");
    });
  });

  document.querySelectorAll(".blockListDomainBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const domainId = this.closest("li").dataset.id;
      moveDomain(domainId, "whitelist", "blocklist");
    });
  });

  // Attach event listeners to delete domain buttons
  document.querySelectorAll(".deleteDomainBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const domainId = this.closest("li").dataset.id;
      deleteDomain(domainId, 0);
      window.location.reload();
    });
  });

  // Activate the first tab by default
  document.querySelector(".tab-btn").click();
});
