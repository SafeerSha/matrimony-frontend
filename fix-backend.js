const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendDir = "c:\\Users\\pksaf\\Downloads\\matrimony-backend-production-ready-foundation-v2\\matrimony-backend-prod-v2";

try {
  console.log("Installing cookie-parser...");
  execSync("npm install cookie-parser --legacy-peer-deps && npm install -D @types/cookie-parser --legacy-peer-deps", { cwd: backendDir, stdio: 'inherit' });
} catch (e) {
  console.log("Error installing cookie-parser:", e.message);
}
