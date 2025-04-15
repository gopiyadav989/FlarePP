// Simple error handler - just catches errors and sends response
export const errorHandler = (err, req, res, next) => {
    console.log("Something went wrong:", err.message);
    
    // Just send a simple error response
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server"
    });
};