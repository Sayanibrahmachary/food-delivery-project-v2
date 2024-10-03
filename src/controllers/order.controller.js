import {Order} from "../models/order.models.js";
import {User} from "../models/user.models.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
const {ObjectId}=mongoose.Types;


const getOrder=asyncHandler(async(req,res)=>
{
    const {foodItemId} =req.params;
    if(!isValidObjectId(foodItemId))
    {
        throw new ApiError(404,"Food item is not found");
    }
    const order= await Order.create({
        foodId:foodItemId,
        userId: req.user?._id
    })

    const savedOrder = await order.save();
    const user = await User.findById(req.user?._id);
    if (!user) 
    {
        throw new ApiError(404, "User not found");
    }
    user.orderId.push(savedOrder._id);
    await user.save();
    if(!order)
    {
        throw new ApiError("Sorry we can not get your order");
    }

    return res.status(200)
    .json(new ApiResponse(200,order,"Thank you for order"));
})

const deleteOrder=asyncHandler(async(req,res)=>
{
    const {OrderId} = req.params;
    if(!isValidObjectId(OrderId))
    {
        throw new ApiError(404,"Order is not found");
    }

    const deleteOrder = await Order.deleteOne({
        _id: new ObjectId(OrderId),
    });

    if(!deleteOrder.acknowledged)
    {
        throw new ApiError(400,"Error while deleteing the order from data base");
    }

    return res.status(200)
    .json(new ApiResponse(200,deleteOrder,"The order is deleted successfully"))
})

const totalOrders = asyncHandler(async(req,res)=>
{
    const totalorders = await Order.countDocuments();

    return res.status(200).json(new ApiResponse(200,{"Total orders= " : totalorders},"orders count is fetched successfully"))
})

export {
    getOrder,
    deleteOrder,
    totalOrders,
}