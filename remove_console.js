const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'lib', 'api.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// The block to remove is:
//       // Log error details for debugging (only in development)
//       if (process.env.NODE_ENV === "development") {
//         console.error("API Error:", { url: API_BASE_URL, error: err });
//       }
// And similar blocks for API_WORK_ORDER_URL

const regex1 = /[ \t]*\/\/[^\n]*Log error details for debugging[^\n]*\n[ \t]*if \(process\.env\.NODE_ENV === "development"\) \{\n[ \t]*console\.error\("API Error:", \{ url: [^,]+, error: err \}\);\n[ \t]*\}\n/g;

content = content.replace(regex1, '');

fs.writeFileSync(apiPath, content, 'utf8');
console.log('Removed console.error blocks');
