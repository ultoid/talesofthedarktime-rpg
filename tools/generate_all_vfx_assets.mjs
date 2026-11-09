import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateSync } from "node:zlib";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const PIXELFX_DIR = join(ROOT, "temp_pixelfx");
const OUT_DIR = join(ROOT, "database", "vfx assets");

const CRC = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC[n] = c;
}
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4), body = Buffer.concat([Buffer.from(type, "ascii"), data]), crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodeFastPNG(w, h, rgba) {
  const stride = w * 4, raw = Buffer.allocUnsafe((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    const o = y * (stride + 1);
    raw[o] = 1; // Sub filter
    let prevR = 0, prevG = 0, prevB = 0, prevA = 0;
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 4) {
      const r = rgba[rowOffset + x];
      const g = rgba[rowOffset + x + 1];
      const b = rgba[rowOffset + x + 2];
      const a = rgba[rowOffset + x + 3];
      raw[o + 1 + x] = (r - prevR) & 255;
      raw[o + 1 + x + 1] = (g - prevG) & 255;
      raw[o + 1 + x + 2] = (b - prevB) & 255;
      raw[o + 1 + x + 3] = (a - prevA) & 255;
      prevR = r; prevG = g; prevB = b; prevA = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function renderEffectVariants(id, outDir) {
  const fxlib = await import(pathToFileURL(join(PIXELFX_DIR, "tools", "lib", "fxlib.mjs")).href);
  const { PAL } = await import(pathToFileURL(join(PIXELFX_DIR, "src", "core", "color.js")).href);
  
  const fx = await fxlib.loadEffect(id, join(PIXELFX_DIR, "src", "fx"));
  const [cat, name] = id.split("/");
  const targetDir = join(outDir, cat, name);
  mkdirSync(targetDir, { recursive: true });

  const hasPalette = fx.meta.options && fx.meta.options.palette;
  const paletteList = hasPalette 
    ? ["default", ...Object.keys(PAL)]
    : ["default"];

  let baseJson = null;

  for (const palName of paletteList) {
    const opts = palName === "default" ? { bg: "none" } : { bg: "none", options: { palette: PAL[palName] } };
    const r = fxlib.renderFrames(fx, opts);
    const { w, h, frames, fps } = r, n = frames.length;
    const cols = Math.min(n, Math.max(1, Math.ceil(Math.sqrt((n * h) / w)))), rows = Math.ceil(n / cols);
    const totalW = cols * w, totalH = rows * h;
    
    const dst32 = new Uint32Array(totalW * totalH);
    frames.forEach((f, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const dstX = col * w, dstY = row * h;
      const src32 = new Uint32Array(f.clear.buffer, f.clear.byteOffset, w * h);
      for (let yy = 0; yy < h; yy++) {
        dst32.set(src32.subarray(yy * w, yy * w + w), (dstY + yy) * totalW + dstX);
      }
    });

    const pngBuf = encodeFastPNG(totalW, totalH, new Uint8Array(dst32.buffer));
    const pngPath = join(targetDir, `${name}_${palName}.png`);
    writeFileSync(pngPath, pngBuf);

    if (!baseJson) {
      const jsonFrames = [];
      frames.forEach((f, i) => {
        const x = (i % cols) * w, y = Math.floor(i / cols) * h;
        jsonFrames.push({
          filename: `${name} ${i}`,
          frame: { x, y, w, h },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w, h },
          sourceSize: { w, h },
          duration: Math.round(1000 / fps)
        });
      });
      baseJson = {
        frames: jsonFrames,
        meta: {
          app: "https://github.com/patch-gg/pixelfx",
          version: "1",
          image: `${name}_default.png`,
          format: "RGBA8888",
          size: { w: totalW, h: totalH },
          scale: "1",
          frameTags: [{ name, from: 0, to: n - 1, direction: "forward" }],
          pixelfx: {
            id: fx.id,
            name: fx.meta.name,
            desc: fx.meta.desc,
            tags: fx.meta.tags,
            fps,
            loop: fx.meta.loop,
            duration: fx.meta.duration,
            frames: n,
            frameSize: [w, h],
            pivot: fx.meta.origin,
            columns: cols,
            palettes: paletteList
          }
        }
      };
      writeFileSync(join(targetDir, `${name}.json`), JSON.stringify(baseJson, null, 2));
    }
  }

  return {
    id,
    cat,
    name,
    title: fx.meta.name,
    desc: fx.meta.desc,
    tags: fx.meta.tags,
    fps: fx.meta.fps,
    loop: fx.meta.loop,
    duration: fx.meta.duration,
    frames: baseJson.meta.pixelfx.frames,
    frameSize: fx.meta.size,
    pivot: fx.meta.origin,
    palettesCount: paletteList.length,
    palettes: paletteList,
    relDir: `${cat}/${name}`
  };
}

// Worker thread routine
if (!isMainThread) {
  parentPort.on("message", async (msg) => {
    if (msg.type === "RENDER") {
      try {
        const t0 = Date.now();
        const res = await renderEffectVariants(msg.id, OUT_DIR);
        parentPort.postMessage({ type: "DONE", id: msg.id, res, elapsed: Date.now() - t0 });
      } catch (err) {
        parentPort.postMessage({ type: "ERROR", id: msg.id, error: err.stack || err.message });
      }
    }
  });
}

// Master coordinator
if (isMainThread) {
  async function runMaster() {
    const fxlib = await import(pathToFileURL(join(PIXELFX_DIR, "tools", "lib", "fxlib.mjs")).href);
    const allIds = fxlib.allIds(join(PIXELFX_DIR, "src", "fx"));
    console.log(`Starting bulk render of ${allIds.length} VFX effects to: ${OUT_DIR}`);

    mkdirSync(OUT_DIR, { recursive: true });

    const numWorkers = Math.min(10, os.cpus().length || 4);
    console.log(`Spawning ${numWorkers} worker threads...`);

    const queue = [...allIds];
    const total = allIds.length;
    let completed = 0;
    const results = [];
    const errors = [];
    const startTime = Date.now();

    let activeWorkers = 0;

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(__filename);
      activeWorkers++;

      const assignNext = () => {
        if (queue.length > 0) {
          const nextId = queue.shift();
          worker.postMessage({ type: "RENDER", id: nextId });
        } else {
          worker.terminate();
          activeWorkers--;
          if (activeWorkers === 0) {
            finish();
          }
        }
      };

      worker.on("message", (msg) => {
        if (msg.type === "DONE") {
          completed++;
          results.push(msg.res);
          const pct = ((completed / total) * 100).toFixed(1);
          console.log(`[${completed}/${total}] (${pct}%) Rendered ${msg.id} (${msg.res.palettesCount} palettes) in ${(msg.elapsed / 1000).toFixed(1)}s`);
          assignNext();
        } else if (msg.type === "ERROR") {
          completed++;
          errors.push({ id: msg.id, error: msg.error });
          console.error(`[${completed}/${total}] FAILED ${msg.id}: ${msg.error}`);
          assignNext();
        }
      });

      worker.on("error", (err) => {
        console.error(`Worker error:`, err);
        activeWorkers--;
        if (activeWorkers === 0) {
          finish();
        }
      });

      assignNext();
    }

    function finish() {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n========================================`);
      console.log(`Bulk generation finished in ${totalTime}s!`);
      console.log(`Successfully rendered: ${results.length} effects`);
      console.log(`Total sprite sheet PNGs generated: ${results.reduce((acc, r) => acc + r.palettesCount, 0)}`);
      if (errors.length > 0) {
        console.warn(`Encountered errors: ${errors.length}`);
      }
      console.log(`========================================\n`);

      // Write master manifest.json
      results.sort((a, b) => a.id.localeCompare(b.id));
      const manifest = {
        title: "PixelFX VFX Assets Library",
        source: "https://patch-gg.github.io/pixelfx/",
        generatedAt: new Date().toISOString(),
        totalEffects: results.length,
        totalSheets: results.reduce((acc, r) => acc + r.palettesCount, 0),
        categories: [...new Set(results.map(r => r.cat))].sort(),
        effects: results
      };
      writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
      console.log(`Wrote manifest.json (${results.length} effects)`);

      // Write README.md
      const categoriesSummary = manifest.categories.map(cat => {
        const catEffects = results.filter(r => r.cat === cat);
        return `### ${cat.toUpperCase()} (${catEffects.length} effects)
| Effect ID | Name | Frames | Size | Description |
| :--- | :--- | :--- | :--- | :--- |
${catEffects.map(e => `| \`${e.id}\` | **${e.title}** | ${e.frames}F (${e.fps}fps) | ${e.frameSize[0]}x${e.frameSize[1]} | ${e.desc.replace(/\|/g, "-")} |`).join("\n")}`;
      }).join("\n\n");

      const readmeContent = `# PixelFX Master VFX Assets Library

Koleksi lengkap seluruh animasi efek pixel art dari [pixelfx](https://patch-gg.github.io/pixelfx/) dengan background transparan polosan dan seluruh variasi warna/palet (28 variasi warna per efek).

## Struktur Folder

Folder disimpan di \`database/vfx assets/\`:
\`\`\`
database/vfx assets/
├── <category>/
│   └── <effect_name>/
│       ├── <effect_name>_default.png    (Original palette)
│       ├── <effect_name>_fire.png       (Fire palette)
│       ├── <effect_name>_ice.png        (Ice palette)
│       ├── ... (28 variasi palet)
│       └── <effect_name>.json           (Metadata & Aseprite frame data)
├── manifest.json                        (Katalog indeks JSON lengkap)
└── README.md                            (Dokumentasi)
\`\`\`

## Daftar Palet Warna (28 Variasi)
1. \`default\` (Palet bawaan/asli dari efek)
2. \`fire\`
3. \`ember\`
4. \`lava\`
5. \`smoke\`
6. \`dust\`
7. \`ice\`
8. \`water\`
9. \`electric\`
10. \`volt\`
11. \`poison\`
12. \`holy\`
13. \`heal\`
14. \`arcane\`
15. \`shadow\`
16. \`blood\`
17. \`earth\`
18. \`stone\`
19. \`gold\`
20. \`leaf\`
21. \`wood\`
22. \`metal\`
23. \`bone\`
24. \`neon\`
25. \`cyber\`
26. \`matrix\`
27. \`candy\`
28. \`night\`

## Katalog Kategori & Efek
Total: **${results.length} efek** dan **${results.reduce((acc, r) => acc + r.palettesCount, 0)} sprite sheet PNG**.

${categoriesSummary}
`;
      writeFileSync(join(OUT_DIR, "README.md"), readmeContent);
      console.log(`Wrote README.md documentation!`);
    }
  }

  runMaster().catch(err => console.error("Master fatal error:", err));
}
