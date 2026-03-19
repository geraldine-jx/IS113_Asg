const express = require("express");
const router = express.Router();

// Redner display and update available dogs

router.get("/", (req, res) => {

    //change to get pets from database later
    const pets = [
        {name: "Max", breed: "Golden Retriever", age: 3, status: "Available"},
        {name: "Luna", breed: "Husky", age: 2, status: "Available"}
    ]

    res.render("home-display", { pets: pets })
})
module.exports = router;

router.get('/admin/giveups' ,(req,res) => {

    const submission = giveUpSubmissions.find(item => item.id === req.params.id);
    if (submission && submission.status === 'Pending'){
        submission.status = "Accepted";
    }
    res.redirect('/admin/giveups');
});

router.post("/admin/giveups/:id/reject", (req, res) => {
  const submission = giveUpSubmissions.find(item => item.id === req.params.id);

  if (submission && submission.status === "Pending") {
    submission.status = "Rejected";
  }

  res.redirect("/admin/giveups");
});
router.get("/admin/giveups/:id", (req, res) => {
  const submission = giveUpSubmissions.find(item => item.id === req.params.id);

  if (!submission) {
    return res.status(404).send("Submission not found");
  }

  res.send(`
    <h1>Submission Details</h1>
    <p><strong>Submission ID:</strong> ${submission.id}</p>
    <p><strong>Name:</strong> ${submission.name}</p>
    <p><strong>Age:</strong> ${submission.age}</p>
    <p><strong>Status:</strong> ${submission.status}</p>
    <p><a href="/admin/giveups">Back</a></p>
  `);
});

module.exports = router;