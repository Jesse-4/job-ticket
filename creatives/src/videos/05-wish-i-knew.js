// Listicle: pricing lessons for anyone starting a service business, shown in the app.
const { Video, endCard } = require("../engine");

async function point(v, n, lines, sub) {
  await v.item("n" + n, `<span class="chip carbon" style="font-size:40px">0${n}</span>`, { x: 60, y: 214, w: 0, enter: "pop", sound: "tick" });
  await v.cap("p" + n, lines, { y: 290, x: 60, align: "left", size: "m", style: "cream", delay: 0.05 });
  if (sub) await v.cap("q" + n, [sub], { y: 290 + 92 * lines.length + 6, x: 60, align: "left", size: "xs", style: "ink", delay: 0.35, sound: false });
}
async function endPoint(v, n) { await v.end("n" + n); await v.end("p" + n); await v.end("q" + n); }

(async () => {
  const v = new Video("05-wish-i-knew", { bg: "bg-ink" });
  await v.open();
  await v.quickSetup("Painting", 45, "Hartley Painting Co.");
  await v.app(() => document.querySelector("#tab-rates").click());
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 700 }, 0);

  await v.cap("hook", ["Things I wish", "I knew when I", "*started my business*"], { y: 214, x: 60, align: "left", size: "l", style: "cream", delay: -0.5, stagger: 0.05 });
  await v.wait(2.2);
  await v.snap("hook");
  await v.end("hook");
  await v.cam({ s: 1.9, fx: 195, fy: 46, px: 489, py: 640 }, 0.6, "inout", "whoosh");

  // 01: hourly rate.
  await point(v, 1, ["Price from an hourly rate,", "not a gut feeling"]);
  await v.scrollTo("#rateExample", 0.5, 230);
  await v.tap("#pb-labor", { pre: 0.25, post: 0.1 });
  await v.type("#pb-labor", "60", { cps: 6 });
  await v.blur();
  await v.callout("#rateExample", { dur: 1.6, pad: 4 });
  await v.snap("rate");
  await v.wait(1.7);
  await endPoint(v, 1);

  // 02: markup.
  await point(v, 2, ["Mark up your materials"], "You drove to get them. That's your time.");
  await v.scrollTo("#pb-markup", 0.5, 300);
  const mk = await v.app(() => { const r = document.querySelector("#pb-markup").closest(".rate"); r.setAttribute("data-mark", "mk"); return 1; });
  await v.callout('[data-mark="mk"]', { dur: 2.0, pad: 4 });
  await v.wait(2.3);
  await v.snap("markup");
  await endPoint(v, 2);

  // 03: minimum.
  await point(v, 3, ["Set a minimum charge"], "A 20-minute job still costs you the drive.");
  await v.scrollTo("#pb-min", 0.5, 300);
  await v.app(() => document.querySelector("#pb-min").closest(".rate").setAttribute("data-mark", "mn"));
  await v.callout('[data-mark="mn"]', { dur: 2.0, pad: 4 });
  await v.wait(2.3);
  await v.snap("min");
  await endPoint(v, 3);

  // 04: written quote.
  await point(v, 4, ["Put the price in writing", "*before* you start"]);
  await v.tap("#tab-ticket", { post: 0.1 });
  await v.scrollTo("#tplBox", 0, 260);
  await v.tap("#tplSearch", { pre: 0.2, post: 0.1 });
  await v.type("#tplSearch", "deck stain", { cps: 11 });
  await v.blur();
  const card = await v.mark(".tpl-card", "Deck stain");
  await v.tap(card, { pre: 0.25, post: 0.2 });
  await v.scrollTo("#tplPreview", 0.5, 260);
  await v.tap("#tplAsk", { pre: 0.2, post: 0.1 });
  await v.type("#tplAsk", "450", { cps: 8 });
  await v.blur();
  await v.callout("#tplLines .sum", { dur: 1.8, pad: 4, color: "green" });
  await v.snap("quote");
  await v.wait(2.0);
  await endPoint(v, 4);

  await endCard(v, { lines: ["Priced from your own rates"] });

  await v.finish(async (v) => {
    await v.app(() => document.querySelector("#tab-rates").click());
    await v.cam({ s: 1.5, fx: 195, fy: 46, px: 489, py: 1000, op: 1 }, 0);
    await v.scrollTo("#pb-labor", 0, 260);
    await v.cap("ct", ["Things I wish", "I knew when I", "*started my business*"], { y: 330, size: "l", style: "cream", enter: "none", sound: false });
  });
})();
