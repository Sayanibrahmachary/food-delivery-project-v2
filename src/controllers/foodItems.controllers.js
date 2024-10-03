import { FoodItems } from "../models/foodItems.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {isValidObjectId} from "mongoose";
const { ObjectId } =mongoose.Types;

const inputFoodItem = asyncHandler(async(req,res)=>
{
    const {foodName,description,pay} =req.body;

    if(foodName=="")
    {
        throw new ApiError(400,"foodName is required");
    }
    else if(description=="")
    {
        throw new ApiError(400,"foodName is required");
    }
    else if(pay=="")
    {
        throw new ApiError(400,"foodName is required");
    }
    
    const photoPath= req.files?.photo[0]?.path;

    if(!photoPath)
    {
        throw new ApiError(400,"Photo is required");
    }

    const photo= await uploadOnCloudinary(photoPath);
    
    if(!photo)
    {
        throw new ApiError(400,"Photo is required");
    }

    const foodItem=await FoodItems.create({
        foodName,
        description,
        pay,
        photo: photo.url,
    })

    if(!foodItem)
    {
        throw new ApiError("Something went worng while creating the fooditems");
    }

    return res.status(200)
    .json(new ApiResponse(200,foodItem,"Food Item is createing successfully"));
})

const deleteFoodItem = asyncHandler(async(req,res)=>
{
    const { foodItemId } = req.params
    
    if(!isValidObjectId(foodItemId))
    {
        throw new ApiError(401,"Invalid videoId");
    }
    
    const deleteResponse= await FoodItems.deleteOne({
        _id: new ObjectId(foodItemId),
    });

    if(!deleteResponse.acknowledged)
    {
        throw new ApiError(401,"Error while deleteing food item from data base");
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"FoodItem is deleted successfully"));
})

const totalFoodItems = asyncHandler(async(req,res)=>
{
    const totalFoodItems = await FoodItems.countDocuments();

    return res.status(200).json(new ApiResponse(200,{"Total food items=" : totalFoodItems},"food items count is fetched successfully"))
})

const totalOrderForASingleFoodItem = asyncHandler(async(req,res)=>
{
    const {foodItemId} = req.params;

    const order = await FoodItems.aggregate([
        {
            $match:
            {
                _id: new mongoose.Types.ObjectId(foodItemId),
            },
        },
        {
            $lookup:
            {
                from:"orders",
                localField:"_id",
                foreignField:"foodId",
                as:"order",
                pipeline:[
                    {
                        $lookup:
                        {
                            from:"users",
                            localField:"userId",
                            foreignField:"_id",
                            as:"userDetails"
                        }
                    },
                    {
                        $unwind:"$userDetails"
                    }
                ]
            }
        },
        {
            $addFields:
            {
                orderCount:
                {
                    $size:"$order"
                }
            }
        },
        {
            $unwind:"$order"
        },
        {
            $project:
            {
                orderCount:1,
                name:"$order.userDetails.name",
                email:"$order.userDetails.email",
                avatar:"$order.userDetails.avatar",
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200,order,"Order is fetched successfully"))
})

export {
    inputFoodItem,
    deleteFoodItem,
    totalFoodItems,
    totalOrderForASingleFoodItem
}