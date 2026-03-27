import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: 'backend/.env' });

const verifySmtp = async () => {
    console.log("🚀 Starting SMTP Configuration Verification...");
    
    const config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD ? "****" : "MISSING",
        service: process.env.SMTP_SERVICE
    };
    
    console.log("📋 Current Configuration (Sensitive data hidden):", JSON.stringify(config, null, 2));

    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
        console.error("❌ Error: Missing required SMTP environment variables in .env");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        console.log("🔗 Attempting to verify connection...");
        await transporter.verify();
        console.log("✅ SMTP Connection verified successfully!");
    } catch (error) {
        console.error("❌ SMTP Connection failed:");
        console.error("🔍 Error Name:", error.name);
        console.error("🔍 Error Message:", error.message);
        console.error("🔍 Error Code:", error.code);
        if (error.command) console.error("🔍 SMTP Command:", error.command);
        console.log("\n💡 Possible Solutions:");
        console.log("1. If using Gmail, ensure you are using an 'App Password', NOT your regular password.");
        console.log("2. Ensure 'Less Secure Apps' is NOT needed if using App Passwords.");
        console.log("3. Check if your ISP or hosting provider (Render.com) blocks port " + process.env.SMTP_PORT);
    }
};

verifySmtp();
