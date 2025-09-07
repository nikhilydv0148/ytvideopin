function loadPins() {
  chrome.storage.local.get({ pins: [] }, (result) => {
    const pins = result.pins;
    const container = document.getElementById("pins");
    container.innerHTML = "";

    if (pins.length === 0) {
      container.innerHTML = "<p>No pins yet. Start pinning moments on YouTube!</p>";
      return;
    }

    pins.forEach((pin, index) => {
      const pinDiv = document.createElement("div");
      pinDiv.className = "pin";

      // Topic as main title
      const title = document.createElement("div");
      title.className = "pin-title";
      title.innerText = pin.topic || "Untitled Pin";

      // Video title as subtitle
      const sub = document.createElement("div");
      sub.className = "pin-topic";
      sub.innerText = pin.title || "Unknown Video";

      // Time with formatted display
      const time = document.createElement("div");
      time.className = "pin-time";
      
      // Use formatted time if available, otherwise calculate it
      let timeDisplay;
      if (pin.formattedTime) {
        timeDisplay = pin.formattedTime;
      } else {
        const minutes = Math.floor(pin.timestamp / 60);
        const seconds = pin.timestamp % 60;
        timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
      time.innerText = `${timeDisplay}`;

      // Watch button
      const watchBtn = document.createElement("button");
      watchBtn.className = "btn-watch";
      watchBtn.innerText = "Watch";
      watchBtn.style.background = "#38b000";
  watchBtn.style.border = "none";
  watchBtn.style.color = "white";
   watchBtn.style.borderRadius = "6px";
    watchBtn.style.padding = "3px 5px";
    watchBtn.style.cursor="pointer";
      watchBtn.onclick = () => window.open(pin.url, '_blank');

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.className = "btn-delete";
      delBtn.innerText = "Delete";
      delBtn.onclick = () => deletePin(index);

      // Button container for better layout
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "pin-buttons";
      buttonContainer.appendChild(watchBtn);
      buttonContainer.appendChild(delBtn);

      // Append all elements
      pinDiv.appendChild(title);
      pinDiv.appendChild(sub);
      pinDiv.appendChild(time);
      pinDiv.appendChild(buttonContainer);

      container.appendChild(pinDiv);
    });
  });
}

function deletePin(index) {
  if (confirm("Are you sure you want to delete this pin?")) {
    chrome.storage.local.get({ pins: [] }, (result) => {
      const pins = result.pins;
      pins.splice(index, 1);
      chrome.storage.local.set({ pins }, () => {
        loadPins(); // Refresh UI
      });
    });
  }
}

// Clear all pins function (optional)
function clearAllPins() {
  if (confirm("Are you sure you want to delete ALL pins? This cannot be undone.")) {
    chrome.storage.local.set({ pins: [] }, () => {
      loadPins(); // Refresh UI
    });
  }
}

// Search/filter function (optional)
function searchPins() {
  const searchTerm = document.getElementById("search-input")?.value.toLowerCase() || "";
  
  chrome.storage.local.get({ pins: [] }, (result) => {
    const pins = result.pins;
    const container = document.getElementById("pins");
    container.innerHTML = "";

    const filteredPins = pins.filter(pin => 
      (pin.topic || "").toLowerCase().includes(searchTerm) ||
      (pin.title || "").toLowerCase().includes(searchTerm)
    );

    if (filteredPins.length === 0) {
      container.innerHTML = searchTerm ? 
        "<p>No pins found matching your search.</p>" : 
        "<p>No pins yet. Start pinning moments on YouTube!</p>";
      return;
    }

    filteredPins.forEach((pin, index) => {
      // Find original index for delete functionality
      const originalIndex = pins.findIndex(p => p === pin);
      
      const pinDiv = document.createElement("div");
      pinDiv.className = "pin";

      const title = document.createElement("div");
      title.className = "pin-title";
      title.innerText = pin.topic || "Untitled Pin";

      const sub = document.createElement("div");
      sub.className = "pin-topic";
      sub.innerText = pin.title || "Unknown Video";

      const time = document.createElement("div");
      time.className = "pin-time";
      
      let timeDisplay;
      if (pin.formattedTime) {
        timeDisplay = pin.formattedTime;
      } else {
        const minutes = Math.floor(pin.timestamp / 60);
        const seconds = pin.timestamp % 60;
        timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
      time.innerText = `${timeDisplay}`;

      const watchBtn = document.createElement("button");
      watchBtn.className = "btn-watch";
      watchBtn.innerText = "Watch";
      watchBtn.onclick = () => window.open(pin.url, '_blank');

      const delBtn = document.createElement("button");
      delBtn.className = "btn-delete";
      delBtn.innerText = "Delete";
      delBtn.onclick = () => deletePin(originalIndex);

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "pin-buttons";
      buttonContainer.appendChild(watchBtn);
      buttonContainer.appendChild(delBtn);

      pinDiv.appendChild(title);
      pinDiv.appendChild(sub);
      pinDiv.appendChild(time);
      pinDiv.appendChild(buttonContainer);

      container.appendChild(pinDiv);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPins();
  
  // Add event listeners for search functionality if search input exists
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", searchPins);
  }
  
  // Add event listener for clear all button if it exists
  const clearAllBtn = document.getElementById("clear-all-btn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", clearAllPins);
  }
});