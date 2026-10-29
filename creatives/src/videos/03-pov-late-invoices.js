// POV: it's late and the invoices still aren't sent. Dark mode, full-screen phone recording.
const { Video, endCard } = require("../engine");

const FULL = { s: 1080 / 390, fx: 0, fy: 0, px: 0, py: 0, frame: 0, op: 1 };

(async () => {
  const v = new Video("03-pov-late-invoices", { bg: "bg-ink", dark: true, appH: 647 });
  await v.open();
  await v.page.evaluate(() => setClock("10:47"));
  await v.quickSetup("Cleaning", 45, "Sparkle House Cleaning");
  await v.cam(FULL, 0);

  await v.scrim("hs", { h: 980, delay: -0.3, dur: 2.6 });
  await v.item("pov", '<span class="chip cream">POV</span>', { x: 60, y: 250, w: 0, delay: -0.5, enter: "pop" });
  await v.cap("hook", ["it's *10:47 PM*", "and you still haven't", "sent today's invoices"], { y: 340, size: "l", style: "cream", align: "left", delay: -0.5, stagger: 0.05 });
  await v.wait(2.3);
  await v.snap("hook");
  await v.end("hook"); await v.end("pov");

  // New invoice.
  await v.cap("c1", ["New invoice"], { y: 300, size: "m", style: "cream" });
  await v.tap("#newBtn", { post: 0.25 });
  await v.tap("#newInvoice", { post: 0.3 });
  await v.scrollTo("#tplBox", 0.4, 190);
  await v.end("c1");

  await v.cap("c2", ["Search the job"], { y: 300, size: "m", style: "cream" });
  await v.tap("#tplSearch", { pre: 0.25, post: 0.1 });
  await v.type("#tplSearch", "deep clean", { cps: 10, byWord: true });
  await v.blur();
  await v.wait(0.2);
  const card = await v.mark(".tpl-card", "Deep clean");
  await v.tap(card, { post: 0.2 });
  await v.end("c2");

  await v.cap("c3", ["4 bedrooms this time"], { y: 300, size: "m", style: "cream" });
  await v.scrollTo("#tplPreview", 0.5, 230);
  await v.tap("#tplAsk", { pre: 0.25, post: 0.1 });
  await v.type("#tplAsk", "4", { cps: 6 });
  await v.blur();
  await v.callout("#tplLines .sum", { dur: 1.3, pad: 4 });
  await v.snap("bedrooms");
  await v.wait(1.2);
  await v.tap("#tplUse", { post: 0.2 });
  await v.end("c3");

  await v.cap("c4", ["Customer"], { y: 300, size: "m", style: "cream" });
  await v.scrollTo("#f-cname", 0.5, 260);
  await v.tap("#f-cname", { pre: 0.2, post: 0.1 });
  await v.type("#f-cname", "Priya Shah", { cps: 12 });
  await v.blur();
  await v.end("c4");

  // Send: the bottom bar sits low, so lift the phone a little while tapping it.
  await v.cap("c5", ["Send"], { y: 300, size: "m", style: "cream" });
  await v.cam({ py: -330 }, 0.4);
  await v.wait(0.3);
  await v.tap("#mSend", { post: 0 });
  await v.slideSheet("#sendSheet .sheet");
  await v.wait(1.0);
  await v.snap("sheet");
  const pdf = v.expectPdf();
  await v.tap("#sendPdf", { post: 0 });
  const png = await pdf();
  const pdfName = await v.pdfName();
  v.sfx("ding", v.T, 0.8);
  await v.end("c5");

  await v.cam({ op: 0 }, 0.25);
  await v.cap("sent", ["Sent.", "Still *10:47.*"], { y: 260, size: "xl", style: "cream" });
  await v.item("pdf", `<div class="pdfcard"><div class="bar"><span class="ic">PDF</span><div>${pdfName}<small>Sparkle House Cleaning</small></div></div><img src="${png}"></div>`,
    { x: 70, y: 620, w: 0, enter: "rise", adur: 0.6, sound: "whoosh", rot: 1.5 });
  await v.wait(2.6);
  await v.snap("sent");

  await endCard(v, { lines: ["Invoices done before bed"] });

  await v.finish(async (v) => {
    await v.cam(Object.assign({}, FULL, { op: 1, py: -40 }), 0);
    await v.scrollTo("#tplBox", 0, 300);
    await v.scrim("cs", { h: 1150 });
    await v.item("cp", '<span class="chip cream" style="font-size:44px">POV</span>', { x: 60, y: 300, w: 0, enter: "none" });
    await v.cap("ct", ["it's *10:47 PM*", "and the invoices", "still aren't sent"], { y: 400, size: "xl", style: "cream", align: "left", enter: "none", sound: false });
  });
})();
