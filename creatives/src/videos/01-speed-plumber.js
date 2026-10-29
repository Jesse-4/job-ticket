// Speed run: a plumber goes from zero to a sent water heater quote while a stopwatch runs.
const { Video, endCard } = require("../engine");

(async () => {
  const v = new Video("01-speed-plumber", { bg: "bg-paper" });
  await v.open();
  // Open close on the phone so the first frame is already busy, then settle into the frame.
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 640 }, 0);

  await v.item("chip", '<span class="chip carbon">Plumbers</span>', { x: 60, y: 214, w: 0, delay: -0.5, enter: "pop" });
  await v.cap("hook", ["Water heater quote.", "Clock starts *now.*"], { y: 318, align: "left", x: 60, size: "l", style: "ink", delay: -0.5, stagger: 0.06 });
  await v.wait(0.5);
  await v.timer({ x: 330, y: 194 });
  await v.snap("hook");
  await v.wait(1.0);

  // Setup: trade is already Plumbing; type rate and name.
  await v.end("hook"); await v.end("chip");
  await v.cap("s1", ["Your rate, your name"], { y: 326, size: "m", style: "white", delay: 0.1 });
  await v.cam({ s: 2.15, fx: 195, fy: 300, px: 489, py: 1010 }, 0.7);
  await v.tap("#w-rate", { pre: 0.25, post: 0.1 });
  await v.type("#w-rate", "125", { cps: 8 });
  await v.tap("#w-name", { pre: 0.2, post: 0.1 });
  await v.type("#w-name", "Rivera Plumbing", { cps: 12 });
  await v.snap("setup");
  await v.blur();
  await v.tap("#w-save", { post: 0.35 });
  await v.end("s1");

  // Search the job.
  await v.cam({ s: 1.95, fx: 195, fy: 250, px: 489, py: 900 }, 0.6);
  await v.cap("s2", ["Search the job"], { y: 326, size: "m", style: "white" });
  await v.scrollTo("#tplBox", 0.5, 70);
  await v.tap("#tplSearch", { pre: 0.25, post: 0.1 });
  await v.type("#tplSearch", "water heater", { cps: 10 });
  await v.blur();
  await v.wait(0.25);
  await v.snap("search");
  await v.tap(".tpl-card[data-tpl]", { post: 0.2 });
  await v.end("s2");
  await v.cap("s3", ["Priced from *your* rate"], { y: 326, size: "m", style: "white" });
  await v.scrollTo("#tplPreview", 0.6, 40);
  await v.callout("#tplLines .sum", { dur: 1.4, pad: 4 });
  await v.snap("preview");
  await v.wait(1.2);
  await v.tap("#tplUse", { post: 0.3 });
  await v.end("s3");

  // Customer name.
  await v.cap("s4", ["Who's it for?"], { y: 326, size: "m", style: "white" });
  await v.scrollTo("#f-cname", 0.6, 160);
  await v.tap("#f-cname", { pre: 0.2, post: 0.1 });
  await v.type("#f-cname", "Dana Whitfield", { cps: 12 });
  await v.blur();
  await v.end("s4");

  // Send.
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 600 }, 0.6);
  await v.cap("s5", ["Send it"], { y: 326, size: "m", style: "white" });
  await v.wait(0.4);
  await v.tap("#mSend", { post: 0 });
  await v.slideSheet("#sendSheet .sheet");
  await v.cam({ s: 1.95, fx: 195, fy: 640, px: 489, py: 1000 }, 0.5);
  await v.wait(1.0);
  await v.snap("sheet");
  const pdf = v.expectPdf();
  await v.tap("#sendPdf", { post: 0 });
  const pdfName = await v.pdfName();
  const png = await pdf(); // the PDF renders off the clock; no frames pass while we wait
  await v.stopTimer();
  v.sfx("ding", v.T, 0.8);
  await v.end("s5");

  // Straight to what the customer gets.
  await v.cam({ op: 0 }, 0.25);
  await v.cap("done", ["Done. *Under a minute.*"], { y: 326, size: "m", style: "ink" });
  await v.item("pdf", `<div class="pdfcard"><div class="bar"><span class="ic">PDF</span><div>${pdfName}<small>Rivera Plumbing</small></div></div><img src="${png}"></div>`,
    { x: 70, y: 460, w: 0, enter: "rise", adur: 0.6, sound: "whoosh", rot: -1.5 });
  await v.wait(1.6);
  await v.snap("pdf");
  await v.end("done");
  await v.cap("s6", ["What your customer gets"], { y: 326, size: "m", style: "white", delay: 0.25 });
  await v.wait(2.0);

  await endCard(v, { lines: ["Quotes &amp; invoices in about a minute"] });
  await v.snap("end");

  await v.finish(async (v) => {
    await v.page.evaluate(() => setBg("bg-paper"));
    await v.cam({ s: 1.5, fx: 195, fy: 380, px: 489, py: 1450, op: 1 }, 0);
    await v.scrollTo(0, 0);
    await v.item("c1", '<span class="chip carbon">Plumbers</span>', { x: 60, y: 300, w: 0, enter: "none" });
    await v.cap("c2", ["Water heater", "quote in", "*under a minute*"], { y: 390, size: "xl", style: "ink", enter: "none", sound: false });
  });
})();
