// Chasing payments: see what you're owed, spot the late ones, mark one paid.
const { Video, endCard } = require("../engine");
const { landscapingDocs } = require("../lib/seed");

(async () => {
  const v = new Video("04-who-owes-you", { voice: "af_heart", bg: "bg-carbon" });
  await v.open();
  await v.quickSetup("Landscaping", 50, "Greenway Lawn Care");
  const st = await v.storage();
  st["jobticket.docs.v1"] = JSON.stringify(landscapingDocs());
  st["jobticket.current.v1"] = JSON.stringify("seed0");
  st["jobticket.plan.v1"] = JSON.stringify({ used: 6, unlocked: true, code: "" });
  await v.loadApp(st);
  await v.app(() => document.querySelector("#tab-tickets").click());
  await v.cam({ s: 1.62, fx: 195, fy: 0, px: 489, py: 640 }, 0);

  await v.item("chip", '<span class="chip cream">Quick question</span>', { x: 60, y: 214, w: 0, delay: -0.5, enter: "pop" });
  await v.cap("hook", ["Who owes you", "money *right now?*"], { y: 310, size: "l", style: "cream", align: "left", x: 60, delay: -0.5, stagger: 0.06 });
  await v.say("Quick question. Who owes you money right now?");
  await v.wait(1.7);
  await v.snap("hook");
  await v.voDone(0.1);
  await v.end("hook"); await v.end("chip");
  await v.cap("hook2", ["If the answer is", "“let me check my texts”…"], { y: 260, size: "m", style: "ink", align: "left", x: 60 });
  await v.say("If the answer is, let me check my texts...");
  await v.wait(1.9);
  await v.voDone(0.1);
  await v.end("hook2");

  // The tiles.
  await v.cam({ s: 1.9, fx: 195, fy: 46, px: 489, py: 560 }, 0.7, "inout", "whoosh");
  await v.scrollTo("#tiles", 0.7, 20);
  await v.cap("c1", ["Every unpaid invoice, *totaled*"], { y: 260, size: "m", style: "cream" });
  await v.say("Every unpaid invoice, totaled.");
  await v.callout('.tile[data-filter="unpaid"]', { dur: 1.5, pad: 3 });
  await v.wait(1.6);
  await v.end("c1");
  await v.cap("c2", ["Late ones get *flagged red*"], { y: 260, size: "m", style: "cream" });
  await v.say("The late ones get flagged in red.");
  await v.callout('.tile[data-filter="overdue"]', { dur: 1.6, pad: 3, color: "red" });
  await v.snap("overdue");
  await v.wait(1.3);
  await v.tap('.tile[data-filter="overdue"]', { post: 0.2 });
  await v.end("c2");

  // Who's late.
  await v.cap("c3", ["There's who to call"], { y: 260, size: "m", style: "cream" });
  await v.say("There's who to call.");
  await v.scrollTo("#filters", 0.7, 20);
  await v.wait(1.4);
  await v.snap("late");
  await v.tap('.lrow[data-open="seed2"]', { post: 0.3 });
  await v.end("c3");

  // Mark it paid.
  await v.scrollTo(0, 0);
  await v.cap("c4", ["They paid? *Mark it.*"], { y: 260, size: "m", style: "cream" });
  await v.say("When they pay, it's one tap.");
  await v.wait(0.4);
  await v.tap("#stPaid", { post: 0.3 });
  await v.tap("#paidYes", { post: 0.3 });
  await v.end("c4");
  await v.tap("#mToggle", { post: 0.1 });
  await v.scrollTo("#ticket", 0, 20);
  await v.cap("c5", ["Paid. *Off the list.*"], { y: 260, size: "m", style: "cream", sound: "thud" });
  await v.say("Paid. Off the list.");
  await v.wait(1.6);
  await v.snap("paid");
  await v.end("c5");

  // Back to the totals.
  await v.tap("#tab-tickets", { post: 0.1 });
  await v.scrollTo("#tiles", 0, 20);
  await v.cap("c6", ["Totals update *by themselves*"], { y: 260, size: "m", style: "cream" });
  await v.say("And your totals update by themselves.");
  await v.callout('.tile[data-filter="paid"]', { dur: 1.6, pad: 3, color: "green" });
  await v.wait(2.0);
  await v.snap("collected");

  await endCard(v, { say: "Job Ticket. Know who owes you. Link in bio.", lines: ["Know who owes you. Always."] });

  await v.finish(async (v) => {
    await v.cam({ s: 1.62, fx: 195, fy: 46, px: 489, py: 780, op: 1 }, 0);
    await v.app(() => document.querySelector('#filters [data-filter="all"]') && document.querySelector('#filters [data-filter="all"]').click());
    await v.scrollTo("#tiles", 0, 20);
    await v.cap("ct", ["Who owes you", "money *right now?*"], { y: 330, size: "xl", style: "cream", enter: "none", sound: false });
  });
})();
