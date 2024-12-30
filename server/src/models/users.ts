import mongoose from 'mongoose';

export interface IUser extends Document {
    email: string;
    firstname: string;
    lastname: string;
    password?: string;
    createdAt: Date;
  }
  
// Define the User Schema
const userSchema = new mongoose.Schema({
    firstname: { 
        type: String, 
        required: true
        // removed unique: true
    },
    lastname: { 
        type: String, 
        required: true
        // removed unique: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,  // keep email unique
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });


// Export the User model
const User = mongoose.model<IUser>('User', userSchema);
export default User;
