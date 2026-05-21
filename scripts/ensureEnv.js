const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..', 'server');
const example = path.join(serverDir, '.env.example');
const target = path.join(serverDir, '.env');

try {
  if (!fs.existsSync(example)) {
    console.log('.env.example not found in server/ — skipping copy');
    process.exit(0);
  }

  if (fs.existsSync(target)) {
    console.log('server/.env already exists — leaving as-is');
    process.exit(0);
  }

  fs.copyFileSync(example, target);
  console.log('Copied server/.env from .env.example');
} catch (err) {
  console.error('Failed to ensure server/.env:', err.message);
  process.exit(1);
}
