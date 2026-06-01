import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * @title Proxima SignUp Screen
 * @notice Validates, registers, and provision new user records inside Spring Boot AuthController.java
 * @dev Employs React Hook Form, handles AuthContext signup method, and yields gorgeous toast notifications.
 */
export default function SignUp() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signup } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  /**
   * @notice Action handler dispatching signup payload data via AuthContext.
   * @dev Maps values to SignupDTO and triggers redirect sequences.
   * @param {object} data The validated user values (name, email, password).
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('[Dev Alert] Provisioning new user registration transaction via AuthContext...');
      
      // Dispatch payload to Spring Boot '/auth/signup' through AuthContext
      await signup(data);

      showToast('Credential node provisioned successfully!', 'success');
      console.log('[Dev Alert] Registration complete. Redirecting to access node...');

      // Redirect user directly to sign in page
      setTimeout(() => {
        navigate('/signin');
      }, 1200);
    } catch (err) {
      console.error('[Dev Alert] Registration failed:', err);
      // Spring custom ApiError packages error messages in response.data.error.message
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Provisioning rejected. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 bg-[#FDFBF7] relative overflow-hidden">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5DAC9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-[#E5DAC9] p-8 sm:p-10 rounded-3xl shadow-sm space-y-8 relative z-10">
        
        {/* Logo and Headings */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#241E1A] flex items-center justify-center">
              <span className="text-[#FDFBF7] font-black text-sm tracking-tighter">P</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#241E1A]">proxima</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-[#241E1A] pt-4 leading-tight">Create your node.</h1>
          <p className="text-xs text-stone-500 font-medium">Register to begin cryptographically verified matchmaking.</p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Yash Zade"
                {...register('fullName', { required: 'Name is required' })}
                className="w-full bg-[#FAF6F0] border border-[#E5DAC9] focus:border-[#241E1A] focus:ring-1 focus:ring-[#241E1A] rounded-xl py-2.5 pl-11 pr-4 text-xs transition-all outline-none"
              />
            </div>
            {errors.fullName && <span className="text-[10px] text-red-600 font-semibold block">{errors.fullName.message}</span>}
          </div>

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
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Choose Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                {...register('password', { 
                  required: 'Password is required',
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Requires 8+ chars: uppercase, lowercase, digit, and special symbol.'
                  }
                })}
                className="w-full bg-[#FAF6F0] border border-[#E5DAC9] focus:border-[#241E1A] focus:ring-1 focus:ring-[#241E1A] rounded-xl py-2.5 pl-11 pr-4 text-xs transition-all outline-none"
              />
            </div>
            {errors.password && <span className="text-[10px] text-red-600 font-semibold block">{errors.password.message}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Provisioning Node...' : 'Register Node'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle option */}
        <div className="border-t border-[#E5DAC9] pt-6 text-center">
          <p className="text-[11px] text-stone-500">
            Already have an active credential node?{' '}
            <Link to="/signin" className="text-[#241E1A] hover:text-stone-700 font-bold underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
