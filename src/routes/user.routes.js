import { Router } from "express";
import { logIn, signUp,logOut,changePassword,getOrderByUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router =Router();

router.route("/signUp").post
(
    upload.fields([
        {
            name: "avatar",
            maxCount:1,
        },
    ]),
    signUp
)
router.route("/login").post(logIn);
router.route("/logout").post(verifyJWT,logOut);
router.route("/changepassword").post(verifyJWT,changePassword);
router.route("/c/:userId").post(getOrderByUser);
export default router