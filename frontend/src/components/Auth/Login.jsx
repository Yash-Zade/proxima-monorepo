import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { AuthContext } from './context/AuthContext';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);

      const role = localStorage.getItem('userRole');
      if (role) {
        const dashboardPaths = {
          employer: '/employerdashboard',
          student: '/profile',
          college: '/collegedashboard',
          mentor: '/mentordashboard',
          admin: '/admindashboard'
        };
        navigate(dashboardPaths[role] || '/');
      } else {
        navigate('/roles');
      }
    } catch (err) {
      // Backend errors are wrapped: { timeStamp, data: null, error: { status, message, subErrors } }
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
    const frontendRedirectUri = `${window.location.origin}/oauth2/redirect`;
    window.location.href = `${baseUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(frontendRedirectUri)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Log In</h1>
            <p className="text-zinc-400 mt-2 text-sm">Welcome back to Proxima.</p>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-950/50 border border-red-900 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm font-medium">Email Address</Label>
              <Input
                {...register("email", { required: true })}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
                placeholder="you@example.com"
                type="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-zinc-300 text-sm font-medium">Password</Label>
              </div>
              <Input
                {...register("password", { required: true })}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-zinc-50 text-zinc-950 hover:bg-zinc-200 rounded-lg font-medium transition-colors disabled:opacity-50 mt-4 h-auto"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500 font-medium">Or continue with</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-zinc-900 border border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 h-auto relative overflow-hidden group shadow-lg"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-zinc-700/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="tracking-wide">Google</span>
          </motion.button>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-zinc-50 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
