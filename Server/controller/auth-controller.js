const UserModel = require("../models/user-models")
const bcrypt = require("bcrypt")
const generateTokenAndSetCookie = require("../utils/generateTokenAndSetCookie")
const { sendEmail, sendWelcomeEmail, sendPasswordResetMail, sendSuccessEmail,sendSuccessChangePasswordEmail } = require("../config/nodemailer")
const crypto = require("crypto")
const TempUserModel = require("../models/temperory-user-model")
require("dotenv").config()

// signup controller
const signupController = async (req, res) => {
    const { name, email, password } = req.body
    try {
        if (!name || !email || !password) {
            throw new Error("All fields are required")
        }

        const userAreadyExist = await UserModel.findOne({ email })

        if (userAreadyExist) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

        const tempUser = new TempUserModel({
            name,
            email,
            password: hashPassword,
            verificationToken,
            verificationTokenExpiredAt: new Date(Date.now() + 1 * 60 * 1000) // 1 min
        })

        await tempUser.save()

        // jwt 
        generateTokenAndSetCookie(res, tempUser._id)

        await sendEmail(tempUser.name, tempUser.email, verificationToken)

        res.status(201).json({
            message: "OTP sent to your email. Verify to complete signup",
            success: true,
            user: tempUser,
        })

    } catch (error) {
        res.status(400).json({
            message: error.message,
            success: false
        })
    }
}

//email verification
const verifyEmail = async (req, res) => {
    // code 1,2,3,4,5
    const { code } = req.body
    try {
        const tempUser = await TempUserModel.findOne({
            verificationToken: code,
            // verificationTokenExpiredAt:{$gt : Date.now()}
        })

        if (!tempUser) {
            return res.status(400).json({
                message: "Wrong verification code",
                success: false
            })
        }

        // code is expired
        if (tempUser.verificationTokenExpiredAt < Date.now()) {
            tempUser.verificationToken = undefined
            tempUser.verificationTokenExpiredAt = undefined

            return res.status(400).json({
                message: "Verification Code has expired",
                success: false
            })
        }


        const user = await UserModel.create({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            isVerified: true
        })

        await TempUserModel.deleteOne({ _id: tempUser._id })

        // code is valid
        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiredAt = undefined
        await user.save()

        //token
        generateTokenAndSetCookie(res, user._id)

        // send welcome email
        await sendWelcomeEmail(user.name, user.email)

        res.status(200).json({
            message: "Email verified successfully",
            success: true,
            user
        })
    } catch (error) {
        res.status(400).json({
            message: error.message,
            success: false
        })
    }

}


const resendCode = async (req, res) => {
    const { email } = req.body
    try {
        const tempUser = await TempUserModel.findOne({ email })

        if (!tempUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (tempUser.isVerified) {
            return res.status(400).json({
                message: "User already verified",
                success: false
            })
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        tempUser.verificationToken = newOtp
        tempUser.verificationTokenExpiredAt = new Date(Date.now() + 60 * 1000)  // 1 min

        await tempUser.save()

        await sendEmail(tempUser.name, tempUser.email, newOtp);

        res.status(200).json({
            message: "A new verification code has been sent to your email",
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}

const loginController = async (req, res) => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        const userExist = await UserModel.findOne({ email })

        if (!userExist) {
            return res.status(400).json({
                message: "User does not exist",
                success: false
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, userExist.password)

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: true
            })
        }

        generateTokenAndSetCookie(res, userExist._id)

        userExist.lastLogin = new Date()

        await userExist.save()

        res.status(200).json({
            message: "Logged in successfully",
            success: true,
            user: userExist
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Server error",
            success: false
        })
    }

}

const logoutController = (req, res) => {
    try {
        res.clearCookie("token")
        res.status(200).json({
            message: "Logged out successfully",
            success: true
        })
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            success: false
        })
    }
}

const requestResetPassword = async (req, res) => {
    const { email } = req.body
    try {
        const userExist = await UserModel.findOne({ email })

        // user not found
        if (!userExist) {
            return res.status(400).json({
                message: "Invalid email",
                success: false
            })
        }


        // generate code
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

        userExist.resetPasswordToken = resetToken
        userExist.resetPasswordExpiredAt = resetTokenExpiresAt

        await userExist.save()

        // send mail
        await sendPasswordResetMail(userExist.name, userExist.email, userExist.resetPasswordToken)

        res.status(200).json({
            message: "Password reset OTP sent to your email",
            success: true,
            user: userExist
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Server error",
            success: false
        })

    }
}

//verify OTP
const verifyOTPLoggedOut = async (req, res) => {
    try {
        const { otp } = req.body // for logged out

        if (!otp) {
            return res.status(400).json({
                message: "We couldn’t find a password reset OTP. Please try again",
                success: false
            })
        }

        user = await UserModel.findOne({ resetPasswordToken: otp })

        if (!user) {
            return res.status(400).json({
                message: "Invalid OTP",
                success: false,
            });
        }

        // token but token expired

        if (user.resetPasswordExpiredAt < Date.now()) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpiredAt = undefined

            return res.status(400).json({
                message: "This password reset OTP has expired. Please request a new one.",
                success: false
            });
        }
        user.resetPasswordToken = undefined
        user.resetPasswordExpiredAt = undefined
        user.otpVerified = true;
        await user.save()

        res.status(200).json({
            message: "OTP verified successfull",
            success: true,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Server error",
            success: false
        })
    }
}

//reset PAssword
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!password) {
            return res.status(400).json({
                message: "New password is required",
                success: false
            })
        }

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            });
        }

        const user = await UserModel.findOne({ email, otpVerified: true })
        if (!user) {
            return res.status(400).json({
                message: "OTP not verified",
                success: false,
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiredAt = undefined;
        user.otpVerified = undefined;

        await user.save();

       await sendSuccessEmail(user.name,user.email)

        return res.status(200).json({
            message: "Password reset successful",
            success: true,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message || "Server error", success: false });
    }
}

const resendOTP = async (req, res) => {
    const { email } = req.body
    try {
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        // if (user.isVerified) {
        //     return res.status(400).json({
        //         message: "User already verified",
        //         success: false
        //     })
        // }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = newOtp
        user.resetPasswordExpiredAt = new Date(Date.now() + 60 * 1000)  // 1 min

        await user.save()

        await sendPasswordResetMail(user.name, user.email, newOtp);

        res.status(200).json({
            message: "A new OTP has been sent to your email",
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}

const changePassword = async (req, res) => {

    const {currentPassword, newPassword } = req.body;
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({
                message: "Authentication failed. Please log in again.",
                success: false
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "All fields are requireds",
                success: false
            })
        }

        const user = await UserModel.findById( userId)
        if (!user) {
            return res.status(400).json({
                message: "Invalid email",
                success: false
            })
        }

        const isPasswordMAtch = await bcrypt.compare(currentPassword,user.password)

        if(!isPasswordMAtch){
            return res.status(400).json({
                message:"Current password is incorrect",
                success:false
            })
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "New password cannot be same as old password", 
            success: false });
        }

        const hashNewPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashNewPassword

        await user.save()

       await sendSuccessChangePasswordEmail(user.name, user.email)

        res.status(200).json({
            message: "Password changed successfull",
            success: true,
            user
        });


    } catch (error) {
        res.status(500).json({
            message: error.message || "Server error",
            success: false
        })
    }
}

const chechAuth = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

module.exports = { signupController, verifyEmail, requestResetPassword, resendCode, loginController, logoutController, verifyOTPLoggedOut, resetPassword, resendOTP, changePassword, chechAuth }