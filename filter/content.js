function blurVideos() {
    chrome.storage.sync.get({ keywords: [] }, (result) => {
        const keywords = result.keywords || [];
        if (!keywords.length) return;

        // Get all video elements on the page
        const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');

        videos.forEach(video => {
            const titleElement = video.querySelector('#video-title');
            if (!titleElement) return;

            const title = titleElement.innerText.toLowerCase();
            if (keywords.some(keyword => title.includes(keyword.toLowerCase()))) {
                // Apply a blur effect and make the video unclickable
                video.style.filter = 'blur(10px)';
                video.style.pointerEvents = 'none';
                titleElement.style.color = '#888'; // Optional: change text color to indicate it's blocked
            }
        });
    });
}

function applyPreferences() {
    chrome.storage.sync.get(['blockShorts', 'blockUrl'], (result) => {
        const blockShorts = result.blockShorts || false;
        const blockUrl = result.blockUrl || false;

        // Block Shorts button
        if (blockShorts) {
            const btn1 = document.querySelector('ytd-mini-guide-entry-renderer[aria-label="Shorts"]');
            const btn2 = document.querySelector('ytd-guide-entry-renderer a#endpoint[title="Shorts"]');

            if (btn1) btn1.style.display = "none";
            if (btn2) btn2.style.display = "none";
        }

        // Block URLs
        if (blockUrl) {
            const urls = document.querySelectorAll('a[href*="/shorts/"]');
            urls.forEach(url => url.style.display = 'none');
        }
    });
}

function setupObservers() {
    // Observer to handle dynamic content changes
    const observer = new MutationObserver(() => {
        blurVideos();
        applyPreferences();
    });

    // Observe the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    blurVideos();
    applyPreferences();
}

// Run the setup function to start observing
setupObservers();

// Listen for messages from background script to update preferences
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updatePreferences') {
        blurVideos();
        applyPreferences();
    }
});
