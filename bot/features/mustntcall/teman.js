const { isAdmin } = require("./../../utility");

module.exports = (parsed, event) => {
  return {
    type: "text",
    text: isAdmin(event.source.userId) ? "kenaps" : "apaan"
  };
};