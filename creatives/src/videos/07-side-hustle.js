// Side hustle: a new pressure washing business looks established from the first quote.
const { Video, endCard } = require("../engine");

(async () => {
  const v = new Video("07-side-hustle", { bg: "bg-paper" });
  await v.open();
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 700 }, 0);

  await v.cap("hook", ["Starting a", "*pressure washing*", "side hustle?"], { y: 214, x: 60, align: "left", size: "l", style: "carbon", delay: -0.5, stagger: 0.06 });
  await v.wait(1.6);
  await v.snap("hook");
  await v.cap("hook2", ["Look legit from day one."], { y: 560, x: 60, align: "left", size: "s", style: "ink", sound: "pop" });
  await v.wait(1.3);
  await v.end("hook"); await v.end("hook2");

  // Setup.
  await v.cap("c1", ["Pick your trade, name it"], { y: 300, size: "m", style: "white" });
  await v.cam({ s: 2.1, fx: 195, fy: 280, px: 489, py: 1000 }, 0.6, "inout", "whoosh");
  await v.tap("#w-trade", { pre: 0.25, post: 0.1, action: () => v.setVal("#w-trade", "Pressure washing") });
  await v.wait(0.3);
  await v.tap("#w-name", { pre: 0.2, post: 0.05 });
  await v.type("#w-name", "Fresh Start Washing", { cps: 13 });
  await v.blur();
  await v.snap("setup");
  await v.tap("#w-save", { post: 0.3 });
  await v.end("c1");

  // Quote a driveway.
  await v.cap("c2", ["Quote a driveway"], { y: 300, size: "m", style: "white" });
  await v.cam({ s: 1.95, fx: 195, fy: 300, px: 489, py: 1000 }, 0.4);
  await v.scrollTo("#tplBox", 0.4, 70);
  await v.tap("#tplSearch", { pre: 0.2, post: 0.05 });
  await v.type("#tplSearch", "driveway", { cps: 11, byWord: true });
  await v.blur();
  const card = await v.mark(".tpl-card", "Driveway washing");
  await v.tap(card, { pre: 0.25, post: 0.2 });
  await v.end("c2");
  await v.cap("c3", ["How big? It does the math"], { y: 300, size: "m", style: "white" });
  await v.scrollTo("#tplPreview", 0.5, 40);
  await v.tap("#tplAsk", { pre: 0.2, post: 0.05 });
  await v.type("#tplAsk", "900", { cps: 8 });
  await v.blur();
  await v.callout("#tplLines .sum", { dur: 1.5, pad: 4, color: "green" });
  await v.snap("size");
  await v.wait(1.5);
  await v.tap("#tplUse", { post: 0.2 });
  await v.end("c3");

  // Send.
  await v.setVal("#f-cname", "Mike Alvarez");
  await v.cap("c4", ["Send"], { y: 300, size: "m", style: "white" });
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 600 }, 0.4);
  await v.tap("#mSend", { post: 0 });
  await v.slideSheet("#sendSheet .sheet");
  await v.cam({ s: 1.95, fx: 195, fy: 640, px: 489, py: 1000 }, 0.5);
  await v.wait(0.9);
  const pdf = v.expectPdf();
  await v.tap("#sendPdf", { post: 0 });
  const pdfName = await v.pdfName();
  const png = await pdf();
  v.sfx("ding", v.T, 0.8);
  await v.end("c4");

  await v.cam({ op: 0 }, 0.25);
  await v.cap("c5", ["Your name on top.", "*Like a real company.*"], { y: 214, size: "l", style: "carbon" });
  await v.item("pdf", `<div class="pdfcard"><div class="bar"><span class="ic">PDF</span><div>${pdfName}<small>Fresh Start Washing</small></div></div><img src="${png}"></div>`,
    { x: 70, y: 560, w: 0, enter: "rise", adur: 0.6, sound: "whoosh", rot: -1.5 });
  await v.wait(0.6);
  await v.item("arrow", '<div class="sticker k-ink" style="font-size:38px;padding:12px 20px 14px">↑ your business name</div>', { x: 100, y: 770, w: 0, enter: "stamp", rot: -4, sound: "thud" });
  await v.wait(0.6);
  await v.cap("c6", ["Quotes are always free."], { y: 1330, x: 60, align: "left", size: "s", style: "ink", sound: "pop" });
  await v.wait(1.8);
  await v.snap("pdf");

  await endCard(v, { lines: ["Quotes &amp; invoices for your side hustle"] });

  await v.finish(async (v) => {
    await v.page.evaluate(() => S.items.forEach((i) => i.el.remove()));
    await v.cap("ct", ["Starting a", "*pressure washing*", "side hustle?"], { y: 330, size: "xl", style: "carbon", enter: "none", sound: false });
    await v.item("cpdf", `<div class="pdfcard"><div class="bar"><span class="ic">PDF</span><div>${pdfName}<small>Fresh Start Washing</small></div></div><img src="${png}"></div>`,
      { x: 90, y: 790, w: 0, enter: "none", rot: -2 });
  });
})();
