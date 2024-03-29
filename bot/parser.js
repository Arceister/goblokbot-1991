const { parseArgsStringToArgv } = require("string-argv");

module.exports = {
  parse,
  parseArg,
  buildFromParsed,
  buildArgs,
  removeArgFromMsg,
  removeParserArgs,
  restoreParserArgs
};

function parse(message, caller) {
  let start = Date.now();
  message = message.trim().replace(/(?:\r\n|\r|\n)/g, " ");

  let splitted = message.split(" ");

  let args = "";
  let _caller = "";
  let isShortcut = false;
  let command = "";
  let firstword = splitted.shift().toLowerCase();

  if (firstword === caller.normal || caller.custom.normal[firstword]) {
    command = splitted.shift() || "";
    _caller = firstword;
  } else {
    let prefix = firstword.charAt(0);
    if (prefix === caller.shortcut || caller.custom.shortcut[prefix]) {
      command =
        firstword.length === 1 ? splitted.shift() : firstword.substring(1);
      _caller = prefix;
      isShortcut = true;
    } else {
      command = firstword;
      _caller = "";
    }
  }

  args = splitted.join(" ");

  let parsearg = parseArg(args);

  let parsed = {
    caller: _caller,
    called: !!_caller,
    shortcut: isShortcut,
    command: command.toLowerCase(),
    args: parsearg.args,
    arg: parsearg.arg.join(" ").replace(/\\(?!\\|\})/g, ""),
    fullMsg: message,
    parseTime: Date.now() - start
  };

  return parsed;
}

function parseArg(text) {
  let args1format = `^-{1}([a-zA-Z_]\\w*[-\\w]*)`;
  let args2format = `^-{2}([a-zA-Z_]\\w*[-\\w]*)`;

  let args1regex = new RegExp(args1format);
  let args2regex = new RegExp(args2format);
  let args1eqregex = new RegExp(args1format + "=");

  let args = parseArgsStringToArgv(text);
  let out = {};
  let arg = [];

  let idx = 0;
  while (idx < args.length) {
    let word = args[idx];

    // replace equal sign if any
    if (args1eqregex.test(word)) {
      let eq_i = word.indexOf("=");
      let splt = [word.substring(0, eq_i), word.substring(eq_i + 1)];
      let join = splt.join(" ");
      splt = parseArgsStringToArgv(join);
      args[idx] = splt[0];
      args.splice(idx + 1, 0, splt[1]);
      text = text.replace(word, join);
      continue;
    }

    if (args1regex.test(word)) {
      let custombracket = out.b;
      let usecustbracket = false;
      if (custombracket) {
        let cust = getcustbracket(custombracket);
        let regex = new RegExp(
          `${escapeRegExp(word)}[.\\s\\n\\r\\t]*?\\${cust[0]}((.|\\n|\\r|\\t)*?)\\${cust[1]}`
        );
        if (regex.test(text)) {
          usecustbracket = true;
          let thearg = args1regex.exec(word);
          let theval = regex.exec(text);
          out[thearg[1]] = theval[1]; // tolowercase
          text = text.replace(theval[0], " removed");
          args = parseArgsStringToArgv(text);
        }
      }
      if (!usecustbracket) {
        out[word.replace("-", "")] = args[idx + 1] // tolowercase
          ? args[idx + 1].replace(/\\(?!\\|\})/g, "")
          : null;
        idx++;
      }
    } else if (args2regex.test(word)) {
      out[word.replace("--", "")] = true; // tolowercase
    } else {
      arg.push(word);
    }

    idx++;
  }

  // delete out["b"];
  // console.log(out);

  return { args: out, arg: arg };
}

function getcustbracket(val) {
  let out = [];
  if (val.length >= 2) {
    out.push(val[0]);
    out.push(val[1]);
  } else {
    out.push(val[0]);
    out.push(val[0]);
  }

  return out;
}

function buildFromParsed(parsed, commandonly = false) {
  let out = "";
  out += parsed.caller;

  if (parsed.called && !parsed.shortcut) {
    out += " ";
  }

  out += parsed.command;

  if (!commandonly) {
    out += buildArgs(parsed);
    out += " " + parsed.arg;
  }

  return out;
}

function buildArgs(parsed) {
  const makebracket = (t, cb = null) => {
    if (t.split(" ").length > 0) {
      let b = '"';
      if (t.match(/"/g)) {
        b = "'";
      }
      if (cb) {
        if (cb === -1) {
          b = "";
        } else {
          b = cb;
        }
      }
      if (t[0] === ";") {
        t = "\\" + t;
      }
      t = `${b}${t}${b}`;
    }
    return t;
  };

  let out = "";
  let args = Object.keys(parsed.args);
  let b = parsed.args.b;

  args.forEach(arg => {
    out += " ";
    if (parsed.args[arg] === true) {
      out += "--" + arg;
    } else {
      let cb = arg === "b" ? -1 : b;
      out += "-" + arg + " " + makebracket(parsed.args[arg], cb);
    }
  });

  return out;
}

function removeArgFromMsg(msg, arg) {
  let args = Object.keys(arg);
  msg = msg.replace(/\n/g, " ");

  let list_arg = [];

  for (let i = 0; i < args.length; i++) {
    if (arg[args[i]] === true) {
      list_arg.push(" --" + args[i]);
    } else {
      let argz = arg[args[i]];
      if (argz) {
        argz = " " + argz;
      } else {
        argz = "";
      }
      list_arg.push(" -" + args[i] + argz);
    }
  }

  for (let j = 0; j < list_arg.length; j++) {
    msg = msg.replace(list_arg[j], "");
  }

  return msg;
}

function removeParserArgs(parsed) {
  let reserved = {};

  if (parsed.args.b) {
    reserved.b = parsed.args.b;
    delete parsed.args["b"];
  }

  return reserved;
}

function restoreParserArgs(parsed, data) {
  Object.assign(parsed.args, data);
  return parsed;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
