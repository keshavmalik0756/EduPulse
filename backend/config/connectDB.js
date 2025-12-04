import mongoose from "mongoose";

const connectDB = async () => {
    // Prevent duplicate connections
    if (mongoose.connection.readyState === 1) {
        console.log("MongoDB is already connected");
        return;
    }

    try {
        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        // Connection options for better performance and reliability
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
        };

        console.log("Attempting to connect to MongoDB...");
        // In development, show the URI (but hide in production)
        if (process.env.NODE_ENV === 'development') {
            console.log("Using URI:", process.env.MONGO_URI);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        console.log(`MongoDB connected: ${conn.connection.host}`);

        // Connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.log("Application will continue running without database connection");
        // Don't exit the process, let the application continue
    }
};

export default connectDB;