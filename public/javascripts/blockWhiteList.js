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
      const moveButton = clonedItem.querySelector(
        fromList === "blocklist" ? ".whileListDomainBtn" : ".blockListDomainBtn"
      );
      const editButton = clonedItem.querySelector(".editDomainBtn");
      const deleteButton = clonedItem.querySelector(".deleteDomainBtn");

      // Update move button
      if (toList === "blocklist") {
        window.location.reload();
        moveButton.textContent = "Move to White List";
        editButton.classList.remove("hidden"); // Show edit button
        moveButton.classList.replace("bg-red-500", "bg-green-500");
        moveButton.classList.replace("hover:bg-red-600", "hover:bg-green-600");
        moveButton.classList.replace(
          "focus:ring-red-500",
          "focus:ring-green-500"
        );
        moveButton.classList.replace(
          "blockListDomainBtn",
          "whileListDomainBtn"
        );
      } else {
        moveButton.textContent = "Move to Block List";
        editButton.classList.add("hidden"); // Hide edit button
        moveButton.classList.replace("bg-green-500", "bg-red-500");
        moveButton.classList.replace("hover:bg-green-600", "hover:bg-red-600");
        moveButton.classList.replace(
          "focus:ring-green-500",
          "focus:ring-red-500"
        );
        moveButton.classList.replace(
          "whileListDomainBtn",
          "blockListDomainBtn"
        );
      }

      // Update event listeners
      moveButton.addEventListener("click", function () {
        moveDomain(domainId, toList, fromList);
      });

      editButton.addEventListener("click", function () {
        const domainName = this.getAttribute("data-name");
        const domainList = this.getAttribute("data-list");
        openEditModal(domainId, domainName, domainList);
      });

      deleteButton.addEventListener("click", function () {
        deleteDomain(domainId, toList === "blocklist" ? 1 : 2);
      });

      // Append the new item to the target list and remove the original item
      toListElement.appendChild(clonedItem);
      domainItem.remove();

      // Update the domain status via API
      handleUpdateBlockWhiteList(domainId, toList === "blocklist" ? 1 : 2);
    }
  }

  // API call to update domain status
  function handleUpdateBlockWhiteList(domainId, status) {
    fetch(`/updateStatusDomain/${domainId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blockWhiteStatus: status }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Status updated successfully", data);
      })
      .catch((error) => {
        console.error("Error updating status", error);
      });
  }

  // Handle delete domain functionality
  function deleteDomain(domainId, blockWhiteStatus) {
    if (confirm("Are you sure you want to delete this domain?")) {
      fetch(`/updateStatusDomain/${domainId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blockWhiteStatus: 0 }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Domain deleted successfully", data);
          document.querySelector(`[data-id="${domainId}"]`).remove();
        })
        .catch((error) => {
          console.error("Error deleting domain", error);
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
      const blockWhiteStatus = this.closest("#blocklist-items") ? 1 : 2;
      deleteDomain(domainId, blockWhiteStatus);
    });
  });

  // Activate the first tab by default
  document.querySelector(".tab-btn").click();
});
