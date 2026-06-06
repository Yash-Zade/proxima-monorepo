import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * @title Proxima SignIn Screen
 * @notice Validates, authenticates, and commits credentials to the Spring Boot backend.
 */
export default function SignIn() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('[Dev Alert] Directing LoginRequestDTO post transaction via AuthContext...');
      await login(data.email, data.password);

      showToast('Credential keys synchronized successfully!', 'success');
      console.log('[Dev Alert] JWT provisioned and stored. User session connected.');

      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      console.error('[Dev Alert] Authentication node reject:', err);
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Access rejected. Check credentials.';
      showToast(errorMessage, 'error');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
    const frontendRedirectUri = `${window.location.origin}/oauth2/redirect`;
    window.location.href = `${baseUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(frontendRedirectUri)}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-16 bg-[#FDFBF7] relative overflow-hidden transition-colors duration-500">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5DAC9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-[#E5DAC9] p-8 sm:p-10 rounded-3xl shadow-sm relative z-10 transition-all duration-500 ease-in-out min-h-[460px] flex flex-col justify-center">

        {loading ? (
          <div className="text-center space-y-4 py-12 animate-in fade-in duration-500 ease-in-out flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#241E1A] animate-spin mx-auto flex items-center justify-center shadow-md">
            </div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest animate-pulse">Authenticating credentials...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500 ease-in-out">
            {/* Logo and Headings */}
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-[#241E1A] flex items-center justify-center">
                  <span className="text-[#FDFBF7] font-black text-sm tracking-tighter">P</span>
                </div>
                <span className="font-extrabold text-lg tracking-tight text-[#241E1A]">proxima</span>
              </Link>
              <h1 className="text-3xl font-extrabold text-[#241E1A] pt-4 leading-tight">Welcome back.</h1>
              <p className="text-xs text-stone-500 font-medium">Sign in to deploy your vetted engineering credentials.</p>
            </div>

            {/* Auth form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email' }
                    })}
                    className="w-full bg-[#FAF6F0] border border-[#E5DAC9] focus:border-[#241E1A] focus:ring-1 focus:ring-[#241E1A] rounded-xl py-2.5 pl-11 pr-4 text-xs transition-all outline-none"
                  />
                </div>
                {errors.email && <span className="text-[10px] text-red-600 font-semibold block">{errors.email.message}</span>}
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    {...register('password', {
                      required: 'Password is required'
                    })}
                    className="w-full bg-[#FAF6F0] border border-[#E5DAC9] focus:border-[#241E1A] focus:ring-1 focus:ring-[#241E1A] rounded-xl py-2.5 pl-11 pr-11 text-xs transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-stone-400 hover:text-[#241E1A] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-[10px] text-red-600 font-semibold block">{errors.password.message}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                Sign In
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5DAC9]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-stone-400">
                <span className="bg-white px-2">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-white hover:bg-[#FAF6F0] border border-[#E5DAC9] active:border-[#241E1A] text-[#241E1A] text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            {/* Toggle option */}
            <div className="border-t border-[#E5DAC9] pt-6 text-center">
              <p className="text-[11px] text-stone-500">
                Don't have an elite node profile?{' '}
                <Link to="/signup" className="text-[#241E1A] hover:text-stone-700 font-bold underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}