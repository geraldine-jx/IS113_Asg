server.get("/give-up-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "give-up-dog.html"));
});

server.get("/adopt-dog", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "adopt-dog.html"));
});