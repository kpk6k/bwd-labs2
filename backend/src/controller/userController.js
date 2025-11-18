import userModel from "../database/model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     description: Creates a new user with the provided name and email. Email must be unique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             example1:
 *               summary: Example user creation
 *               value:
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             examples:
 *               example1:
 *                 summary: Example response
 *                 value:
 *                   id: 1
 *                   name: "John Doe"
 *                   email: "john.doe@example.com"
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - missing required fields or user already exists
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "name and email required"
 *               userExists:
 *                 summary: User already exists
 *                 value:
 *                   message: "user already exists"
 *       500:
 *         description: Internal server error
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

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

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
