import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { login } from "../redux/authSlice";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";

import loginHero from "../assets/login-hero.svg";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [cooldown, setCooldown] = useState(0);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate("/home");
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (cooldown > 0) {
            toast.error(`Please wait ${cooldown} seconds`);
            return;
        }

        const newErrors = {};
        if (!email) newErrors.email = "Email is required";
        if (!password) newErrors.password = "Password is required";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const result = await dispatch(login({ email, password }));
            if (result && result.success) {
                toast.success("Welcome back!");
                navigate("/home");
            }
        } catch (error) {
            if (error.message.includes("Too many")) {
                setCooldown(30);
            }
            toast.error(error.message || "Login failed");
        }
    };

    return (
        <AuthLayout 
            title="Welcome Back" 
            subtitle="Continue your learning journey with EduPulse."
            image={loginHero}
            imageAlt="Login Hero"
        >
            <form onSubmit={handleLogin} className="space-y-6">
                <AuthInput 
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="john@example.com"
                    icon={Mail}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({...errors, email: null});
                    }}
                    error={errors.email}
                    required
                />

                <div className="space-y-2">
                    <AuthInput 
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({...errors, password: null});
                        }}
                        error={errors.password}
                        required
                    />
                    <div className="flex justify-end pr-1">
                        <Link 
                        to="/forgot-password" 
                        className="text-sky-600 hover:text-sky-700 font-bold text-xs tracking-tight hover:underline transition-all"
                    >
                        Forgot Password?
                    </Link>
                    </div>
                </div>

                <AnimatePresence>
                    {cooldown > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3 text-red-600 text-sm"
                        >
                            <AlertCircle size={18} />
                            <span>Too many attempts. Wait <strong>{cooldown}s</strong></span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AuthButton type="submit" loading={isLoading} disabled={cooldown > 0}>
                    Sign In
                </AuthButton>

                <p className="text-center text-slate-500 text-sm font-medium">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-black decoration-2 hover:underline transition-all">
                        Create one now
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;