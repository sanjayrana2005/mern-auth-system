const mongoose = require("mongoose")

const tempUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpiredAt: Date,
    verificationToken: String,
    verificationTokenExpiredAt: Date
},{timestamps:true})

const TempUserModel = mongoose.model("Temporary user",tempUserSchema)

module.exports = TempUserModel 