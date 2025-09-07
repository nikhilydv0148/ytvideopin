function createPinIconButton() {
  if (document.getElementById("yt-pin-btn")) return;

  const button = document.createElement("button");
  button.id = "yt-pin-btn";
  button.innerHTML = "📌"; // Pin emoji/icon
  button.title = "Pin this moment";

  // Style to match YouTube controls exactly
  button.style.background = "transparent";
  button.style.border = "none";
  button.style.color = "white";
  button.style.fontSize = "16px";
  button.style.cursor = "pointer";
  button.style.padding = "8px";
  button.style.margin = "0";
  button.style.borderRadius = "0";
  button.style.display = "inline-block";
  button.style.verticalAlign = "top";
  button.style.lineHeight = "1";
  button.style.width = "48px";
  button.style.height = "48px";
  button.style.textAlign = "center";
  button.style.boxSizing = "border-box";

  // Simple hover effect
  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  });
  
  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "transparent";
  });

  // Find the right container in YouTube controls
  const controlsRight = document.querySelector(".ytp-right-controls");
  if (controlsRight) {
    // Simply prepend to the right controls - this preserves existing buttons
    controlsRight.prepend(button);
  } else {
    console.warn("YouTube controls not found.");
    return;
  }

  button.addEventListener("click", () => {
    const video = document.querySelector("video");
    if (!video) return alert("No video found!");

    // Prompt user for topic name
    const topic = prompt("Enter a topic name for this moment:");
    if (!topic || topic.trim() === "") {
      return; // User cancelled or entered empty topic
    }

    const currentTime = Math.floor(video.currentTime);
    const videoTitle = document.title.replace(" - YouTube", "");
    const url = new URL(window.location.href);
    url.searchParams.set("t", `${currentTime}s`);

    // Format timestamp for display (MM:SS or HH:MM:SS)
    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }
    };

    const pin = {
      topic: topic.trim(),
      title: videoTitle,
      url: url.toString(),
      timestamp: currentTime,
      formattedTime: formatTime(currentTime),
      addedAt: new Date().toISOString()
    };

    chrome.storage.local.get({ pins: [] }, (result) => {
      const updatedPins = [...result.pins, pin];
      chrome.storage.local.set({ pins: updatedPins }, () => {
        // Show feedback toast with topic name
        showToast(`📌 "${topic}" pinned!`);
      });
    });
  });
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.innerText = msg;
  
  // Position at top right as requested
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.background = "rgba(0, 0, 0, 0.9)";
  toast.style.color = "white";
  toast.style.padding = "12px 18px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = "10000";
  toast.style.fontSize = "14px";
  toast.style.fontFamily = "Roboto, Arial, sans-serif";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  toast.style.animation = "slideInFromRight 0.3s ease-out";
  
  // Add CSS animation
  if (!document.querySelector("#toast-animations")) {
    const style = document.createElement("style");
    style.id = "toast-animations";
    style.textContent = `
      @keyframes slideInFromRight {
        0% {
          transform: translateX(100%);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutToRight {
        0% {
          transform: translateX(0);
          opacity: 1;
        }
        100% {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  
  // Remove toast after 3 seconds with animation
  setTimeout(() => {
    toast.style.animation = "slideOutToRight 0.3s ease-in";
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}

function observeYouTubeChanges() {
  let lastURL = location.href;

  new MutationObserver(() => {
    const currentURL = location.href;
    if (currentURL !== lastURL) {
      lastURL = currentURL;
      if (currentURL.includes("watch?v=")) {
        // Wait for YouTube to fully load the player controls
        setTimeout(createPinIconButton, 1500);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

// Wait for YouTube controls to be available
function waitForYouTubePlayer() {
  const checkPlayer = () => {
    const controlsRight = document.querySelector(".ytp-right-controls");
    if (controlsRight && controlsRight.children.length > 0) {
      createPinIconButton();
    } else {
      setTimeout(checkPlayer, 500);
    }
  };
  checkPlayer();
}

// Initial injection
if (window.location.href.includes("watch?v=")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForYouTubePlayer);
  } else {
    waitForYouTubePlayer();
  }
}

// Start observing for URL changes
observeYouTubeChanges();