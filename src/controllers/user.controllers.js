import mongoose, { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { Order } from "../models/order.models.js";


const generateAccessAndRefreshTokens = async(userId)=>
{
    try
    {
        const user=await User.findById(userId);

        if(!user)
        {
            throw new ApiError(404, "User is not found");
        }
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        console.log("sayani");

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken};
    }
    catch(error)
    {
        throw new ApiError(500, "Something went wrong while generateing access and refresh tokens");
    }
}

const signUp=asyncHandler(async(req,res)=>
{
    const {name,email,address,password,phoneNumber}=req.body;

    if(name=="")
    {
        throw new ApiError(400, "Name is required");
    }
    else if(address=="")
    {
        throw new ApiError(400,"Address is required");
    }
    else if(email=="")
    {
        throw new ApiError(400,"email is required");
    }
    else if(password=="")
    {
        throw new ApiError(400,"please give a password which protect your account, it is required");
    }
    else if(phoneNumber=="")
    {
        throw new ApiError(400,"Phone number is required");
    }

    else if(!email.includes("@") && !email.includes("$") && !email.includes("#") && !email.includes("&") && !email.includes("*"))
    {
        throw new ApiError(400,"pleace put any special character like @,#,$,&,*");
    }
    
    else if(password.length<8)
    {
        throw new ApiError(400, "Password is should be 8 character");
    }

    const exitedUser = await User.findOne ({
        $or: [{name},{email}]
    })

    if(exitedUser)
    {
        throw new ApiError(409, "User with email or username is already exits");
    }

    const avatarLocalPath= req.files?.avatar[0]?.path;

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    if(!avatar)
    {
        throw new ApiError(400,"Avatar is required");
    }
    const user=await User.create({
        name,
        email,
        address,
        password,
        avatar: avatar.url,
        phoneNumber,
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser)
    {
        throw new ApiError(500, "Something went worng while creating the user in time of registration");
    }

    return res
    .status(201)
    .json(new ApiResponse(201,createdUser,"User is registerd successfully"))
})

const logIn=asyncHandler(async(req,res)=>
{
    const {email,password}=req.body;
    const user=await User.findOne({email});

    if(!user)
    {
        throw new ApiError(404,"user is not found");
    }

    const ispassword = await user.isPasswordCorrect(password)

    if(!ispassword)
    {
        throw new ApiError(401,"Password is incorrect");
    }
    const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id);

    //send cookies
    const loggedIn= await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedIn,accessToken,refreshToken},"User loggedIn successfully"))
})

const logOut=asyncHandler(async(req,res)=>
{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:
            {
                refreshToken:1,
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true,
    }

    return res.status(200).cookie("accesstoken",options).cookie("refreshtoken",options)
    .json(new ApiResponse(200,{},"User logged in successfully"))
})

const changePassword=asyncHandler(async(req,res)=>
{
    const {email,oldPassword,newPassword}=req.body;

    const user=await User.findOne({email});
    if(!email)
    {
        throw new ApiError(404,"user is not found");
    }

    const ispasswordCorrect= await user.isPasswordCorrect(oldPassword);

    if(!ispasswordCorrect)
    {
        throw new ApiError(404,"Old password is wrong")
    }

    user.password=newPassword;
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200,{},"Password is changed successfully"))
})

const getOrderByUser=asyncHandler(async(req,res)=>
{
    const {userId} =req.params;

    if(!isValidObjectId(userId))
    {
        throw new ApiError(400, "userId is missing");
    }

    const order=await User.aggregate([
        {
            $match:
            {
                _id: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup:
            {
                from:"orders",
                localField: "orderId",
                foreignField:"_id",
                as:"orderByUser",
                pipeline:[
                    {
                        $lookup:
                        {
                            from:"fooditems",
                            localField:"foodId",
                            foreignField:"_id",
                            as:"getFoodOrder",
                        },
                    },
                    {
                        $unwind:"$getFoodOrder"
                    },
                ]
            }
        },
        {
            $addFields:
            {
                orderCount:
                {
                    $size:"$orderByUser",
                }
            }
        },
        {
            $unwind: "$orderByUser",
        },
        {
            $project:
            {
                orderCount: 1,
                foodName:"$orderByUser.getFoodOrder.foodName",
                pay:"$orderByUser.getFoodOrder.pay",
            }
        }
    ])

//     const statusCode = 200;  // Define the status code
//   console.log("Status Code:", statusCode); 
    return res.status(200)
    .json(new ApiResponse(200,order,"Ordered by this user is fetched successfully"));

})


export {
    signUp,
    logIn,
    logOut,
    changePassword,
    getOrderByUser,
}