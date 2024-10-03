import { Router } from "express";
import {inputFoodItem,
    deleteFoodItem,
    totalFoodItems,
    totalOrderForASingleFoodItem
    } from "../controllers/foodItems.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";
import {FoodItems} from "../models/foodItems.models.js";
const router =Router();

router.route("/inputFoodItems").post
(
    upload.fields
    ([
        {
            name: "photo",
            maxCount:1,
        }
    ]),
    inputFoodItem
)

router.route("/deleteFoodItem/:foodItemId").delete(deleteFoodItem)
router.route("/totalFoodItems").get(totalFoodItems)
router.route("/totalOrderForASingleFoodItem/:foodItemId").post(totalOrderForASingleFoodItem)

router.get("/food", async (req, res) => {
    try {
        const foodItems = await FoodItems.find();  // Fetch all food items from the database
        res.json(foodItems);  // Send the food items as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching food items', error });
    }
});

export default router