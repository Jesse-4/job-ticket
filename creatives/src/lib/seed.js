// Example tickets for the "who owes you" video. Dates are relative to today so overdue flags stay true.
function day(offset) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
let n = 0;
function doc(kind, status, number, dateOff, terms, client, job, items, extra) {
  return Object.assign({
    id: "seed" + (n++), kind, status, number, date: day(dateOff), termsDays: terms, job, currency: "USD",
    client: { name: client, contact: "", address: "" }, items, discount: 0, taxRate: 0, deposit: 0,
    notes: "", payInfo: "Zelle or check", counted: kind === "invoice"
  }, extra || {});
}
const L = (desc, qty, unit, rate) => ({ desc, qty, unit, rate });

function landscapingDocs() {
  return [
    doc("invoice", "sent", "INV-1012", -2, 14, "Marcus Hale", "Weekly mow, edge & blow (4 visits)", [L("Mow, edge & blow", 4, "visit", 55)]),
    doc("invoice", "sent", "INV-1011", -9, 14, "Lena Ortiz", "Spring yard cleanup", [L("Labor: yard cleanup", 6, "hr", 50), L("Green waste haul-away", 1, "load", 85)]),
    doc("invoice", "sent", "INV-1009", -24, 14, "Tom Becker", "Mulch install, 6 cu yd", [L("Hardwood mulch", 6, "cu yd", 52), L("Labor: spread mulch", 5, "hr", 50)]),
    doc("invoice", "sent", "INV-1007", -33, 14, "Grace Kim", "Hedge & shrub trimming", [L("Labor: trimming", 4, "hr", 50), L("Debris haul-away", 1, "load", 45)]),
    doc("invoice", "paid", "INV-1010", -12, 14, "Ray Dunn", "Sod install, 500 sq ft", [L("Sod", 500, "sq ft", 0.9), L("Labor: prep & lay sod", 8, "hr", 50)]),
    doc("invoice", "paid", "INV-1008", -20, 14, "Ana Silva", "Sprinkler head repair (3)", [L("Sprinkler heads", 3, "ea", 14), L("Labor", 1.5, "hr", 50)]),
    doc("quote", "sent", "Q-118", -3, 30, "Jordan Price", "Backyard planting, 12 shrubs", [L("5 gal shrubs", 12, "ea", 38), L("Labor: planting", 7, "hr", 50)]),
    doc("quote", "sent", "Q-117", -6, 30, "Beth Moreno", "Fall cleanup + mulch", [L("Labor: cleanup", 5, "hr", 50), L("Mulch", 4, "cu yd", 52)])
  ];
}
module.exports = { landscapingDocs, day };
