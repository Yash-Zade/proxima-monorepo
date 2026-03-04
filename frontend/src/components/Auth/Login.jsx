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
      navigate('/roles');
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
