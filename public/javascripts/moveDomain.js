// moveDomain.js
function moveDomain(domainId, fromTab, toTab) {
  const item = document.querySelector(
    `#${fromTab}-list li[data-id="${domainId}"]`
  );
  if (item) {
    const newItem = item.cloneNode(true);

    // Điều chỉnh các nút chức năng theo tab đích
    if (toTab === "blocked") {
      newItem
        .querySelector("button")
        .setAttribute("onclick", `handleUnblock('${domainId}')`);
      newItem
        .querySelector("button")
        .classList.remove("bg-red-500", "hover:bg-red-600");
      newItem
        .querySelector("button")
        .classList.add("bg-green-500", "hover:bg-green-600");
      newItem.querySelector("svg").innerHTML =
        '<path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />';
    } else {
      newItem
        .querySelector("button")
        .setAttribute("onclick", `handleBlock('${domainId}')`);
      newItem
        .querySelector("button")
        .classList.remove("bg-green-500", "hover:bg-green-600");
      newItem
        .querySelector("button")
        .classList.add("bg-red-500", "hover:bg-red-600");
      newItem.querySelector("svg").innerHTML =
        '<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />';
    }

    document.querySelector(`#${toTab}-list`).appendChild(newItem);
    item.remove(); // Xóa phần tử gốc khỏi danh sách ban đầu
  }
}
