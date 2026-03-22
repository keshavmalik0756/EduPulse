import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { resetPassword } from "../redux/authSlice";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";

import educationHero2 from "../assets/education-hero-2.svg";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);

    const { token } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector(state => state.auth);

    const calculatePasswordStrength = (pass) => {
        let strength = 0;
        if (pass.length >= 8) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass)) strength += 25;
        if (/[@$!%*?&]/.test(pass)) strength += 25;
        setPasswordStrength(strength);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        
        if (id === 'password') {
            calculatePasswordStrength(value);
        }

        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Minimum 8 characters required";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const result = await dispatch(resetPassword(formData, token));
            if (result && result.success) {
                toast.success("Password reset successful!");
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.message || "Reset failed");
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 25) return 'bg-red-500';
        if (passwordStrength <= 50) return 'bg-orange-500';
        if (passwordStrength <= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <AuthLayout 
            title="New Password" 
            subtitle="Secure your account with a strong password."
            reverse={true}
            image={educationHero2}
            imageAlt="Reset Password Hero"
        >
            <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-3">
                    <AuthInput 
                        id="password"
                        type="password"
                        label="New Password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleInputChange}
                        error={errors.password}
                        required
                    />
                    
                    <AnimatePresence>
                        {formData.password && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-1 space-y-2"
                            >
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                                    {[25, 50, 75, 100].map((step) => (
                                        <div 
                                            key={step}
                                            className={`h-full flex-1 transition-all duration-500 ${
                                                passwordStrength >= step ? getStrengthColor() : 'bg-transparent'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AuthInput 
                    id="confirmPassword"
                    type="password"
                    label="Confirm New Password"
                    placeholder="••••••••"
                    icon={ShieldCheck}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    required
                />

                <AuthButton type="submit" loading={isLoading}>
                    Update Password
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
        </AuthLayout>
    );
};

export default ResetPassword;