import express from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req:any, res: any , next: express.NextFunction) => {
    // Get token from the authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' as string);
        
        // Attach user information to the request object for access in route handlers
        req.user = decoded; // You can type req.user if you have a user interface defined
        next(); // Call the next middleware or route handler
    } catch (err) {
        console.error("JWT verification error:", err);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

export default authMiddleware;
