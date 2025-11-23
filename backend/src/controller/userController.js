import userModel from "../database/model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the user
 *                 example: "Pa$w0rd"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields or user already exists
 *       500:
 *         description: Server error
 */

const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password required" })
        }

        // Check whether user already exists
        const isUserExists = await userModel.findOne({ where: { email } });
        if(isUserExists) {
            return res.status(400).json({ message: "user already exists" })
        }

        // Create user if it not exists yet
        const newUser = await userModel.create({ name, email, password, createdAt: new Date() });
        return res.status(201).json(newUser)
    } catch (err) {
	// Sequelize validation
		if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
    		return res.status(400).json({ message: 'Validation error', errors: err.errors?.map(e => e.message) || [] });
  		}
        next(err);
    }
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     description: Returns a list of all users in the system
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *             examples:
 *               example1:
 *                 summary: Example list of users
 *                 value:
 *                   - id: 1
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                     createdAt: "2023-01-01T00:00:00.000Z"
 *                     updatedAt: "2023-01-01T00:00:00.000Z"
 *                   - id: 2
 *                     name: "Jane Smith"
 *                     email: "jane.smith@example.com"
 *                     createdAt: "2023-01-02T00:00:00.000Z"
 *                     updatedAt: "2023-01-02T00:00:00.000Z"
 *       401:
 *         description: Unauthorized — missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 */

const getUsers = async (req, res, next) => {
    try {
        const users = await userModel.findAll()
        return res.status(200).json(users)
    } catch (err) {
        next(err)
    }
}

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the user
 *                 example: "Pa$w0rd"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account is locked
 *       500:
 *         description: Server error
 */

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "email and password required" });
        }

        // Find the user by email
        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

		// Check if account is locked
        const currentTime = new Date();
        if (user.isLocked && user.lockUntil > currentTime) {
            return res.status(403).json({ message: "Account is locked. Please try again later." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Increase failed attempts
            user.failed_attempts += 1;

            // Lock the account if attempts exceed limit
            if (user.failed_attempts > 5) {
                user.isLocked = true;
                user.lockUntil = new Date(currentTime.getTime() + 2 * 60 * 1000); // Lock for 2 minutes
            }
            await user.save();
            return res.status(401).json({ message: "Invalid email or password" });
        }

		// Reset failed attempts and unlock account on successful login
        user.failed_attempts = 0;
        user.isLocked = false;
        user.lockUntil = null;
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Token expires in 1 hour
        });

        return res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        next(err);
    }
}

export { getUsers, createUser, loginUser }
