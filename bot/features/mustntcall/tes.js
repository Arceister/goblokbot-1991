module.exports = {
  data: {
    name: "Tes",
    description: "buat ngetes bot",
    usage:
      "tes {options} <*>!" +
      "\n\noptions:" +
      "\n--args ?: mengaktifkan echo arguments & query",
    CMD: "tes",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    if (parsed.args.args) {
      return {
        type: "text",
        text: JSON.stringify(
          Object.assign(parsed.args, { _: parsed.arg }),
          null,
          1
        )
      };
    }
    if (!!parsed.arg) {
      return null;
    }
    let lat = Date.now() - event.timestamp;
    return {
      type: "text",
      text: "tis\n\n" + lat + " ms",
      latency: lat
    };
  }
};
