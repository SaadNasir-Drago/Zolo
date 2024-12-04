import Property from "../models/property"; // Import Property model
import {IUser} from "../models/users"; // Import User model for reference
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587, // Use 587 for TLS (recommended)
  secure: false, 
  auth: {
    user: "imosamaamin@gmail.com", // Your email credentials from environment variables
    pass: "biwh fbjq gizz wpxf", // Your email password from environment variables
  },
});

const sendEmail = async (req: any, res: any) => {
  const { propertyId, name, email, phone, message } = req.body;

  try {
    // Find the property by ID and populate the userId field to get the user's email, firstname, lastname
    const property = await Property.findById(propertyId).populate<{ userId: IUser }>('userId', 'email firstname lastname');

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Access the seller's email, firstname, and lastname
    const sellerEmail = property.userId.email;
    const sellerName = `${property.userId.firstname} ${property.userId.lastname}`;

    // Construct email details
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email (your service)
      to: sellerEmail, // Receiver's email (property owner's email)
      subject: `Interest in Property at ${property.address}`,
      text: `
        Hello ${sellerName},

        ${name} is interested in your property located at ${property.address}.
        You can contact them via email: ${email} or phone: ${phone}.

        Message from the interested buyer:
        ${message}
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: 'Failed to send email' });
      }
      res.status(200).json({ message: 'Email sent successfully' });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export default sendEmail;
