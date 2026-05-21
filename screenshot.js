// Quick screenshot helper using CDP
const http = require('http');

const CHROME_DEBUG_PORT = 9222;
const WIDTH = 1440;
const HEIGHT = 900;
const TARGET_URL = 'http://localhost:8080';
const SCROLL_POSITIONS = [0, 950, 1900, 2850, 3800, 4750, 5700];
const OUTPUT_DIR = '/Users/jaredrice/Documents/Antigravity Agents/good-guys-golf';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// Use CDP to send commands
function sendCDP(wsUrl, method, params = {}) {
  return new Promise((resolve, reject) => {
    const WebSocket = require('ws');
    // ... complex, let's use a simpler approach
  });
}

// Actually, let's just use multiple headless runs at different scroll positions
// by injecting scroll via a data URL wrapper
async function main() {
  const { execSync } = require('child_process');
  const fs = require('fs');
  
  for (let i = 0; i < SCROLL_POSITIONS.length; i++) {
    const scrollY = SCROLL_POSITIONS[i];
    const dataUrl = `data:text/html,<html><body style="margin:0;padding:0;overflow:hidden"><iframe src="${TARGET_URL}" style="width:${WIDTH}px;height:10000px;border:none;margin-top:-${scrollY}px"></iframe></body></html>`;
    
    const outFile = `${OUTPUT_DIR}/preview-section-${i}.png`;
    try {
      execSync(`/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --headless --disable-gpu --screenshot="${outFile}" --window-size=${WIDTH},${HEIGHT} "${dataUrl}" 2>/dev/null`, {
        timeout: 15000
      });
      console.log(`Captured section ${i} at scroll ${scrollY}px -> ${outFile}`);
    } catch(e) {
      console.error(`Failed section ${i}: ${e.message}`);
    }
  }
}

main();
