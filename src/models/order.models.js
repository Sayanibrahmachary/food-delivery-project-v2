import mongoose from "mongoose";

const orderSchema= new mongoose.Schema
(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        foodId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"FoodItems"
        }
    },{timestamps: true}
)

export const Order= mongoose.model("Order",orderSchema)