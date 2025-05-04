chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "chineseConverterMenu",
    title: "Chinese Text Converter",
    contexts: ["page", "selection"]
  });
  
  chrome.contextMenus.create({
    id: "toTraditional",
    parentId: "chineseConverterMenu",
    title: "Convert Selection to Traditional",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "toSimplified",
    parentId: "chineseConverterMenu",
    title: "Convert Selection to Simplified",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "allToTraditional",
    parentId: "chineseConverterMenu",
    title: "Convert All to Traditional",
    contexts: ["page"]
  });
  
  chrome.contextMenus.create({
    id: "allToSimplified",
    parentId: "chineseConverterMenu",
    title: "Convert All to Simplified",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toTraditional" || info.menuItemId === "toSimplified") {
    const direction = info.menuItemId === "toTraditional" ? "s2t" : "t2s";
    
    chrome.tabs.sendMessage(tab.id, {
      action: "convert",
      direction: direction
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
              action: "convert",
              direction: direction
            });
          }, 100);
        });
      }
    });
  } 
  else if (info.menuItemId === "allToTraditional" || info.menuItemId === "allToSimplified") {
    const direction = info.menuItemId === "allToTraditional" ? "s2t" : "t2s";
    
    chrome.tabs.sendMessage(tab.id, {
      action: "convertAll",
      direction: direction
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
              action: "convertAll",
              direction: direction
            });
          }, 100);
        });
      }
    });
  }
});

