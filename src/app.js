import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}))

app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter)

import foodItemsRouter from "./routes/foodItems.routes.js";
app.use("/api/v1/foodItems",foodItemsRouter)

import orderRoutes from "./routes/order.routes.js"
app.use("/api/v1/order",orderRoutes);

export {app}