const mongoose = require("mongoose")

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
         ref:"User"
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "rejected", "accepted"]
        }
    }
},
    {
        timestamps: true
    })

    connectionRequestSchema.index({fromUserId:1, toUserId:1})

connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Cannot send connection to yourself")
    }
    next()
})


const ConnectionRequest = new mongoose.model("ConnectionRequest", connectionRequestSchema)

module.exports = ConnectionRequest