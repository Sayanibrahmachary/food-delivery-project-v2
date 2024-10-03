import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT= asyncHandler (async(req,_,next)=>
{
    try {
        const token = req.cookies ?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token)
        {
            throw new ApiError(401,"Unauthorized token")
        }

        // console.log("Access Token:", token);  // Log the token from the headers
        // console.log("Access Token Secret:", process.env.ACCESS_TOKEN_SECRET);
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user)
        {
            //discuss about fronted
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user=user;
        next()
    } 
    catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})