// sending email

require("dotenv").config()
const nodemailer = require("nodemailer");
const { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, PASSWORD_CHANGE_SUCCESS_TEMPLATE } = require("./email-template");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,   // true for 465, false for other port
    auth: {
        user: "sanjayrana5113@gmail.com",
        pass: process.env.GMAIL_PASSWORD
    }
})

const sendEmail = async (name, email, verificationCode) => {
    try {
        const info = await transporter.sendMail({
            from: '"Sanjay" <sanjayrana5113@gmail.com>',   // sender mail
            to: email,
            subject: "Verify your Email",
            text: "Hello world?", // plain‑text body
            html: VERIFICATION_EMAIL_TEMPLATE
                .replace("{verificationCode}", verificationCode)
                .replace("{name}", name), // HTML body
        });

    } catch (error) {
                throw new Error(`Error sendeing reset password success email : ${error}`)

    }
}

const sendWelcomeEmail = async (name, email) => {
    try {
        const info = await transporter.sendMail({
            from: '"Sanjay" <sanjayrana5113@gmail.com>',
            to: email,
            subject: "Well Come",
            html: WELCOME_EMAIL_TEMPLATE
                .replace("{name}", name)
        });
    } catch (error) {
                throw new Error(`Error sendeing reset password success email : ${error}`)

    }
}

const sendPasswordResetMail = async (name,email,otp) => {
    try {
        const info = await transporter.sendMail({
            from:'"Sanjay" <sanjayrana5113@gmail.com>',
            to:email,
            subject:"Reset your Password",
            html:PASSWORD_RESET_REQUEST_TEMPLATE
            .replace("{name}",name)
            .replace("{otp}",otp)
        })
    } catch (error) {
                throw new Error(`Error sendeing reset password success email : ${error}`)

    }
}

const sendSuccessEmail = async (name,email) => {
    try {
        const info = await transporter.sendMail({
            from:'"Sanjay" <sanjayrana5113@gmail.com>',
            to:email,
            subject:"Password reset successfull",
            html:PASSWORD_RESET_SUCCESS_TEMPLATE
            .replace("{name}",name)
        })
    } catch (error) {
        throw new Error(`Error sendeing reset password success email : ${error}`)
    }
}

const sendSuccessChangePasswordEmail = async (name,email) => {
    try {
        const info = await transporter.sendMail({
            from:'"Sanjay" <sanjayrana5113@gmail.com>',
            to:email,
            subject:"Password change successfull",
            html:PASSWORD_CHANGE_SUCCESS_TEMPLATE
            .replace("{name}",name)
        })
    } catch (error) {
        throw new Error(`Error sendeing reset password success email : ${error}`)
    }
}

module.exports = { sendEmail, sendWelcomeEmail,sendPasswordResetMail,sendSuccessEmail,sendSuccessChangePasswordEmail }

