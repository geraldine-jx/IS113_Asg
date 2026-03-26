const express = require("express");
const router = express.Router();

const Pet = require("../models/pet");
const authMiddleware = require("../middleware/authMiddleware");
const PetRequest = require("../models/petRequest");

// Home display

router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find();
    console.log(pets); //  check this
    res.render("pet/home-display", { pets });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});



// Eashvar's code (Admin giveup side)


// READ: view all rehome requests 
router.get("/admin/giveups", authMiddleware.requireAdmin, async (req, res) => {
    try{
        const submissions = await PetRequest.find({requestType:"rehome"})
            .populate("userId","username displayName email")
            .sort({createdAt :-1})
            .lean();

        res.render("admin/giveups", { submissions,error:null,message:null});
    } catch (err){
        console.log(err);
        res.status(500).send("Unable to load give-up submissions");
    }
});

//READ: view one rehome request
router.get("/admin/giveups/:id", authMiddleware.requireAdmin, async (req,res)=> {
    try{
        const submission = await PetRequest.findOne({
            _id : req.query.id,
            requestType: "rehome"
        })
            .populate("userID","username displayname email contact address")
            .populate("approvedBy", "username displayname")
            .lean();

        if(!submission) {
            return res.status(404).send("Submission not found");
        }

        res.render('/admin/giveup-details', {submission});
    } catch(err) {
        console.log(err);
        res.status(500).send("Unable to load submission details");
    }
});



// UPDATE: Approve submission
router.post("/admin/giveups/:id/approve", authMiddleware.requireAdmin, async (req, res) => {
    try{
        const submission = await PetRequest.fineOneAndUpdate(
            {_id: req.body.id, requestType: "rehome"},
            {status: "approved", approvedBy: req.session.userID},
            {new:true}
        );
        if (!submission){
            return res.status(404).send("Submission not found")
        }
        res.redirect("/home-display/admin/giveups");
    } catch(err){
        console.log(err)
        res.status(500).send("Unable to approve submission");
    }
});

// UPDATE: Reject submission
router.post("/admin/giveups/:id/reject", authMiddleware.requireAdmin, async (req, res)  => {
    try{
        const submission = await PetRequest.fineOneAndUpdate(
            {_id: req.body.id, requestType:"rehome"},
            {status: "rejected", approvedBy:req.session.userId},
            {new:true}
        );
        if (!submission){
            return res.status(404).send("Submission not found");
        }

        res.redirect("/home-display/admin/giveups");
    } catch(err){
        console.log(err);
        res.status(500).send("Unable to reject submission");
    }
});

//DELETE: remove listing
router.post("/admin.giveups/:id/delete", authMiddleware.requireAdmin, async(req,res)=> {
    try{
        const deletedSubmission = await PetRequest.findOneAndDelete({
            _id: req.body.id,
            requestType:"rehome"
        })
        if(!deletedSubmission){
            return res.status(404).send("Submission not found");
        }
        res.redirect("/home-display/admin/giveups");
    } catch(err){
        console.log(err);
        res.status(500).send("Unable to delete submission")
    }
});
// End of Eashvar's code (Admin give-up side)
module.exports = router;
