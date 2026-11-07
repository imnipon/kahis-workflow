/**
 * check-no-emoji.mjs — ตรวจสอบการเผลอใส่อิโมจิ (Emoji) ในโค้ดและ Markup
 * สแกนไฟล์ .tsx, .ts, .html, .css ในโฟลเดอร์ app, components, lib, styles, docs/02-design-system, public/demo
 *
 * วิธีใช้:
 *   npm run check-icons
 *   node scripts/check-no-emoji.mjs
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const scanDirs = ['app', 'components', 'lib', 'styles', 'docs/02-design-system', 'public/demo'];
const targetExts = new Set(['.tsx', '.ts', '.html', '.css']);

// Regex ตรวจจับช่วง Unicode Emoji ทั่วไป
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

let foundCount = 0;

function scanDir(dir) {
  const fullPath = join(root, dir);
  try {
    const entries = readdirSync(fullPath);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'legacy-mock') continue;
      const subPath = join(fullPath, entry);
      const stat = statSync(subPath);
      if (stat.isDirectory()) {
        scanDir(join(dir, entry));
      } else if (stat.isFile() && targetExts.has(extname(entry))) {
        checkFile(subPath, join(dir, entry));
      }
    }
  } catch (err) {
    // Ignore missing directories
  }
}

function checkFile(filePath, relativePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // ข้ามบรรทัดที่เป็น comment หรือ regex declaration
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    if (line.includes('emojiRegex') || line.includes('[\u{1F300}')) return;

    const match = emojiRegex.exec(line);
    if (match) {
      foundCount++;
      console.warn(`[EMOJI DETECTED] ${relativePath}:${index + 1}`);
      console.warn(`  --> บรรทัดที่ ${index + 1}: ${line.trim()}`);
      console.warn(`  --> พบ Emoji: "${match[0]}" (Unicode: \\u{${match[0].codePointAt(0).toString(16)}})`);
      console.warn('  --> โปรดเปลี่ยนไปใช้ Lucide Icon แทน\n');
    }
  });
}

console.log('--- เริ่มการตรวจสอบ Emoji ในโครงการ KAHIS-Workflow ---');
for (const dir of scanDirs) {
  scanDir(dir);
}

if (foundCount === 0) {
  console.log('✅ ตรวจสอบเรียบร้อย: ไม่พบ Emoji ในโค้ดและ UI Components (ผ่านเกณฑ์)');
  process.exit(0);
} else {
  console.error(`❌ พบ Emoji ในโค้ดทั้งหมด ${foundCount} จุด กรุณาแก้ไขโดยใช้ Lucide Icon แทน`);
  process.exit(1);
}
