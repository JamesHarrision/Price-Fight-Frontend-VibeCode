import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../services/authService';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  // Resend flow
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'

  useEffect(() => {
    if (token) {
      setStatus('loading');
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          setMessage('Your email has been verified! You can now log in.');
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.message || 'This verification link is invalid or has expired.');
        });
    }
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendStatus('sending');
    try {
      await resendVerificationEmail(resendEmail);
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('error');
      setMessage(err.message || 'Could not resend. Please check the email address.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/20 z-10 mx-4 text-center">

        {/* Loading state */}
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your email.</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 mb-6 shadow-lg shadow-green-500/30 mx-auto">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h2>
            <p className="text-gray-500 leading-relaxed mb-8">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-purple-700 transition-all"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}

        {/* Error with token */}
        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-red-400 to-rose-500 mb-6 shadow-lg shadow-red-500/30 mx-auto">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Link Expired</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <p className="text-sm text-gray-400 mb-6">Request a new verification email below.</p>
            {renderResendForm()}
          </>
        )}

        {/* No token — show resend-only form */}
        {status === 'idle' && !token && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 mb-6 shadow-lg shadow-primary-500/30 mx-auto">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Verify your Email</h2>
            <p className="text-gray-500 mb-8">Enter your email address and we'll resend the verification link.</p>
            {renderResendForm()}
          </>
        )}
      </div>
    </div>
  );

  function renderResendForm() {
    if (resendStatus === 'sent') {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Verification email sent! Check your inbox.
        </div>
      );
    }

    return (
      <form onSubmit={handleResend} className="space-y-4 text-left">
        {resendStatus === 'error' && (
          <p className="text-red-600 text-sm text-center font-medium">{message}</p>
        )}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600 transition-colors">
            <Mail className="h-5 w-5" />
          </div>
          <input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            placeholder="name@company.com"
            required
          />
        </div>
        <button
          type="submit"
          disabled={resendStatus === 'sending'}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {resendStatus === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Resend Verification Email</>}
        </button>
        <p className="text-center text-sm text-gray-500">
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">Back to Login</Link>
        </p>
      </form>
    );
  }
};
