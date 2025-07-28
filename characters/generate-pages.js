const fs = require("fs");
const characters = require("./character-data");

Object.entries(characters).forEach(([id, char]) => {
  const html = fs
    .readFileSync("./details/template.html", "utf8")
    .replace("{{NAME}}", char.name)
    .replace("{{ID}}", id);

  fs.writeFileSync(`./details/${id}.html`, html);
});
