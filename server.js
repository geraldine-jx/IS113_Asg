// Main area to facilitate the Pets platform
const express = require("express");
const server = express();
const path = require("path");

server.set("view engine", "ejs");

server.use("/", express.static(path.join(__dirname, "public")))
server.use(express.urlencoded({ extended: true }));

//Start of Express Router Code

const home = require("./routes/homePage");

server.use("/home-display", home);


//End of Express Router Code

const hostname = "127.0.0.1";
const port = 8000;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});