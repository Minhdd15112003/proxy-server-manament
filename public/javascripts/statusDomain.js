//thêm domain

function handleUpdateBlockWhiteList(domainId, blockWhiteStatus) {
  fetch(`/updateDomain/${domainId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ blockWhiteStatus: blockWhiteStatus }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Cập nhật trạng thái thành công", data);
    })
    .catch((error) => {
      console.error("Lỗi khi cập nhật trạng thái", error);
    });
}

function handleWhiteList(domainId) {
  handleUpdateBlockWhiteList(domainId, 2);
  window.location.reload();
}
function handleBlockList(domainId) {
  handleUpdateBlockWhiteList(domainId, 1);
  window.location.reload();
}
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
      body: JSON.stringify({ domainName, statusDomain, blockWhiteStatus }),
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

// New JavaScript for domain input and buttons
const blockDomainBtn = document.getElementById("blockDomainBtn");
blockDomainBtn.addEventListener("click", handelblockDomainBtn);
const id = blockDomainBtn.getAttribute("data-id");
async function handelblockDomainBtn() {
  const domain = document.getElementById("domainInput").value;
  if (domain) {
    try {
      await handleAddDomain(id, domain, false, 0);
      document.getElementById("domainInput").value = "";
    } catch (error) {
      console.log("handleAddDomain: ", error);
    }
  }
}

document
  .getElementById("acceptDomainBtn")
  .addEventListener("click", async function () {
    const domain = document.getElementById("domainInput").value;
    if (domain) {
      try {
        await handleAddDomain(id, domain, true, 0);
        document.getElementById("domainInput").value = "";
      } catch (error) {
        console.log("handleAddDomain: ", error);
      }
    }
  });

document
  .getElementById("blockListDomainBtn")
  .addEventListener("click", async function () {
    const domain = document.getElementById("domainInput").value;
    if (domain) {
      try {
        await handleAddDomain(id, domain, true, 1);
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
        await handleAddDomain(id, domain, true, 2);
        document.getElementById("domainInput").value = "";
      } catch (error) {
        console.log("handleAddDomain: ", error);
      }
    }
  });

// chặn và cho phép truy cập
function handleBlock(domainId) {
  updateDomainStatus(domainId, false);
  moveDomain(domainId, "allowed", "blocked");
}

function handleUnblock(domainId) {
  updateDomainStatus(domainId, true);
  moveDomain(domainId, "blocked", "allowed");
}

function updateDomainStatus(domainId, newStatus) {
  fetch(`/updateDomain/${domainId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Cập nhật trạng thái thành công", data);
    })
    .catch((error) => {
      console.error("Lỗi khi cập nhật trạng thái", error);
    });
}

document
  .getElementById("allowAllRadio")
  .addEventListener("change", function () {
    if (this.checked) {
      console.log("Cho phép tất cả domain");
    }
  });

document
  .getElementById("blockAllRadio")
  .addEventListener("change", function () {
    if (this.checked) {
      console.log("Chặn tất cả domain");
      // Thêm logic để chặn tất cả domain
    }
  });
