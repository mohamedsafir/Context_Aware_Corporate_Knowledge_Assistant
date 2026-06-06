import jwt from "jsonwebtoken";

// 1️⃣ Bouncer for Everyone: Must be logged in to access (e.g., to ask questions or view history)
export const verifyToken = (req, res, next) => {
    // Look for the token in the request headers
    const authHeader = req.header("Authorization");

    // If there is no token, block them
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        // The token looks like "Bearer eyJhbGci...", so we split it to get just the token part
        const token = authHeader.split(" ")[1];

        // Verify the token using your secret key from the .env file
        const verified = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

        // Attach the user info (id, role) to the request so the next function can use it
        req.user = verified;

        // Let them through to the actual route!
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid or expired token." });
    }
};

// 2️⃣ Bouncer for Admins Only: Role-Based Access Control (e.g., for uploading PDFs)
export const requireAdmin = (req, res, next) => {
    // We check the role we attached in the verifyToken step
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access Denied. Admin privileges required." });
    }

    // If they are an admin, let them through!
    next();
};