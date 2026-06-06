import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1️⃣ REGISTER A NEW USER
export async function register(req, res) {
    try {
        const { email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to Database
        const newUser = await User.create({
            email,
            password: hashedPassword,
            role: role || "user"
        });

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
}

// 2️⃣ LOGIN USER & GENERATE TOKEN
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Invalid email or password" });

        // Create JWT Token
        // Make sure you add JWT_SECRET=your_super_secret_key_here to your .env file!
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed", details: err.message });
    }
}

// 3️⃣ GET LOGGED IN USER PROFILE
export async function getProfile(req, res) {
    try {
        // req.user.id is securely provided by our verifyToken middleware!
        const user = await User.findById(req.user.id).select("-password"); // Exclude the password from the response

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile", details: err.message });
    }
}