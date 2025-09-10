const express = require("express")
const connectDB = require("./config/connect")
const authRouter = require("./routes/auth-routes")
const cookieParser = require("cookie-parser")
require("dotenv").config()
const cors = require("cors")
const cron = require("node-cron")
const TempUserModel = require("./models/temperory-user-model")
// import path from "path"


const app = express()
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

const PORT = process.env.PORT || 8000;
// const __dirname = path.resolve()
app.use(express.json())  // allwos to parse incoming requests in JSON body : req.body

app.get("/", (req, res) => {
    res.send("API is running 🚀")
})
//signup,login or logout routes
app.use("/api/auth", authRouter)
// if(process.env.NODE_ENV === "production"){
//     app.use(express.static(path.join(__dirname,"/Frontend/dist")))

//     app.get("*", (req,res)=>{
//         res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
//     })
// }

// DB connection
connectDB().then(() => {
    if (process.env.NODE_ENV !== "production") {
        app.listen(PORT, () => {
            console.log(`Server is running at port : ${PORT}`);
        })
    }



    //delete temeperory users automatically
    cron.schedule("*/5 * * * *", async () => {
        await TempUserModel.deleteMany({ verificationTokenExpiredAt: { $lt: Date.now() } })
    })
})

// Export app for Vercel
module.exports = app;