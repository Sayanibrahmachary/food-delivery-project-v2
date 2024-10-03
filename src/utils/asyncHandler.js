const asyncHandler=(fun)=>async(req,res,next)=>
{
    try{
        await fun(req,res,next)
    }
    catch(error){
        console.log("Error caught in asyncHandler:", error);
        res.status(error.code || 500).json
        ({
            succes: false,
            message: error.message,
        })
    }
}
export {asyncHandler}