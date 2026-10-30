// Pricing: no subscription. A quick HVAC quote, then what you get and what it costs (from README).
const { Video, endCard } = require("../engine");

const CHECKS = ["Works with no signal", "Lives on your home screen", "Data stays on your phone", "Quotes are always free", "3 invoices free"];

(async () => {
  const v = new Video("08-no-monthly-fee", { voice: "am_michael", bg: "bg-carbon" });
  await v.open();
  await v.quickSetup("HVAC", 110, "Coolwave Heating & Air");
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 700 }, 0);

  await v.cap("hook", ["Another app", "with a *monthly fee?*"], { y: 214, x: 60, align: "left", size: "l", style: "cream", delay: -0.5, stagger: 0.06 });

  await v.say("Another app with a monthly fee? No thanks.");
  await v.wait(1.0);
  await v.item("no", '<div class="sticker k-red" style="font-size:66px">No thanks.</div>', { x: 520, y: 470, w: 0, enter: "stamp", rot: -6, sound: "thud" });
  await v.wait(1.2);
  await v.snap("hook");
  await v.voDone(0.1);
  await v.end("hook"); await v.end("no");

  // A quick quote.
  await v.cap("c1", ["AC tune-up quote"], { y: 300, size: "m", style: "cream" });
  await v.say("Here's an A C tune-up quote.");
  await v.cam({ s: 1.95, fx: 195, fy: 300, px: 489, py: 1000 }, 0.5, "inout", "whoosh");
  await v.scrollTo("#tplBox", 0.4, 70);
  await v.tap("#tplSearch", { pre: 0.2, post: 0.05 });
  await v.type("#tplSearch", "tune up", { cps: 11 });
  await v.blur();
  const card = await v.mark(".tpl-card", "AC tune-up");
  await v.tap(card, { pre: 0.25, post: 0.2 });
  await v.scrollTo("#tplPreview", 0.4, 40);
  await v.callout("#tplLines .sum", { dur: 1.2, pad: 4 });
  await v.wait(1.1);
  await v.snap("quote");
  await v.tap("#tplUse", { post: 0.2 });
  await v.end("c1");

  await v.cap("c2", ["Sent as a PDF"], { y: 300, size: "m", style: "cream" });

  await v.say("Sent as a P D F.");
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 600 }, 0.4);
  await v.tap("#mSend", { post: 0 });
  await v.slideSheet("#sendSheet .sheet");
  await v.cam({ s: 1.95, fx: 195, fy: 640, px: 489, py: 1000 }, 0.5);
  await v.wait(0.7);
  const pdf = v.expectPdf();
  await v.tap("#sendPdf", { post: 0.1 });
  await pdf();
  v.sfx("ding", v.T, 0.7);
  await v.end("c2");

  // What you get.
  await v.cam({ op: 0, py: 1400 }, 0.4);
  await v.cap("g", ["What you get"], { y: 214, x: 60, align: "left", size: "l", style: "plain", cls: "light" });
  await v.say("Works with no signal. Your data stays on your phone.");
  const rows = CHECKS.map((c) => `<div class="check" data-c><span class="bx"></span>${c}</div>`);
  for (let i = 0; i < rows.length; i++) {
    await v.item("ck" + i, `<div class="checks">${rows[i]}</div>`, { x: 60, y: 380 + i * 150, w: 820, enter: "up", sound: "tick", vol: 1.5 });
    await v.wait(0.5);
  }
  await v.wait(0.8);
  await v.snap("checks");
  for (let i = 0; i < rows.length; i++) await v.end("ck" + i);
  await v.end("g");
  await v.wait(0.2);

  // The price.
  await v.cap("p1", ["Then"], { y: 400, x: 60, align: "left", size: "m", style: "plain", cls: "light" });
  await v.say("Then it's twenty nine dollars. Once. No monthly fee.");
  await v.item("p2", '<div class="price" style="font-size:190px">$29 once.</div>', { x: 60, y: 500, w: 0, enter: "stamp", delay: 0.2, sound: "thud" });
  await v.cap("p3", ["One-time founding price.", "*No monthly fee.*"], { y: 740, x: 60, align: "left", size: "m", style: "cream", delay: 0.7 });
  await v.wait(2.6);
  await v.snap("price");

  await endCard(v, { say: "Job Ticket. Link in bio.", lines: ["No subscription. Ever."], fine: "3 free invoices · then $29 once" });

  await v.finish(async (v) => {
    await v.cam({ s: 1.4, fx: 195, fy: 0, px: 489, py: 900, op: 1 }, 0);
    await v.scrollTo(0, 0);
    await v.cap("ct", ["Invoices", "*without the*", "*monthly fee*"], { y: 330, size: "xl", style: "cream", enter: "none", sound: false });
    await v.item("cp", '<div class="sticker k-red" style="font-size:60px">$29 once</div>', { x: 560, y: 760, w: 0, enter: "none", rot: -6 });
  });
})();
