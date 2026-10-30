// Render the logo SVGs to PNG (transparent backgrounds). Run from creatives/brand: node src/render_png.js
const { chromium } = require("playwright");
const fs = require("fs");
const OUT = [
  ["tiktok-profile.svg", "tiktok-profile-picture.png", 1080, 1080],
  ["job-ticket-icon.svg", "job-ticket-icon.png", 1024, 1024],
  ["job-ticket-mark-blue.svg", "job-ticket-mark-blue.png", 1000, 1000],
  ["job-ticket-mark-cream.svg", "job-ticket-mark-cream.png", 1000, 1000],
  ["job-ticket-logo-horizontal.svg", "job-ticket-logo-horizontal.png", 0, 600],
  ["job-ticket-logo-horizontal-on-dark.svg", "job-ticket-logo-horizontal-on-dark.png", 0, 600],
  ["job-ticket-logo-stacked.svg", "job-ticket-logo-stacked.png", 1800, 0],
  ["job-ticket-logo-stacked-on-dark.svg", "job-ticket-logo-stacked-on-dark.png", 1800, 0],
];
(async () => {
  const b = await chromium.launch();
  for (const [src, dst, w0, h0] of OUT) {
    const svg = fs.readFileSync(src, "utf8");
    const [, vw, vh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
    const w = Math.round(w0 || (h0 * vw) / vh), h = Math.round(h0 || (w0 * vh) / vw);
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style>${svg}`);
    await p.screenshot({ path: dst, omitBackground: true });
    await p.close();
    console.log(dst, w + "x" + h);
  }
  await b.close();
})();
