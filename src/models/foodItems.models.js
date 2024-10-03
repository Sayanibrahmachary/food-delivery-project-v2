import mongoose from "mongoose";

const foodSchema= new mongoose.Schema
(
    {
        foodName:
        {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description:
        {
            type: String,
            required: true,
        },
        photo:
        {
            type: String,
            required: true,
        },
        pay:
        {
            type: Number,
            required:true,
        },
    },{
        timestamps: true
    }
)

export const FoodItems=mongoose.model("FoodItems",foodSchema);