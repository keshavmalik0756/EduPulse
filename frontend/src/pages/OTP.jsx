import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { otpVerification, resendOTP } from "../redux/authSlice";
import AuthLayout from "../components/auth/AuthLayout";
import AuthButton from "../components/auth/AuthButton";

import collaborationHero from "../assets/collaboration-hero.svg";

const OTP = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    
    const { email } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.auth);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length < 6) {
            toast.error("Please enter complete 6-digit code");
            return;
        }

        try {
            const result = await dispatch(otpVerification(email, otpString));
            if (result && result.success) {
                toast.success("Email verified successfully!");
                navigate("/home");
            }
        } catch (error) {
            toast.error(error.message || "Verification failed");
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            await dispatch(resendOTP(email));
            toast.success("New code sent!");
            setTimer(60);
        } catch (error) {
            toast.error(error.message || "Failed to resend");
        }
    };

    return (
        <AuthLayout 
            title="Verify Email" 
            subtitle={`We've sent a 6-digit code to ${email}`}
            reverse={true}
            image={collaborationHero}
            imageAlt="OTP Verification Hero"
        >
            <form onSubmit={handleVerify} className="space-y-8">
                <div className="flex justify-between gap-2 sm:gap-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-full h-12 sm:h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-900 transition-all duration-300"
                        />
                    ))}
                </div>

                <div className="space-y-4">
                    <AuthButton type="submit" loading={isLoading}>
                        Verify Account
                    </AuthButton>

                    <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-gray-500">
                            Didn't receive code?{" "}
                            {timer > 0 ? (
                                <span className="text-gray-400 font-bold">Resend in {timer}s</span>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={handleResend}
                                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors inline-flex items-center gap-1"
                                >
                                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                    Resend Now
                                </button>
                            )}
                        </p>
                        
                        <button 
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft size={14} />
                            Back to Login
                        </button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
};

export default OTP;