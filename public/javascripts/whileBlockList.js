function handleSetlist(domainId) {}

function handleAddDomain(
  domainId,
  domainName,
  statusDomain,
  blockWhiteStatus
) {}

// New JavaScript for domain input and buttons
const blockDomainBtn = document.getElementById("blockDomainBtn");
blockDomainBtn.addEventListener("click", handelblockDomainBtn);

function handelblockDomainBtn() {
  const domain = document.getElementById("domainInput").value;
  if (domain) {
    console.log("block Domain domain:", domain);
    // Add logic to block the domain
    const id = blockDomainBtn.getAttribute("data-id");
    console.log("id", id);
    document.getElementById("domainInput").value = "";
  }
}

document
  .getElementById("acceptDomainBtn")
  .addEventListener("click", function () {
    const domain = document.getElementById("domainInput").value;
    if (domain) {
      console.log("Accepting domain:", domain);
      // Add logic to accept the domain
      document.getElementById("domainInput").value = "";
    }
  });

document
  .getElementById("blockListDomainBtn")
  .addEventListener("click", function () {
    const domain = document.getElementById("domainInput").value;
    if (domain) {
      console.log("BlockListing domain:", domain);
      // Add logic to blockList the domain
      document.getElementById("domainInput").value = "";
    }
  });

document
  .getElementById("whileListDomainBtn")
  .addEventListener("click", function () {
    const domain = document.getElementById("domainInput").value;
    if (domain) {
      console.log("whileListDomainBtn domain:", domain);
      // Add logic to blockList the domain
      document.getElementById("domainInput").value = "";
    }
  });
