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
        
        try {
            const savedUser = await newUser.save();
            console.log('Saved user:', savedUser);
        } catch (saveError:any) {
            console.error('Save error:', saveError);
            return res.status(500).json({ 
                message: 'Error saving user', 
                error: saveError.message,
                details: saveError 
            });
        }
        
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
        // Log the incoming request
        console.log('Login attempt with:', req.body);

        // Validate request body with Zod
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;
        console.log('Validated login data:', { email });

        // Find user by email
        try {
            const user = await User.findOne({ email });
            console.log('User found:', user ? 'Yes' : 'No');

            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare passwords
            if (!user.password) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', isMatch);

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
            const userData = user.toObject();
            delete userData.password;

            return res.status(200).json({
                message: 'Login successful',
                accessToken: token,
                user: userData,
            });
        } catch (findError: any) {
            console.error('Database query error:', findError);
            return res.status(500).json({ 
                message: 'Error finding user',
                error: findError.message 
            });
        }
    } catch (err: any) {
        console.error('Login error:', err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: err.errors });
        }
        return res.status(500).json({ 
            message: 'Server error',
            error: err.message 
        });
    }
};

export { register, login };
