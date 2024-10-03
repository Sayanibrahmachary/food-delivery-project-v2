import {Router} from "express";
import 
{
    getOrder, 
    deleteOrder,
    totalOrders,
} from "../controllers/order.controller.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";


const router= Router()

router.route("/getOrder/:foodItemId").post(verifyJWT,getOrder);
router.route("/deleteOrder/:OrderId").delete(deleteOrder);
router.route("/totalOrders").post(totalOrders)

export default router