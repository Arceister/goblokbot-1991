const db = require("./../../../service/database");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (parsed, event) => {
  var random = 0;
  if (!parsed.arg) {
    random = 1;
    var rawdata = db.open("bot/assets/kbbi.json");
    var kataw = rawdata.get();
    var h2 = kataw[Math.floor(Math.random() * kataw.length)].word;
  } else {
    random = 0;
    var h2 = parsed.arg;
  }
  var katax = h2;
  var url = "https://kbbi.kemdikbud.go.id/entri/" + encodeURIComponent(katax);
  let res = await axios.get(url);
  let body = res.data;
  var qr = 0;
  var qr_word = [];
  var qr_word_sementara = "";
  var $ = cheerio.load(body);
  var kata = "";
  if ($("h2").length) {
    if ($("span.text-danger").length) {
      kata = "Entri tidak ditemukan.";
    } else {
      if (
        $("h2[style=color\\:gray]") &&
        $("h2[style=color\\:gray]").text() == "Lampiran"
      ) {
        $("h2[style=color\\:gray]").remove();
      }
      $("h2").each(function(i, elm) {
        //$(elm).find("sup").remove();
        if ($(elm).find("sup")) {
          $(elm)
            .find("sup")
            .each(function(i, elm) {
              $(elm).replaceWith(" (" + $(elm).text() + ")");
            });
        }
        if ($(elm).children()[0]) {
          if ($(elm).children()[0]["name"] == "i") {
            var lemma =
              $(elm)
                .children()
                .text() + " ";
          } else if ($(elm).children()[0]["name"] == "br") {
            var lemma = $(elm)
              .clone()
              .children()
              .remove()
              .end()
              .text();
          } else {
            var lemma = $(elm)
              .clone()
              .children()
              .remove()
              .end()
              .text();
          }
        } else {
          var lemma = " " + $(elm).text();
        }
        if (i > 0) {
          kata += "\n";
        }
        lemma = lemma.trim();
        kata += "• ";
        if ($(elm).children()[0]) {
          if ($(elm).children()[0]["name"] == "i") {
            kata += bolditalikuy(lemma); //+ " (" + parseInt(i + 1) + ")");
          } else if ($(elm).children()[0]["name"] == "br") {
            kata += boldkuy(lemma); ///*+ " (" + parseInt(i + 1) + ")");
          } else {
            kata += boldkuy(lemma); // /*+ " (" + parseInt(i + 1) + ")");
          }
        } else {
          if (boldkuy(lemma).match(/undefined/i)) {
            kata += lemma;
          } else {
            kata += boldkuy(lemma);
          }
          //kata += boldkuy(" (" + parseInt(i + 1) + ")");
        }
        //}
        if (
          $(elm)
            .find("span.syllable")
            .text()
        ) {
          kata += " ";
          kata += $(elm)
            .find("span.syllable")
            .text();
        }
        kata += "\n";
        var non_standard = $(elm)
          .find("small")
          .text();
        //console.log($(elm).find("small").children())
        if (non_standard != "") {
          if (non_standard.match(/(\d+)/)) {
            non_standard = non_standard.replace(/(\d+)/, "");
            non_standard = non_standard.replace("(", "");
            non_standard = non_standard.replace(")", "");
            non_standard = non_standard.trim();
          }
          kata += non_standard;
          kata += "\n";
        }
        if (
          $(elm)
            .next()
            .next()
            .next()[0]["name"] == "b"
        ) {
          var x = $(elm)
            .next()
            .next()
            .next()
            .next()
            .next()
            .next();
        } else {
          var x = $(elm)
            .next()
            .next();
        }
        if (x.text() && x.text() == "prakategorial") {
          /*kata += "1. lihat ";
            kata += x.next().text();
            kata += "\n";*/
          kata += "1. ";
          kata += italikuy(x.text());
          kata += " cari: ";
          kata += x.next().text();
          kata += "\n";
          qr = 1;
          if (
            x
              .next()
              .text()
              .split(", ")
          ) {
            for (
              var i = 0;
              i <
              x
                .next()
                .text()
                .split(", ").length;
              i++
            ) {
              qr_word.push(
                x
                  .next()
                  .text()
                  .split(", ")[i]
              );
            }
          } else {
            qr_word.push(x.next().text());
          }
          //console.log(qr_word)
        } else {
          x.each(function(i, elm) {
            $(elm)
              .find("li")
              .each(function(i, elm) {
                kata += i + 1;
                kata += ". ";
                $(elm)
                  .find("span")
                  .each(function(i, elm) {
                    if (
                      $(elm)
                        .text()
                        .trim() != ""
                    ) {
                      kata += italikuy($(elm).text());
                      kata += " ";
                    }
                  });
                if ($(elm).find("font[color=green]")) {
                  $(elm)
                    .find("font[color=green]")
                    .replaceWith(
                      "; (" +
                        italikuy(
                          $(elm)
                            .find("font[color=green]")
                            .text()
                            .slice(1, -1)
                        ) +
                        ")"
                    );
                }
                var dd = $(elm)
                  .clone()
                  .find("font")
                  .remove()
                  .end();
                if ($(elm).find("b")) {
                  dd.find("b").each(function(i, elm) {
                    $(elm).replaceWith(boldkuy($(elm).text()));
                  });
                  //dd.find("b").replaceWith(boldkuy(dd.find("b").text()));
                }
                if ($(elm).find("i")) {
                  dd.find("i").each(function(i, elm) {
                    $(elm).replaceWith(italikuy($(elm).text()));
                  });
                }
                if ($(elm).find("sup")) {
                  dd.find("sup").each(function(i, elm) {
                    $(elm).replaceWith(" (" + $(elm).text() + ")");
                  });
                  //dd.find("sup").replaceWith(" ("+dd.find("sup").text()+")");
                }
                /*if ($(elm).find("a")) {
                    if($(elm).find("a").text().match(/(\d+)/)){
                      var ns2 = dd.find("a").text();
                      ns2 = ns2.replace($(elm).find("a").text().match(/(\d+)/)[0], " ("+$(elm).find("a").text().match(/(\d+)/)[0]+")");
                      dd.find("a").replaceWith(ns2);
                      }
                  }*/
                var definisi = dd.text();
                if (definisi.match(/→ /i)) {
                  var definisi2 = definisi.replace("→ ", "");
                  qr_word.push(definisi2);
                } else if (definisi.match(/lihat /i) && dd.find("a").text()) {
                  var definisi2 = definisi.replace("lihat ", "");
                  if (definisi2.split(", ")) {
                    for (var i = 0; i < definisi2.split(", ").length; i++) {
                      qr_word.push(definisi2.split(", ")[i]);
                    }
                  } else {
                    qr_word.push(definisi2);
                  }
                  qr_word_sementara = definisi2;
                }

                kata += definisi.replace(/:/g, ""); //dd.text();
                kata += "\n";
              });
          });
        }
      });
    }
  }
  var kata2 = kata;
  kata2 = kata2.slice(0, -1);
  //kata2 = kata2.replace("bentuk tidak baku", "bentuk tidak baku:");
  //kata2 = kata2.replace("varian " + katax.toLowerCase(), "varian: " + katax.toLowerCase());
  kata2 = kata2.replace(/  +/g, " ");
  if (kata2.match(/𝐦𝐚𝐤𝐬𝐢𝐦𝐮𝐦/)) {
    kata2 = "Pencarian Anda telah mencapai batas maksimum dalam sehari.";
  }
  if (kata2.match(/1. lihat /i) && kata2.match(boldkuy(qr_word_sementara))) {
    qr = 0;
  } else if (kata2.match(/1. lihat /i)) {
    qr = 1;
  }
  if (kata2.match(/→ /i)) {
    qr = 1;
  }

  var tes = {
    items: []
  };
  if (qr == 0) {
    if (random == 0) {
      var echo = {
        type: "text",
        text: kata2
      };
    } else {
      tes.items.push({
        type: "action",
        imageUrl:
          "https://2.bp.blogspot.com/-eyImLF4Q1Gs/WMSUZ9o3OEI/AAAAAAAAGFU/JLCFLbAVX2sJTBlWmfv3diyw043zAh3DACLcB/s1600/KBBI.png",
        action: {
          type: "message",
          label: "Random KBBI",
          text: "@bot kbbi"
        }
      });
      var echo = {
        type: "text",
        text: kata2,
        quickReply: tes
      };
    }
  } else {
    for (var i = 0; i < qr_word.length; i++) {
      var tes1 = {
        type: "action",
        action: {
          type: "message",
          label: qr_word[i],
          text: "@bot kbbi " + qr_word[i]
        }
      };
      tes.items.push(tes1);
    }
    if (random == 1) {
      tes.items.push({
        type: "action",
        imageUrl:
          "https://2.bp.blogspot.com/-eyImLF4Q1Gs/WMSUZ9o3OEI/AAAAAAAAGFU/JLCFLbAVX2sJTBlWmfv3diyw043zAh3DACLcB/s1600/KBBI.png",
        action: {
          type: "message",
          label: "Random KBBI",
          text: "@bot kbbi"
        }
      });
    }
    var echo = {
      type: "text",
      text: kata2,
      quickReply: tes
    };
  }
  return echo;
};

function italikuy(kata) {
  var italik = [
    "𝘢",
    "𝘣",
    "𝘤",
    "𝘥",
    "𝘦",
    "𝘧",
    "𝘨",
    "𝘩",
    "𝘪",
    "𝘫",
    "𝘬",
    "𝘭",
    "𝘮",
    "𝘯",
    "𝘰",
    "𝘱",
    "𝘲",
    "𝘳",
    "𝘴",
    "𝘵",
    "𝘶",
    "𝘷",
    "𝘸",
    "𝘹",
    "𝘺",
    "𝘻",
    "𝘈",
    "𝘉",
    "𝘊",
    "𝘋",
    "𝘌",
    "𝘍",
    "𝘎",
    "𝘏",
    "𝘐",
    "𝘑",
    "𝘒",
    "𝘓",
    "𝘔",
    "𝘕",
    "𝘖",
    "𝘗",
    "𝘘",
    "𝘙",
    "𝘚",
    "𝘛",
    "𝘜",
    "𝘝",
    "𝘞",
    "𝘟",
    "𝘠",
    "𝘡"
  ];
  var angkak = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var katabaru = "";
  for (var i = 0; i < kata.length; i++) {
    if (kata[i] == " ") {
      katabaru += " ";
    } else if (kata[i] == ".") {
      katabaru += ".";
    } else if (kata[i] == ",") {
      katabaru += ",";
    } else if (kata[i] == ")") {
      katabaru += ")";
    } else if (kata[i] == "(") {
      katabaru += "(";
    } else if (kata[i] == "-") {
      katabaru += "-";
    } else {
      if (Number.isInteger(parseInt(kata[i]))) {
        katabaru += angkak[parseInt(kata[i])];
      } else if (kata[i].charCodeAt(0) - 97 >= 0) {
        katabaru += italik[kata[i].charCodeAt(0) - 97];
      } else if (kata[i].charCodeAt(0) - 97 < 0) {
        katabaru += italik[kata[i].charCodeAt(0) - 65 + 26];
      }
    }
  }
  return katabaru;
}
function boldkuy(kata) {
  var tebal = [
    "𝐚",
    "𝐛",
    "𝐜",
    "𝐝",
    "𝐞",
    "𝐟",
    "𝐠",
    "𝐡",
    "𝐢",
    "𝐣",
    "𝐤",
    "𝐥",
    "𝐦",
    "𝐧",
    "𝐨",
    "𝐩",
    "𝐪",
    "𝐫",
    "𝐬",
    "𝐭",
    "𝐮",
    "𝐯",
    "𝐰",
    "𝐱",
    "𝐲",
    "𝐳",
    "𝐀",
    "𝐁",
    "𝐂",
    "𝐃",
    "𝐄",
    "𝐅",
    "𝐆",
    "𝐇",
    "𝐈",
    "𝐉",
    "𝐊",
    "𝐋",
    "𝐌",
    "𝐍",
    "𝐎",
    "𝐏",
    "𝐐",
    "𝐑",
    "𝐒",
    "𝐓",
    "𝐔",
    "𝐕",
    "𝐖",
    "𝐗",
    "𝐘",
    "𝐙"
  ];
  var angkab = ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗", "𝟏𝟎"];
  var katabaru = "";
  for (var i = 0; i < kata.length; i++) {
    if (kata[i] == " ") {
      katabaru += " ";
    } else if (kata[i] == ".") {
      katabaru += ".";
    } else if (kata[i] == ",") {
      katabaru += ",";
    } else if (kata[i] == ")") {
      katabaru += ")";
    } else if (kata[i] == "(") {
      katabaru += "(";
    } else if (kata[i] == "-") {
      katabaru += "-";
    } else {
      if (Number.isInteger(parseInt(kata[i]))) {
        katabaru += angkab[parseInt(kata[i])];
      } else if (kata[i].charCodeAt(0) - 97 >= 0) {
        katabaru += tebal[kata[i].charCodeAt(0) - 97];
      } else if (kata[i].charCodeAt(0) - 97 < 0) {
        katabaru += tebal[kata[i].charCodeAt(0) - 65 + 26];
      }
    }
  }
  return katabaru;
}
function bolditalikuy(kata) {
  var tebal = [
    "𝒂",
    "𝒃",
    "𝒄",
    "𝒅",
    "𝒆",
    "𝒇",
    "𝒈",
    "𝒉",
    "𝒊",
    "𝒋",
    "𝒌",
    "𝒍",
    "𝒎",
    "𝒏",
    "𝒐",
    "𝒑",
    "𝒒",
    "𝒓",
    "𝒔",
    "𝒕",
    "𝒖",
    "𝒗",
    "𝒘",
    "𝒙",
    "𝒚",
    "𝒛",
    "𝑨",
    "𝑩",
    "𝑪",
    "𝑫",
    "𝑬",
    "𝑭",
    "𝑮",
    "𝑯",
    "𝑰",
    "𝑱",
    "𝑲",
    "𝑳",
    "𝑴",
    "𝑵",
    "𝑶",
    "𝑷",
    "𝑸",
    "𝑹",
    "𝑺",
    "𝑻",
    "𝑼",
    "𝑽",
    "𝑾",
    "𝑿",
    "𝒀",
    "𝒁"
  ];
  var angkab = ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗", "𝟏𝟎"];
  var katabaru = "";
  for (var i = 0; i < kata.length; i++) {
    if (kata[i] == " ") {
      katabaru += " ";
    } else if (kata[i] == ".") {
      katabaru += ".";
    } else if (kata[i] == ",") {
      katabaru += ",";
    } else if (kata[i] == ")") {
      katabaru += ")";
    } else if (kata[i] == "(") {
      katabaru += "(";
    } else if (kata[i] == "-") {
      katabaru += "-";
    } else {
      if (Number.isInteger(parseInt(kata[i]))) {
        katabaru += angkab[parseInt(kata[i])];
      } else if (kata[i].charCodeAt(0) - 97 >= 0) {
        katabaru += tebal[kata[i].charCodeAt(0) - 97];
      } else if (kata[i].charCodeAt(0) - 97 < 0) {
        katabaru += tebal[kata[i].charCodeAt(0) - 65 + 26];
      }
    }
  }
  return katabaru;
}