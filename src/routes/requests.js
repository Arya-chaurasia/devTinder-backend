const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const router = express.Router();

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        console.log(fromUserId, "login user")
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "invalid status type" })
        }

       const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })

        if (existingConnectionRequest) {
            return res.status(400).send({
                message: "Request connection already exist"
            })
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();
        res.json({ message: "Connection send successfully", data })


    } catch (err) {
        //console.log(err, "Error in sending request")
        res.status(400).send("Error in sending request:" + err.message)
    }
})

router.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "status not allowed" })
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })

    if(!connectionRequest) {
        return res.status(400).json({message: "Connection request not found"})
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save()
    
    res.json({message: "Connection request " + status, data})
    } catch (error) {
        res.status(400).send("Error:" + error.message)
    }
})

module.exports = router 