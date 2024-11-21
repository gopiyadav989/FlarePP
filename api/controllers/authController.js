import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import User from "../models/userModel.js";

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        const validUser = await User.findOne({ email });
        if (!validUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }


        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Password Incorrect",
            })
        }

        const token = jwt.sign({ userId: validUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = validUser._doc;
        console.log(token);
        
        res.cookie("access-token", token, { httpOnly: true }).status(200).json({
            success: true,
            user: rest,
            token: token,
        });


    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "login fail"
        })

    }
}


export const signup = async (req, res) => {

    const { fullName, email, password, role } = req.body

    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already in use",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 7);
        const newUser = new User({
            name: fullName,
            email,
            password: hashedPassword,
            role: "creator",
            username: fullName.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
        })

        await newUser.save();
        console.log("User created Successfully - authController,signup")

        res.status(201).json({
            success: true,
            message: "user created succesfully"
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Signup fail",
        });
    }

};