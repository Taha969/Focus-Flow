const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const blockSitesInput = document.getElementById("blockSites");
const minutesInput = document.getElementById("minutes");
const statusDiv = document.getElementById("status");

// Load saved state
chrome.storage.local.get(["isFocusing", "blockedSites", "endTime"], (data) => {
    if (data.blockedSites) {
        blockSitesInput.value = data.blockedSites;
    }
    
    if (data.isFocusing && data.endTime > Date.now()) {
        showFocusState(true);
        updateStatus(data.endTime);
    } else {
        showFocusState(false);
    }
});

startBtn.addEventListener("click", () => {
    const minutes = parseInt(minutesInput.value);
    const sites = blockSitesInput.value;

    if (!minutes || minutes <= 0) return;

    const endTime = Date.now() + (minutes * 60 * 1000);

    chrome.storage.local.set({
        isFocusing: true,
        blockedSites: sites,
        endTime: endTime
    });

    chrome.runtime.sendMessage({ action: "startTimer", minutes: minutes });
    showFocusState(true);
    updateStatus(endTime);
});

stopBtn.addEventListener("click", () => {
    chrome.storage.local.set({ isFocusing: false });
    chrome.runtime.sendMessage({ action: "stopTimer" });
    showFocusState(false);
    statusDiv.textContent = "";
});

function showFocusState(isFocusing) {
    if (isFocusing) {
        startBtn.classList.add("hidden");
        blockSitesInput.disabled = true;
        minutesInput.disabled = true;
        stopBtn.classList.remove("hidden");
    } else {
        startBtn.classList.remove("hidden");
        blockSitesInput.disabled = false;
        minutesInput.disabled = false;
        stopBtn.classList.add("hidden");
    }
}

function updateStatus(endTime) {
    const interval = setInterval(() => {
        const now = Date.now();
        const left = endTime - now;
        
        if (left <= 0) {
            clearInterval(interval);
            showFocusState(false);
            statusDiv.textContent = "Session Complete!";
            return;
        }

        const m = Math.floor(left / 60000);
        statusDiv.textContent = `Focusing... ${m + 1} min left`;
    }, 1000);
}