// Basic validation functions

export const validateEmail = (email) => {
    return email.includes("@") && email.includes(".");
};

export const validateRole = (role) => {
    return role === "creator" || role === "editor";
};

export const sanitizeEmail = (email) => {
    return email.toLowerCase();
};