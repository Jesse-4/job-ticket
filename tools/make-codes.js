// Makes unlock codes for Job Ticket. Run: node tools/make-codes.js 20
// Keep CODE_SALT the same as in app.html. Send one code to each paying customer.
// Don't commit the codes you hand out; keep them in private/ (ignored by git).
var CODE_SALT = "jt-launch-2026";
var ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var crypto = require("crypto");
function fnv(str) { var h = 0x811c9dc5; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
function codeCheck(id) { var h = fnv(CODE_SALT + "|" + id), out = ""; for (var i = 0; i < 4; i++) { out += ALPH[h % 32]; h = Math.floor(h / 32); } return out; }
var n = parseInt(process.argv[2], 10) || 10, seen = {};
while (Object.keys(seen).length < n) {
  var id = ""; for (var i = 0; i < 4; i++) id += ALPH[crypto.randomInt(32)];
  seen[id] = "JT-" + id + "-" + codeCheck(id);
}
console.log(Object.values(seen).join("\n"));
