import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../validation/userValidation';
import User from '../models/users';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Registration function
const register = async (req: any, res: any) => {
    try {
        // Validate the request body with Zod schema
        const validatedData = registerSchema.parse(req.body);
        const { firstname, lastname, email, password } = validatedData;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); 
        // Create a new user
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: err.errors });
        }
        return res.status(500).json({ message: 'Server error' });
    }
};

// Login function
const login = async (req: any, res: any) => {
    try {
        // Validate request body with Zod
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords

        const isMatch = await bcrypt.compare(password, user.password); // Use await for async comparison
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '30d' }
        );

        // Prepare user data without the password
        const { password: _, ...userData } = user.toObject();

        // Send response with token and user data
        return res.status(200).json({
            message: 'Login successful',
            accessToken: token,
            user: userData,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: err.errors });
        }
        return res.status(500).json({ message: 'Server error' });
    }
};

export { register, login };
