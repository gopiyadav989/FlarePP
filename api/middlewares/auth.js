import jwt from "jsonwebtoken";

export async function auth(req, res, next) {
    try {
        // Get token from cookies (no need for await on synchronous operation)
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Access token not found. Please login again." 
            });
        }

        // Verify JWT token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token has required fields
        if (!decodedToken.id || !decodedToken.role || !decodedToken.email) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token format. Please login again." 
            });
        }

        // Set user context
        req.user = decodedToken;
        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Token has expired. Please login again." 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. Please login again." 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: "Authentication failed. Please login again." 
        });
    }
}

export function isCreator(req, res, next) {
    try {
        if (req.user.role !== "creator") {
            return res.status(403).json({ message: "Access denied. Not a creator." });
        }
        next();
    } catch (error) {
        console.error("isCreator Middleware Error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

export function isEditor(req, res, next) {
    try {
        if (req.user.role !== "editor") {
            return res.status(403).json({ message: "Access denied. Not an editor." });
        }
        next();
    } catch (error) {
        console.error("isEditor Middleware Error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
}