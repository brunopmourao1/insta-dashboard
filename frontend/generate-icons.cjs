// Gera ícones PNG para o PWA sem dependências externas
const zlib = require('zlib');
const fs = require('fs');

function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const tb = Buffer.from(type);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([len, tb, data, crcBuf]);
}

function createPNG(size, bg, fg, letter) {
  // bg/fg = [r,g,b]
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  // Draw a simple rounded square bg + letter J approximation using pixels
  const raw = Buffer.alloc(size * (1 + size * 3));
  const cx = size / 2, cy = size / 2, r = size * 0.42;
  const strokeW = Math.max(2, size * 0.07);

  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let pixel;
      if (dist <= r) {
        // Inside circle — draw letter J
        pixel = bg;
        // J: vertical bar on right half
        const jx1 = cx + size * 0.04, jx2 = cx + size * 0.14;
        const jy1 = cy - size * 0.28, jy2 = cy + size * 0.10;
        // J bottom curve
        const jCx = cx - size * 0.01, jCy = cy + size * 0.14;
        const jCr = size * 0.13;
        const jDistC = Math.sqrt((x - jCx) ** 2 + (y - jCy) ** 2);

        if (x >= jx1 && x <= jx2 && y >= jy1 && y <= jy2) pixel = fg;
        else if (
          jDistC >= jCr - strokeW && jDistC <= jCr + strokeW &&
          y >= jCy && x <= jCx + strokeW
        ) pixel = fg;
        // Top serif
        else if (y >= jy1 && y <= jy1 + strokeW * 0.8 && x >= jx1 - size * 0.08 && x <= jx2 + size * 0.05) pixel = fg;
      } else {
        pixel = [19, 19, 20]; // #131314
      }
      const off = y * (1 + size * 3) + 1 + x * 3;
      raw[off] = pixel[0]; raw[off + 1] = pixel[1]; raw[off + 2] = pixel[2];
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Pink brand: #c13584 bg, #ffafd2 fg letter
const bg = [193, 53, 132];
const fg = [255, 175, 210];

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/icon-192.png', createPNG(192, bg, fg));
fs.writeFileSync('public/icon-512.png', createPNG(512, bg, fg));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, bg, fg));
console.log('Icons gerados: icon-192.png, icon-512.png, apple-touch-icon.png');
