import mongoose from "mongoose";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";

const userSchema =new mongoose.Schema
({
    name:
    {
        type: String,
        required: true,
        unique:true,
        trim:true,
        index:true,
    },
    email:
    {
        type: String,
        required: true,
    },
    address:
    {
        type: String,
        required:true,
        unique: true,
        trim: true,
    },
    password:
    {
        type: String,
        required:true,
        unique: true,
    },
    avatar:
    {
        type: String,
        required: true,
    },
    phoneNumber:
    {
        type:Number,
        required: true,
        unique: true,
    },
    orderId:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    refreshToken:
    {
        type: String,
    },
},{timestamps:true}
)


userSchema.pre("save",async function (next) {
    if(!this.isModified("password"))
    {
        next();
    }
    this.password= await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken= function ()
{
    return jwt.sign
    (
        {
            _id:this._id,
            email:this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function ()
{
    return jwt.sign
    (
        {
            id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}
export const User=mongoose.model("User",userSchema);