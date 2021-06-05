module.exports = (parsed, event) => {
  if (!parsed.arg) return null;
  let msg = parsed.arg.split(" ");
  if (msg[0] == "mana" || msg[0] == "mana,") {
    var mending = (msg.slice(1, msg.length).join(" ") + " ").split(" atau ");
    var mendingan = "" + mending[0] + " " + mending[1];
    if (mending) {
      if (sumChars(mendingan) % 2 == 0) {
        var apakah = mending[0];
      } else {
        var apakah = mending[1];
      }
    }
    return { type: "text", text: apakah };
  }
};
function sumChars(s) {
  var i = s.length,
    r = 0;
  while (--i >= 0) r += charToNumber(s, i);
  return r;
}

function charToNumber(s, i) {
  return parseInt(s.charCodeAt(i)) - 1;
}
