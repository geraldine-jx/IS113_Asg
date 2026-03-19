const express = require("express");
const router = express.Router();

// Home display
router.get("/", (req, res) => {
    const pets = [
        { name: "Max", breed: "Golden Retriever", age: 3, status: "Available" },
        { name: "Luna", breed: "Husky", age: 2, status: "Available" }
    ];

    res.render("home-display", { pets: pets });
});

// Temporary sample data for admin give-up submissions
let giveUpSubmissions = [
    {
        id: "01",
        photo: "",
        name: "Rufus",
        age: 9,
        status: "Pending"
    },
    {
        id: "02",
        photo: "",
        name: "Milo",
        age: 7,
        status: "Accepted"
    }
];

// Show admin give-up submissions page
router.get("/admin/giveups", (req, res) => {
    res.render("admin/giveups", { submissions: giveUpSubmissions });
});

// Approve submission
router.post("/admin/giveups/:id/approve", (req, res) => {
    const submission = giveUpSubmissions.find(item => item.id === req.params.id);

    if (submission && submission.status === "Pending") {
        submission.status = "Accepted";
    }

    res.redirect("/home-display/admin/giveups");
});

// Reject submission
router.post("/admin/giveups/:id/reject", (req, res) => {
    const submission = giveUpSubmissions.find(item => item.id === req.params.id);

    if (submission && submission.status === "Pending") {
        submission.status = "Rejected";
    }

    res.redirect("/home-display/admin/giveups");
});

// View submission details
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
        <p><a href="/home-display/admin/giveups">Back</a></p>
    `);
});

module.exports =router;