import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import * as THREE from 'three';
import {
  useAuth,
  DEFAULT_ADMIN_USER,
  DEFAULT_SUPPORT_USER,
  DEFAULT_AGENT_USER,
} from '../context/AuthContext';

// Vanta attaches to window.VANTA after the side-effect import
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'vanta/dist/vanta.fog.min';

declare global {
  interface Window {
    THREE: typeof THREE;
    VANTA: {
      FOG: (opts: Record<string, unknown>) => { destroy: () => void };
    };
  }
}

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginWithEmail, loginAsDemo } = useAuth();

  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Initialise Vanta FOG background
  useEffect(() => {
    window.THREE = THREE;
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = window.VANTA.FOG({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        highlightColor: 0x38bdf8,
        midtoneColor: 0x0ea5e9,
        lowlightColor: 0x0369a1,
        baseColor: 0xbae6fd,
        blurFactor: 0.63,
        speed: 2,
        zoom: 2,
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const loggedUser = await loginWithEmail(email.trim(), password);
      const isUserAdmin = Boolean(
        loggedUser.role === 'super_admin' ||
          loggedUser.email?.toLowerCase().trim() === 'vahlaydigital@gmail.com'
      );
      if (isUserAdmin) {
        onNavigate('/admin');
      } else if (loggedUser.role === 'technical_support') {
        onNavigate('/support');
      } else {
        onNavigate('/leads');
      }
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (
        authError.code === 'auth/invalid-credential' ||
        authError.code === 'auth/wrong-password' ||
        authError.code === 'auth/user-not-found'
      ) {
        setError('Incorrect credentials. Please verify your email and password.');
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment.');
      } else {
        setError(authError.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQuickDemoLogin = (role: 'admin' | 'support' | 'agent') => {
    if (role === 'admin') {
      loginAsDemo(DEFAULT_ADMIN_USER);
      onNavigate('/admin');
    } else if (role === 'support') {
      loginAsDemo(DEFAULT_SUPPORT_USER);
      onNavigate('/support');
    } else {
      loginAsDemo(DEFAULT_AGENT_USER);
      onNavigate('/leads');
    }
  };

  return (
    <>
      {/* ── Vanta animated background ── */}
      <div ref={vantaRef} className="fixed inset-0 z-0" />

      {/* ── Centered page wrapper ── */}
      <div className="fixed inset-0 z-10 flex items-center justify-center p-5 overflow-y-auto">
        {/* ── Glass card ── */}
        <div
          className="w-full max-w-[480px] rounded-3xl border border-white/35 p-12 text-white"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo (3).png"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <h2 className="text-4xl mb-7">
            <span className="font-bold">Welcome</span> back
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-5">
              <label className="block text-[15px] font-medium mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="w-full rounded-[14px] border border-white/35 bg-white/[0.18] px-[18px] py-[14px] text-sm text-white placeholder-white/65 outline-none transition-all focus:bg-white/25 focus:border-white/60"
              />
            </div>

            {/* Password */}
            <div className="mb-5 relative">
              <label className="block text-[15px] font-medium mb-1.5">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full rounded-[14px] border border-white/35 bg-white/[0.18] px-[18px] py-[14px] pr-12 text-sm text-white placeholder-white/65 outline-none transition-all focus:bg-white/25 focus:border-white/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-[58%] -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-white/85"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  /* eye-slash */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                    <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                  </svg>
                ) : (
                  /* eye */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-400/40 bg-red-900/40 p-3 text-xs text-red-200">
                {error}
              </div>
            )}

            {/* Login button */}
            <div className="mt-6 mb-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[14px] bg-white text-slate-800 font-semibold text-base py-[14px] cursor-pointer border-none transition-colors hover:bg-sky-100 hover:text-sky-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-400/40 border-t-slate-700 animate-spin" />
                    Authenticating…
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 mb-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <div
                  className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all ${
                    rememberMe
                      ? 'bg-sky-500 border border-sky-400'
                      : 'border border-white/40 bg-white/10'
                  }`}
                >
                  {rememberMe && <Check size={11} className="text-white stroke-[3]" />}
                </div>
                <span className="text-white cursor-pointer">Remember me</span>
              </label>
            </div>

            {/* Forgot password */}
            <div className="text-sm">
              Forgot your password?{' '}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-white underline font-semibold bg-transparent border-none cursor-pointer p-0"
              >
                Click here!
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 text-white"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <h4 className="text-lg font-bold">Reset Account Password</h4>
            <p className="text-sm text-white/80 mt-2">
              For security, please contact your Super Administrator
              (vahlaydigital@gmail.com) to reset your Firebase authentication
              credentials.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="px-5 py-2 rounded-[12px] bg-white text-slate-800 text-sm font-bold hover:bg-sky-100 hover:text-sky-700 transition cursor-pointer border-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
