const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = require("./serverRoutes.js");
const port = 3000;
var ip = require("ip");

app.use(bodyParser.json());
app.use(router);
app.get("/", (req, res) => {
  res.send("");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
