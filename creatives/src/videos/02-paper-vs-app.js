// Before/after: a scribbled carbon pad quote vs. the same kind of job priced in the app.
const { Video, endCard } = require("../engine");

const PAD = `<div class="pad">
  <div class="top"></div>
  <div class="hd"><span>QUOTE</span><span>No. 0347</span></div>
  <div style="padding:0 40px;font-size:46px;line-height:1.1">Mrs. K — kitchen + hall</div>
  <div class="rows">
    <div class="row"><span>outlets x6?? x8</span><span>$ ?</span></div>
    <div class="row x"><span>labor 2 hr</span><span>190</span></div>
    <div class="row"><span>labor 3hr (ask)</span><span></span></div>
    <div class="row"><span>parts - check receipt</span><span>~60?</span></div>
    <div class="row"><span>trip</span><span>79</span></div>
    <div class="row"><span></span><span></span></div>
  </div>
  <div class="smudge"></div>
  <div class="math">8 x 12 = 96<br>+ 285 + 79<br>= 4?? <span style="text-decoration:line-through">460</span></div>
  <div class="ring"></div>
</div>`;

const pdfCard = (png, name) => `<div class="pdfcard"><div class="bar"><span class="ic">PDF</span><div>${name}<small>Bright Line Electric</small></div></div><img src="${png}"></div>`;

(async () => {
  const v = new Video("02-paper-vs-app", { bg: "bg-paper" });
  await v.open();
  await v.quickSetup("Electrical", 95, "Bright Line Electric");
  await v.cam({ op: 0, py: 2400 }, 0);

  // Hook: the pad is already on screen at frame 0.
  await v.item("pad", PAD, { x: 150, y: 600, w: 0, enter: "pop", delay: -0.5, rot: -4, sound: "scribble", exit: "drop" });
  await v.cap("hook", ["Still writing quotes", "on *one of these?*"], { y: 214, size: "l", style: "ink", delay: -0.5, stagger: 0.05 });
  await v.wait(1.3);
  await v.snap("hook");
  await v.item("st1", '<div class="sticker k-red">math done in the truck</div>', { x: 120, y: 1150, w: 0, enter: "stamp", rot: -6, sound: "thud" });
  await v.wait(0.7);
  await v.item("st2", '<div class="sticker k-cream">can the customer even read it?</div>', { x: 180, y: 860, w: 0, enter: "stamp", rot: 4, sound: "thud" });
  await v.wait(1.0);
  await v.snap("stickers");

  // Switch to the app.
  await v.end("pad"); await v.end("st1"); await v.end("st2"); await v.end("hook");
  await v.wait(0.2);
  await v.cap("try", ["Same job. *In the app.*"], { y: 214, size: "l", style: "ink" });
  await v.cam({ op: 1, s: 1.95, fx: 195, fy: 300, px: 489, py: 2700 }, 0);
  await v.cam({ py: 1000 }, 0.7, "out", "whoosh");
  await v.scrollTo("#tplBox", 0, 70);
  await v.wait(0.7);
  await v.tap("#tplSearch", { pre: 0.25, post: 0.1 });
  await v.type("#tplSearch", "outlets", { cps: 10, byWord: true });
  await v.blur();
  await v.wait(0.3);
  const card = await v.mark(".tpl-card", "Replace outlets or switches");
  await v.tap(card, { post: 0.2 });
  await v.end("try");

  // The size question.
  await v.cap("q", ["It asks *one* question"], { y: 300, size: "m", style: "white" });
  await v.scrollTo("#tplPreview", 0.5, 30);
  await v.callout(".tpl-ask", { dur: 1.6, pad: 2 });
  await v.wait(0.5);
  await v.tap("#tplAsk", { pre: 0.25, post: 0.15 });
  await v.type("#tplAsk", "8", { cps: 6 });
  await v.blur();
  await v.end("q");
  await v.cap("q2", ["…then does the math"], { y: 300, size: "m", style: "white" });
  await v.callout("#tplLines .sum", { dur: 1.6, pad: 4, color: "green" });
  await v.snap("math");
  await v.wait(1.5);
  await v.tap("#tplUse", { post: 0.3 });
  await v.end("q2");

  // Send it, then put the two side by side.
  await v.setVal("#f-cname", "Mrs. Kowalski");
  await v.cap("send", ["Send it as a PDF"], { y: 300, size: "m", style: "white" });
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 600 }, 0.5);
  await v.wait(0.3);
  await v.tap("#mSend", { post: 0 });
  await v.slideSheet("#sendSheet .sheet");
  await v.cam({ s: 1.95, fx: 195, fy: 640, px: 489, py: 1000 }, 0.5);
  await v.wait(0.9);
  const pdf = v.expectPdf();
  await v.tap("#sendPdf", { post: 0 });
  const png = await pdf();
  const pdfName = await v.pdfName();
  v.sfx("ding", v.T, 0.7);
  await v.end("send");
  await v.cam({ op: 0 }, 0.25);
  await v.cap("vs", ["Before. *After.*"], { y: 214, size: "xl", style: "ink" });
  await v.item("bpad", '<div style="transform:scale(.68);transform-origin:0 0;width:517px;height:680px">' + PAD + "</div>",
    { x: 24, y: 560, w: 0, enter: "left", adur: 0.5, rot: -5, sound: "whoosh" });
  await v.item("bpdf", `<div style="transform:scale(.72);transform-origin:0 0;width:605px">${pdfCard(png, pdfName)}</div>`,
    { x: 470, y: 420, w: 0, enter: "right", adur: 0.5, rot: 3, delay: 0.35, sound: "whoosh" });
  await v.item("lb", '<div class="sticker k-red">BEFORE</div>', { x: 60, y: 1270, w: 0, enter: "stamp", rot: -6, delay: 0.8, sound: "thud" });
  await v.item("la", '<div class="sticker">AFTER</div>', { x: 640, y: 900, w: 0, enter: "stamp", rot: 4, delay: 1.1, sound: "thud" });
  await v.wait(2.8);
  await v.snap("vs");

  await endCard(v, { lines: ["Ditch the carbon pad"] });
  await v.snap("end");

  await v.finish(async (v) => {
    await v.item("cpad", '<div style="transform:scale(.62);transform-origin:0 0;width:471px;height:620px">' + PAD + "</div>", { x: 24, y: 800, w: 0, enter: "none", rot: -5 });
    await v.item("cpdf", `<div style="transform:scale(.66);transform-origin:0 0;width:555px">${pdfCard(png, pdfName)}</div>`, { x: 470, y: 690, w: 0, enter: "none", rot: 3 });
    await v.item("cb", '<div class="sticker k-red">BEFORE</div>', { x: 60, y: 1440, w: 0, enter: "none", rot: -6 });
    await v.item("ca", '<div class="sticker">AFTER</div>', { x: 640, y: 1140, w: 0, enter: "none", rot: 4 });
    await v.cap("ct", ["Still writing", "quotes *by hand?*"], { y: 330, size: "xl", style: "ink", enter: "none", sound: false });
  });
})();
