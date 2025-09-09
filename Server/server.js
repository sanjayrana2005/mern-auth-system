const express = require("express")
const connectDB = require("./config/connect")
const authRouter = require("./routes/auth-routes")
const cookieParser = require("cookie-parser")
require("dotenv").config()
const cors = require("cors")
const cron = require("node-cron")
const TempUserModel = require("./models/temperory-user-model")


const app = express()
app.use(cookieParser())
app.use(cors({
    origin:process.env.FRONTEND_URL || "http://localhost:5173",
    credentials:true
}))

const PORT = process.env.PORT || 8080
app.use(express.json())  // allwos to parse incoming requests in JSON body : req.body

//signup,login or logout routes
app.use("/api/auth",authRouter)


// DB connection
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at port : ${PORT}`); 


        //delete temeperory users automatically
        cron.schedule("*/5 * * * *",async () => {
            await TempUserModel.deleteMany({verificationTokenExpiredAt : {$lt : Date.now()}})
        })
    })
})
