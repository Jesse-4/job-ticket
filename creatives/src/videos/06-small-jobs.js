// Undercharging: a 30-minute job priced below the minimum, and the app's one-tap fix.
// Every dollar figure in the captions is read from the app, not typed in here.
const { Video, endCard } = require("../engine");

(async () => {
  const v = new Video("06-small-jobs", { bg: "bg-paper" });
  await v.open();
  await v.quickSetup("Handyman", 65, "Northside Handyman");
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 700 }, 0);

  await v.item("chip", '<span class="chip k-red">Handymen, read this</span>', { x: 60, y: 214, w: 0, delay: -0.5, enter: "pop" });
  await v.cap("hook", ["You're probably", "*losing money*", "on small jobs"], { y: 310, x: 60, align: "left", size: "l", style: "ink", delay: -0.5, stagger: 0.06 });
  await v.wait(2.2);
  await v.snap("hook");
  await v.end("hook"); await v.end("chip");

  // A tiny job.
  await v.cap("c1", ["Say it's a sticky door"], { y: 300, size: "m", style: "white" });
  await v.cam({ s: 1.95, fx: 195, fy: 300, px: 489, py: 1000 }, 0.6, "inout", "whoosh");
  await v.scrollTo("#qeOpen", 0.5, 120);
  await v.tap("#qeOpen", { post: 0.2 });
  await v.scrollTo("#quickEst", 0.4, 60);
  await v.tap("#qe-name", { pre: 0.2, post: 0.05 });
  await v.type("#qe-name", "Fix sticky door", { cps: 13 });
  await v.tap("#qe-hours", { pre: 0.2, post: 0.05 });
  await v.type("#qe-hours", "0.5", { cps: 8 });
  await v.tap("#qe-mat", { pre: 0.2, post: 0.05 });
  await v.type("#qe-mat", "8", { cps: 8 });
  await v.blur();
  await v.end("c1");
  const sum = await v.app(() => document.querySelector("#qeSum").textContent);
  const amt = (sum.match(/\$[\d,]+\.\d\d/) || [""])[0];
  await v.cap("c2", ["30 minutes of work", "= *" + amt + "*"], { y: 260, size: "m", style: "white" });
  await v.callout("#qeSum", { dur: 1.8, pad: 4 });
  await v.snap("sum");
  await v.wait(1.9);
  await v.end("c2");

  // Under the minimum.
  await v.tap("#qeAdd", { post: 0.2 });
  await v.scrollTo("#minWarn", 0.6, 260);
  await v.cap("c3", ["But the drive, the gas,", "*the half day it eats?*"], { y: 260, size: "m", style: "white" });
  await v.callout("#minWarn", { dur: 2.2, pad: 4, color: "red" });
  await v.snap("warn");
  await v.wait(2.4);
  await v.end("c3");

  await v.cap("c4", ["One tap"], { y: 300, size: "m", style: "white" });
  await v.tap("#minFix", { post: 0.3 });
  await v.end("c4");
  await v.cam({ s: 1.4, fx: 195, fy: 0, px: 489, py: 650 }, 0.6);
  const total = await v.app(() => document.querySelector("#mTotal").textContent.trim());
  await v.cap("c5", ["Your minimum.", "*Every time.*"], { y: 260, size: "l", style: "ink" });
  await v.wait(0.6);
  await v.callout("#mbar > div:first-child", { dur: 2.0, pad: 6, fixed: true, color: "green" });
  await v.item("tot", `<div class="sticker k-green">Now ${total} with tax</div>`, { x: 60, y: 515, w: 0, enter: "stamp", rot: -3, sound: "thud" });
  await v.wait(2.2);
  await v.snap("fixed");

  await endCard(v, { lines: ["Never undercharge a small job"] });

  await v.finish(async (v) => {
    await v.cam({ s: 1.62, fx: 195, fy: 46, px: 489, py: 900, op: 1 }, 0);
    await v.cap("ct", ["You're losing", "money on", "*small jobs*"], { y: 330, size: "xl", style: "ink", enter: "none", sound: false });
  });
})();
