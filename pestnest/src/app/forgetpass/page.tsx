'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import axios from 'axios';

export default function ForgetPassPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      setSuccess('Vui lòng kiểm tra email của bạn để lấy mã OTP');
      localStorage.setItem('email', email);
      setTimeout(() => {
        router.push('/verifyOTP');
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          setError('Email không tồn tại trong hệ thống');
        } else {
          setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
        }
      } else {
        setError('Có lỗi xảy ra khi gửi yêu cầu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập email của bạn để nhận mã OTP
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
            {success}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-gray-900"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Gửi mã OTP'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link 
            href="/login"
            className="inline-block mt-4 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
