// Frame-by-frame renderer for Job Ticket promo videos.
// A 1080x1920 stage page hosts the real app in an iframe; this driver advances time one frame
// at a time, drives the app (taps, typing, scrolling), and pipes screenshots into ffmpeg.
const { chromium } = require("playwright");
const { spawn, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.JT_BASE || "http://localhost:8765";
const FPS = 30;

class Video {
  constructor(name, opts = {}) {
    this.name = name;
    this.opts = opts;
    this.T = 0;
    this.events = [];
    this.preview = !!process.env.PREVIEW; // PREVIEW=1 renders a few stills instead of a video
  }

  async open() {
    this.browser = await chromium.launch();
    this.ctx = await this.browser.newContext({ viewport: { width: 1080, height: 1920 }, hasTouch: true, acceptDownloads: true, colorScheme: this.opts.dark ? "dark" : "light" });
    this.page = await this.ctx.newPage();
    this.page.on("pageerror", (e) => console.error("[stage error]", e.message));
    await this.page.goto(BASE + "/creatives/src/stage.html");
    await this.page.evaluate(() => document.fonts.ready);
    await this.page.evaluate(([w, h]) => setAppSize(w, h), [390, this.opts.appH || 780]);
    if (this.opts.dark) await this.page.evaluate(() => document.body.classList.add("dark"));
    if (this.opts.bg) await this.page.evaluate((c) => setBg(c), this.opts.bg);
    if (process.env.SAFE) await this.page.evaluate(() => document.body.classList.add("showsafe"));
    await this.loadApp(this.opts.storage || null);
    if (!this.preview) {
      fs.mkdirSync(path.join(ROOT, "build"), { recursive: true });
      this.tmp = path.join(ROOT, "build", this.name + ".video.mp4");
      this.ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(FPS), this.tmp], { stdio: ["pipe", "inherit", "inherit"] });
      this.ffDone = new Promise((res) => this.ff.on("close", res));
    }
  }

  // Load the app into the iframe with a given localStorage (null = brand-new user).
  async loadApp(storage) {
    // Unload any running copy first so it can't save over the new storage on its way out.
    await this.page.evaluate(() => new Promise((res) => { const f = document.getElementById("app"); if (!f.src) return res(); f.onload = () => res(); f.src = "about:blank"; }));
    await this.page.evaluate((st) => {
      localStorage.clear();
      if (st) Object.keys(st).forEach((k) => localStorage.setItem(k, typeof st[k] === "string" ? st[k] : JSON.stringify(st[k])));
      return new Promise((res) => {
        const f = document.getElementById("app");
        f.onload = () => res();
        f.src = "/index.html?v=" + Date.now();
      });
    }, storage);
    await this.page.waitForTimeout(400);
    const frame = this.appFrame();
    await frame.evaluate(() => document.fonts.ready);
    await frame.evaluate(() => {
      // The driver owns scrolling and timing: stop the app scrolling itself, hide timed toasts and scrollbars.
      window.__scrollTo = window.scrollTo.bind(window);
      window.scrollTo = function () {};
      Element.prototype.scrollIntoView = function () {};
      const st = document.createElement("style");
      st.textContent = ".toast{display:none!important} html{scroll-behavior:auto!important;scrollbar-width:none} ::-webkit-scrollbar{display:none}";
      document.head.appendChild(st);
    });
    await this.page.evaluate(() => { S.scroll = []; S.elAnims = []; });
    await this.page.evaluate((t) => addScroll(t, 0, 0), this.T);
  }

  // Finish the first-run setup off camera (for videos that start mid-use).
  async quickSetup(trade, rate, name) {
    await this.setVal("#w-trade", trade);
    await this.setVal("#w-rate", String(rate));
    await this.setVal("#w-name", name);
    await this.app(() => document.querySelector("#w-save").click());
    // The app saves to localStorage on a short timer; wait for it.
    await this.page.waitForFunction(() => document.getElementById("app").contentWindow.localStorage.getItem("jobticket.setup.v1") === "true");
    await this.page.evaluate((t) => render(t), this.T);
  }
  async storage() {
    return this.app(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  }

  appFrame() { return this.page.frames().find((f) => f.url().includes("/index.html")); }
  app(fn, arg) { return this.appFrame().evaluate(fn, arg); }

  async frame() {
    await this.page.evaluate((t) => render(t), this.T);
    if (!this.preview) {
      const buf = await this.page.screenshot({ type: "jpeg", quality: 93 });
      if (!this.ff.stdin.write(buf)) await new Promise((r) => this.ff.stdin.once("drain", r));
    }
    this.T += 1 / FPS;
  }
  async wait(sec) {
    const n = Math.max(0, Math.round(sec * FPS));
    if (this.preview || this.closed) { this.T += n / FPS; await this.page.evaluate((t) => render(t), this.T); return; }
    for (let i = 0; i < n; i++) await this.frame();
  }
  // Take a still at the current time (for checking layouts quickly).
  async still(file) {
    await this.page.evaluate((t) => render(t), this.T);
    await this.page.screenshot({ path: file });
  }

  // In preview mode, save a still of the current moment (SNAPDIR) so layouts can be checked without rendering.
  async snap(label) {
    if (!this.preview) return;
    const dir = process.env.SNAPDIR || path.join(ROOT, "build", "snaps");
    fs.mkdirSync(dir, { recursive: true });
    await this.still(path.join(dir, this.name + "-" + this.T.toFixed(1).padStart(5, "0") + "-" + label + ".png"));
  }

  sfx(kind, at, vol) { this.events.push({ t: at == null ? this.T : at, kind, vol: vol == null ? 1 : vol }); }

  // Captions and overlays. Times are relative to now.
  async cap(id, lines, o = {}) {
    const tIn = this.T + (o.delay || 0);
    if (o.sound !== false) this.sfx(o.sound || "pop", tIn, o.vol);
    return this.page.evaluate((a) => addItem(a), Object.assign({}, o, { id, lines, tIn, tOut: o.dur ? tIn + o.dur : null,
      cls: "s-" + (o.style || "cream") + " sz-" + (o.size || "l") + " " + (o.cls || "") }));
  }
  async item(id, html, o = {}) {
    const tIn = this.T + (o.delay || 0);
    if (o.sound) this.sfx(o.sound, tIn, o.vol);
    return this.page.evaluate((a) => addItem(a), Object.assign({ id, html, tIn }, o, { tOut: o.dur ? tIn + o.dur : null }));
  }
  // A soft gradient behind top captions so they stay readable over a busy screen.
  async scrim(id, o = {}) {
    const c = o.color || "15,18,26";
    return this.item(id, `<div style="width:1080px;height:${o.h || 1000}px;background:linear-gradient(to bottom, rgba(${c},.94) 0%, rgba(${c},.88) 55%, rgba(${c},0) 100%)"></div>`,
      { x: 0, y: 0, w: 1080, enter: "fade", adur: 0.25, delay: o.delay, dur: o.dur });
  }
  async ticketNo() { return this.app(() => document.querySelector("#tkNo").textContent.trim()); }
  async pdfName() {
    return this.app(() => {
      const kind = document.querySelector("#tkKind").textContent.trim(), no = document.querySelector("#tkNo").textContent.trim();
      const who = document.querySelector("#f-cname").value.trim();
      return [kind, no, who].filter(Boolean).join(" ") + ".pdf";
    });
  }

  async end(id, delay = 0) { await this.page.evaluate(([i, t]) => endItem(i, t), [id, this.T + delay]); }
  async cam(to, dur = 0.8, ease, sound) {
    await this.page.evaluate(([t, d, c, e]) => addCam(t, d, c, e), [this.T, dur, to, ease || "inout"]);
    if (sound) this.sfx(sound);
  }
  async timer(o) { await this.page.evaluate((a) => addTimer(a), Object.assign({ tIn: this.T, t0: this.T }, o)); }
  async stopTimer() { await this.page.evaluate((t) => { S.timers.forEach((o) => { if (!o.tStop) o.tStop = t; }); }, this.T); }

  // Tag the first element matching sel whose text includes `text`; returns a selector for it.
  async mark(sel, text) {
    const key = "m" + Math.random().toString(36).slice(2, 8);
    const ok = await this.app(([s, t, k]) => {
      const el = [].find.call(document.querySelectorAll(s), (e) => e.textContent.includes(t));
      if (el) el.setAttribute("data-mark", k);
      return !!el;
    }, [sel, text, key]);
    if (!ok) throw new Error(this.name + ": no " + sel + " with text " + text);
    return '[data-mark="' + key + '"]';
  }

  async rect(sel) {
    const r = await this.app((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.left, y: b.top, w: b.width, h: b.height, sy: window.scrollY, docH: document.documentElement.scrollHeight, vh: innerHeight };
    }, sel);
    if (!r) throw new Error(this.name + ": no element " + sel);
    return r;
  }

  // Scroll the app so an element sits `offset` px below the top of the screen.
  async scrollTo(target, dur = 0.7, offset = 90) {
    let y = target;
    if (typeof target === "string") {
      const r = await this.rect(target);
      y = r.y + r.sy - offset;
      y = Math.max(0, Math.min(y, r.docH - r.vh));
    }
    await this.page.evaluate(([t, d, yy]) => addScroll(t, d, yy), [this.T, dur, y]);
    if (dur > 0.25) this.sfx("swipe", this.T, 0.6);
    await this.wait(dur);
    await this.wait(0.05);
  }

  async tap(sel, o = {}) {
    const r = await this.rect(sel);
    const pre = o.pre == null ? 0.32 : o.pre, post = o.post == null ? 0.3 : o.post;
    const x = r.x + (o.dx == null ? r.w / 2 : o.dx), y = r.y + (o.dy == null ? r.h / 2 : o.dy);
    await this.page.evaluate(([x, y, t]) => addTap(x, y, t), [x, y, this.T + pre]);
    await this.wait(pre);
    this.sfx("tap");
    if (o.action) await o.action();
    else if (o.click !== false) await this.app((s) => { const el = document.querySelector(s); el.focus && el.focus({ preventScroll: true }); el.click(); }, sel);
    await this.wait(post);
  }

  async type(sel, text, o = {}) {
    const cps = o.cps || 11;
    // byWord: the text appears letter by letter but the app only hears whole words (like autocomplete-friendly typing).
    await this.app(([s, clear]) => { const el = document.querySelector(s); el.focus({ preventScroll: true }); if (clear) { el.value = ""; el.dispatchEvent(new Event("input", { bubbles: true })); } }, [sel, o.clear !== false]);
    let typed = o.clear === false ? await this.app((s) => document.querySelector(s).value, sel) : "";
    for (const ch of text) {
      typed += ch;
      const fire = !o.byWord || ch === " ";
      // Number inputs reject in-between states like "0." (they'd blank out), so those keep the last valid value.
      await this.app(([s, val, f]) => {
        const el = document.querySelector(s);
        if (el.type === "number" && !/^-?\d*\.?\d+$|^-?\d+$/.test(val)) return;
        el.value = val; if (f) el.dispatchEvent(new Event("input", { bubbles: true }));
      }, [sel, typed, fire]);
      this.sfx("key", this.T, 0.8 + Math.random() * 0.4);
      await this.wait(1 / cps);
    }
    await this.app((s) => { const el = document.querySelector(s); el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); }, sel);
  }
  async setVal(sel, value) {
    await this.app(([s, v]) => {
      const el = document.querySelector(s); el.value = v;
      el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true }));
    }, [sel, value]);
  }
  async blur() { await this.app(() => document.activeElement && document.activeElement.blur()); }

  // Highlight an app element with an outline. fixed: element is position:fixed (e.g. the bottom bar).
  async callout(sel, o = {}) {
    const r = await this.rect(sel);
    const pad = o.pad || 0;
    await this.page.evaluate((a) => addCallout(a), {
      x: r.x - pad, y: r.y + (o.fixed ? 0 : r.sy) - pad, w: r.w + pad * 2, h: r.h + pad * 2,
      tIn: this.T + (o.delay || 0), tOut: this.T + (o.delay || 0) + (o.dur || 1.5), color: o.color || "", fixed: !!o.fixed
    });
    this.sfx("ding", this.T + (o.delay || 0), 0.35);
  }

  // Start listening for the app's PDF download; returns a function that resolves to the PDF's page-1 PNG URL.
  expectPdf() {
    const dl = this.page.waitForEvent("download", { timeout: 30000 });
    return async () => {
      const d = await dl;
      const pdf = path.join(ROOT, "build", this.name + ".pdf");
      fs.mkdirSync(path.dirname(pdf), { recursive: true });
      await d.saveAs(pdf);
      const base = path.join(ROOT, "build", this.name + "-pdf");
      execFileSync("pdftoppm", ["-png", "-r", "130", "-f", "1", "-l", "1", "-singlefile", pdf, base]);
      execFileSync("python3", [path.join(__dirname, "croppdf.py"), base + ".png"]);
      return "/creatives/build/" + this.name + "-pdf.png";
    };
  }

  async slideSheet(sel) {
    await this.page.evaluate(([s, t]) => { addElAnim({ sel: s, t0: t, dur: 0.38, kind: "slideUp", ease: "expo" }); }, [sel, this.T]);
    this.sfx("whoosh", this.T, 0.6);
  }

  // Cover: clear overlays, run a setup that adds items at the current time, then take a still.
  async cover(setup) {
    await this.page.evaluate(() => { S.items.forEach((i) => i.el.remove()); S.items = []; S.fx.forEach((f) => { f.el.remove(); f.ring && f.ring.remove(); }); S.fx = []; S.timers.forEach((o) => o.el.remove()); S.timers = []; });
    const t0 = this.T;
    await setup(this);
    this.T = t0 + 3;
    await this.page.evaluate((t) => render(t), this.T);
    await this.page.waitForTimeout(300);
    const out = path.join(ROOT, "covers", this.name + ".png");
    await this.page.screenshot({ path: out });
    console.log("cover", out);
  }

  async finish(coverSetup) {
    const dur = this.T;
    if (!this.preview) {
      this.ff.stdin.end();
      await this.ffDone;
      this.closed = true; // later waits (cover setup) only move time, no frames
    }
    if (coverSetup) await this.cover(coverSetup);
    await this.browser.close();
    if (this.preview) return;
    const evFile = path.join(ROOT, "build", this.name + ".events.json");
    const wav = path.join(ROOT, "build", this.name + ".wav");
    fs.writeFileSync(evFile, JSON.stringify({ duration: dur, events: this.events }));
    execFileSync("python3", [path.join(__dirname, "sound.py"), evFile, wav], { stdio: "inherit" });
    const out = path.join(ROOT, "videos", this.name + ".mp4");
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", this.tmp, "-i", wav, "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
      "-shortest", "-movflags", "+faststart", out], { stdio: "inherit" });
    console.log("video", out, dur.toFixed(1) + "s");
  }
}

// Shared end card used by every video.
async function endCard(v, o = {}) {
  await v.item("endbg", '<div style="position:absolute;inset:0;width:1080px;height:1920px;background:radial-gradient(120% 70% at 30% 10%,#3c54d6 0%,#2f45c4 45%,#24369e 100%)"></div>',
    { x: 0, y: 0, w: 1080, enter: "rise", adur: 0.5, sound: "whoosh" });
  await v.wait(0.12);
  const lines = o.lines || ["Quotes &amp; invoices", "from your phone"];
  await v.item("end", `<div class="endcard" style="position:relative;inset:auto;width:1080px;height:1920px">
      <img class="logo" src="/icons/icon-512.png" alt="">
      <div class="name">Job Ticket</div>
      <div class="sub">${lines.join("<br>")}</div>
      <div class="cta">${o.cta || "Link in bio"}</div>
      <div class="fine">${o.fine || "3 free invoices · quotes always free"}</div>
    </div>`, { x: 0, y: 0, w: 1080, enter: "up", adur: 0.45, sound: "pop" });
  await v.wait(o.hold || 2.6);
}

module.exports = { Video, endCard, FPS };
