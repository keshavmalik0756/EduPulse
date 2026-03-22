import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft } from 'lucide-react';

import { forgotPassword } from "../redux/authSlice";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";

import educationHero1 from "../assets/education-hero-1.svg";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [isSent, setIsSent] = useState(false);

    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            const result = await dispatch(forgotPassword(email));
            if (result && result.success) {
                toast.success("Reset link sent!");
                setIsSent(true);
            }
        } catch (error) {
            toast.error(error.message || "Failed to send reset link");
        }
    };

    return (
        <AuthLayout 
            title="Reset Password" 
            subtitle={!isSent ? "Enter your email to receive recovery instructions." : "Check your inbox for the link."}
            reverse={true}
            image={educationHero1}
            imageAlt="Forgot Password Hero"
        >
            {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <AuthInput 
                        id="email"
                        type="email"
                        label="Email Address"
                        placeholder="john@example.com"
                        icon={Mail}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                        }}
                        error={error}
                        required
                    />

                    <AuthButton type="submit" loading={isLoading}>
                        Send Reset Link
                    </AuthButton>

                    <div className="flex justify-center mt-6">
                        <Link 
                            to="/login" 
                            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </form>
            ) : (
                <div className="space-y-6 text-center">
                    <p className="text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 italic text-sm">
                        Didn't receive the email? Check your spam folder or try again in a few minutes.
                    </p>
                    <AuthButton variant="secondary" onClick={() => setIsSent(false)}>
                        Try another email
                    </AuthButton>
                    <Link 
                        to="/login" 
                        className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
};

export default ForgotPassword;