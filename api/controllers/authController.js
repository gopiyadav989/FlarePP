import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import Creator from "../models/creatorModel.js";
import Editor from "../models/editorModel.js";


export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Input validation
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password, and role are required",
            });
        }

        // Basic email check
        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email",
            });
        }

        // Check role
        if (role !== "creator" && role !== "editor") {
            return res.status(400).json({
                success: false,
                message: "Role must be creator or editor",
            });
        }

        const Model = role === "editor" ? Editor : Creator;

        // Find user by email
        const validUser = await Model.findOne({ email: email.toLowerCase() });
        if (!validUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, validUser.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Create JWT payload
        const payload = {
            email: validUser.email,
            role: validUser.role,
            id: validUser._id,
        };

        // Generate JWT token with expiration
        const token = jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn: '7d' // Token expires in 7 days
        });

        // Remove password from user object
        const { password: pass, ...userWithoutPassword } = validUser._doc;

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'lax', // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        };

        // Set cookie and send response
        res.cookie("accessToken", token, cookieOptions).status(200).json({
            success: true,
            user: userWithoutPassword,
            message: "Login successful"
        });

    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
}

export const loginWithGoogle = async (req, res) => {
    try {
        const { fullName, email, role } = req.body;

        // Input validation
        if (!fullName || !email || !role) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and role are required",
            });
        }

        // Basic validation
        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email",
            });
        }

        if (role !== "creator" && role !== "editor") {
            return res.status(400).json({
                success: false,
                message: "Role must be creator or editor",
            });
        }

        const Model = role === "editor" ? Editor : Creator;

        // Check if user already exists
        const existingUser = await Model.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            // User exists, log them in
            const payload = {
                email: existingUser.email,
                role: existingUser.role,
                id: existingUser._id,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { 
                expiresIn: '7d' 
            });

            const { password: pass, ...userWithoutPassword } = existingUser._doc;

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            };

            res.cookie("accessToken", token, cookieOptions).status(200).json({
                success: true,
                user: userWithoutPassword,
                message: "Login successful with Google"
            });

        } else {
            // User doesn't exist, create new account
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            // Make username
            const username = fullName.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4);

            const newUser = new Model({
                name: fullName,
                username: username,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role,
            });

            await newUser.save();

            // Log in the new user immediately
            const payload = {
                email: newUser.email,
                role: newUser.role,
                id: newUser._id,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { 
                expiresIn: '7d' 
            });

            const { password: pass, ...userWithoutPassword } = newUser._doc;

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            };

            res.cookie("accessToken", token, cookieOptions).status(201).json({
                success: true,
                user: userWithoutPassword,
                message: "Account created and logged in successfully with Google"
            });
        }

    } catch (error) {
        console.error("Error during Google login:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
}


export const signup = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        // Input validation
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, password, and role are required",
            });
        }

        // Basic validation
        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        if (role !== "creator" && role !== "editor") {
            return res.status(400).json({
                success: false,
                message: "Role must be creator or editor",
            });
        }

        const Model = role === "editor" ? Editor : Creator;

        // Check if user already exists
        const existingUser = await Model.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Make username from name
        const username = fullName.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4);

        // Create new user
        const newUser = new Model({
            name: fullName.trim(),
            username: username,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role,
        });

        await newUser.save();

        // Remove password from response
        const { password: pass, ...userWithoutPassword } = newUser._doc;

        res.status(201).json({
            success: true,
            user: userWithoutPassword,
            message: "Account created successfully. You can now log in."
        });

    } catch (error) {
        console.error("Error during signup:", error.message);
        
        // Handle duplicate key error (in case of race condition)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};


export const logout = async (req, res) => {
    try {
        // Clear the access token cookie with the same options used when setting it
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        };

        res.clearCookie('accessToken', cookieOptions);
        
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Error during logout:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during logout"
        });
    }
}