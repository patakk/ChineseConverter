document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('convertToTraditional').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "convertAll",
        direction: "s2t"
      });
    });
  });

  document.getElementById('convertToSimplified').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "convertAll",
        direction: "t2s"
      });
    });
  });
  
  document.getElementById('aboutLink').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'about.html'
    });
  });
});