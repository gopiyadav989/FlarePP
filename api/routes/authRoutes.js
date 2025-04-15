import express from "express";
import { login, loginWithGoogle, signup, logout } from "../controllers/authController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/signup", signup);
router.post("/loginwithgoogle", loginWithGoogle);

// Protected routes
router.post("/logout", auth, logout); // Changed to POST for better security and added auth middleware

// Route to verify authentication status
router.get("/verify", auth, (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        },
        message: "Authentication verified"
    });
});

export default router;
