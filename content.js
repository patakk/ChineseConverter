const simplifiedToTraditional = {
  '国': '國', '东': '東', '车': '車', '当': '當', '兰': '蘭', '对': '對', '开': '開',
  '门': '門', '见': '見', '长': '長', '飞': '飛', '龙': '龍', '电': '電', '书': '書',
  '马': '馬', '鸟': '鳥', '语': '語', '学': '學', '习': '習', '气': '氣', '历': '歷',
  '岁': '歲', '药': '藥', '华': '華', '实': '實', '说': '說', '读': '讀', '认': '認',
  '让': '讓', '为': '為', '边': '邊', '发': '發', '经': '經', '验': '驗', '党': '黨',
  '观': '觀', '点': '點', '击': '擊', '节': '節', '义': '義', '产': '產', '严': '嚴',
  '众': '眾', '无': '無', '进': '進', '运': '運', '过': '過', '个': '個', '亿': '億',
  '万': '萬', '专': '專', '业': '業', '张': '張', '难': '難', '广': '廣', '从': '從',
  '还': '還', '风': '風', '现': '現', '劳': '勞', '动': '動', '头': '頭', '体': '體',
  '关': '關', '总': '總', '问': '問', '报': '報', '导': '導'
};

const traditionalToSimplified = {};
for (const [simplified, traditional] of Object.entries(simplifiedToTraditional)) {
  traditionalToSimplified[traditional] = simplified;
}

function convertText(text, mapping) {
  console.log("Converting text:", text);
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += mapping[char] || char;
  }
  
  console.log("Conversion result:", result);
  return result;
}

function convertTextWithMapping(text, mapping) {
  console.log("Using fallback conversion with mapping");
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += mapping[char] || char;
  }
  return result;
}

function convertSelection(direction) {
  console.log("Starting conversion with direction:", direction);
  
  try {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      console.log("No selection found");
      return { success: false, error: "No text selected" };
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    if (!selectedText.trim()) {
      console.log("Empty selection");
      return { success: false, error: "Empty selection" };
    }
    
    console.log("Selected text:", selectedText);

    let convertedText = selectedText;
    
    if (typeof OpenCC === 'undefined' || !OpenCC.Converter) {
      console.error("OpenCC library not properly loaded");
      const mapping = direction === "s2t" ? simplifiedToTraditional : traditionalToSimplified;
      convertedText = convertTextWithMapping(selectedText, mapping);
    } else {
      try {
        if (direction === "s2t") {
          const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
          convertedText = converter(selectedText);
        } else {
          const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });
          convertedText = converter(selectedText);
        }
        console.log("Converted text:", convertedText);
      } catch (conversionError) {
        console.error("OpenCC conversion error:", conversionError);
        const mapping = direction === "s2t" ? simplifiedToTraditional : traditionalToSimplified;
        convertedText = convertTextWithMapping(selectedText, mapping);
      }
    }
    
    range.deleteContents();
    range.insertNode(document.createTextNode(convertedText));

    selection.removeAllRanges();
    
    return { success: true, text: convertedText };
  } catch (error) {
    console.error("Error in convertSelection:", error);
    return { success: false, error: error.message };
  }
}

function convertAllText(direction) {
  console.log("Converting all text on page with direction:", direction);
  
  try {
    if (typeof OpenCC === 'undefined' || !OpenCC.Converter) {
      console.error("OpenCC library not properly loaded for page conversion");
      return { success: false, error: "OpenCC library not loaded" };
    }
    
    const converter = OpenCC.Converter({
      from: direction === "s2t" ? 'cn' : 'tw',
      to: direction === "s2t" ? 'tw' : 'cn'
    });
    
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      const parentNode = node.parentNode;
      if (parentNode.tagName === 'SCRIPT' || parentNode.tagName === 'STYLE') {
        continue;
      }
      
      const text = node.nodeValue;
      if (text.trim() && /[\u4e00-\u9fff]/.test(text)) {
        textNodes.push(node);
      }
    }
    
    console.log(`Found ${textNodes.length} text nodes with Chinese characters`);
    
    let convertedCount = 0;
    textNodes.forEach(textNode => {
      const originalText = textNode.nodeValue;
      const convertedText = converter(originalText);
      if (originalText !== convertedText) {
        textNode.nodeValue = convertedText;
        convertedCount++;
      }
    });
    
    console.log(`Successfully converted ${convertedCount} text nodes`);
    return { success: true, count: convertedCount };
  } catch (error) {
    console.error("Error in convertAllText:", error);
    return { success: false, error: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === "convert") {
    try {
      const result = convertSelection(message.direction);
      console.log("Conversion completed:", result);
      sendResponse(result);
    } catch (error) {
      console.error("Conversion error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  else if (message.action === "convertAll") {
    try {
      const result = convertAllText(message.direction);
      console.log("Page conversion completed:", result);
      sendResponse(result);
    } catch (error) {
      console.error("Page conversion error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

