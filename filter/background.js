// background.js (Service Worker for Manifest V3)

// Initialize default settings when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    // Set default preferences if none exist
    chrome.storage.sync.get(['keywords', 'blockShorts', 'blockUrl', 'channelIds'], (result) => {
        if (result.keywords === undefined || result.blockShorts === undefined || result.blockUrl === undefined || result.channelIds === undefined) {
            chrome.storage.sync.set({
                keywords: [],
                channelIds: [],
                blockShorts: false,
                blockUrl: false
            });
        }
    });
});

// Listen for changes in preferences and notify content scripts
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        if (changes.keywords || changes.blockShorts || changes.blockUrl || changes.channelIds) {
            // Notify content script to apply new settings
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'updatePreferences' });
            });
        }
}
});
