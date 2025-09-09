require("dotenv").config()
const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {

    try {
        const token = req.cookies?.token
        
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - no token provided",
                success: false
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)

        if (!decode) {
            return res.status(401).json({
                message: "Unauthorized - invalid token",
                success: false
            })
        }

        req.userId = decode.userId
        next()
    } catch (error) {
        res.status(500).json({
            message: error.name === "TokenExpiredError"
                ? "Session expired. Please login again."
                : "Unauthorized - invalid token",
            success: false
        })
    }

}

module.exports = verifyToken