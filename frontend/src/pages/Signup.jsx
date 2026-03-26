import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { User, Mail, Lock, ShieldCheck, GraduationCap, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { register } from "../redux/authSlice";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";

import signupHero from "../assets/signup-hero.svg";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student"
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate("/home");
        }
    }, [isAuthenticated, user, navigate]);

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

        // Clear error when user starts typing
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Minimum 8 characters required";
        } else if (passwordStrength < 100) {
            newErrors.password = "Password must include uppercase, number, and special character";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const result = await dispatch(register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            }));

            if (result && result.success) {
                toast.success("Account created! Verify your email.");
                navigate(`/verify-otp/${encodeURIComponent(formData.email)}`);
            }
        } catch (error) {
            toast.error(error.message || "Signup failed");
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 25) return 'bg-red-500';
        if (passwordStrength <= 50) return 'bg-orange-500';
        if (passwordStrength <= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 25) return 'Weak';
        if (passwordStrength <= 50) return 'Fair';
        if (passwordStrength <= 75) return 'Good';
        return 'Strong';
    };

    return (
        <AuthLayout 
            title="Join EduPulse" 
            subtitle="Start your journey to mastery today."
            reverse={true}
            image={signupHero}
            imageAlt="Signup Hero"
        >
            <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Role Selection */}
                <div className="flex p-1.5 bg-slate-100/60 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => setFormData(p => ({...p, role: 'student'}))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all duration-300 ${
                            formData.role === 'student' 
                            ? 'bg-sky-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                        }`}
                    >
                        <GraduationCap size={16} />
                        <span className="font-bold text-[11px] uppercase tracking-wider">Student</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(p => ({...p, role: 'educator'}))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all duration-300 ${
                            formData.role === 'educator' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                        }`}
                    >
                        <School size={16} />
                        <span className="font-bold text-[11px] uppercase tracking-wider">Educator</span>
                    </button>
                </div>

                <AuthInput 
                    id="name"
                    type="text"
                    label="Full Name"
                    placeholder="John Doe"
                    icon={User}
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                />
                <AuthInput 
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="john@example.com"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                />

                <div className="relative">
                    <AuthInput 
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleInputChange}
                        error={errors.password}
                        required
                    />
                    
                    {/* Compact Password Strength Meter - Absolute positioned below password field */}
                    <AnimatePresence>
                        {formData.password && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-1 pt-1.5 space-y-1.5"
                            >
                                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black">
                                    <span className="text-slate-400">Security</span>
                                    <span className={passwordStrength <= 50 ? 'text-orange-500' : 'text-emerald-600'}>
                                        {getStrengthText()}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
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
                    label="Confirm Password"
                    placeholder="••••••••"
                    icon={ShieldCheck}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    required
                />

                <div className="pt-1.5">
                    <AuthButton type="submit" loading={isLoading} className="py-3.5 text-sm uppercase tracking-widest font-black">
                        Create Account
                    </AuthButton>
                </div>

                <p className="text-center text-slate-500 text-[13px] font-medium pt-1">
                    Already have an account?{" "}
                    <Link to="/login" className="text-sky-600 hover:text-sky-700 font-black tracking-tight hover:underline transition-all">
                        Sign In
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;