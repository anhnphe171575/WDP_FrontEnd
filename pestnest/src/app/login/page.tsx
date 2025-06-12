'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../utils/axios';
import Image from 'next/image';
import styles from './LoginPage.module.css';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';  
import { AxiosError } from 'axios';

interface ErrorResponse {
  success: boolean;
  message: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token } = response.data;
        
        // Store the token
        if (rememberMe){
          localStorage.setItem('token', token);
        } else{
          sessionStorage.setItem('token', token);
        }        
        // Redirect to dashboard
        router.push('/homepage');
      } else {
        setError(response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        if (axiosError.response.data.message?.includes('chưa được xác minh email')) {
          setShowVerificationModal(true);
        } else {
          setError(axiosError.response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      const response = await api.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        setError('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.');
        setShowVerificationModal(false);
      } else {
        setError(response.data.message || 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setError(axiosError.response.data.message || 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.');
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Không thể xác thực với Google. Vui lòng thử lại.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });
      
      if (response.data.success) {
        const { token } = response.data;
        
        // Store the token
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
        
        // Redirect to dashboard
        router.push('/homepage');
      } else {
        setError(response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setError(axiosError.response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  };

  return (
    <div className={styles.container}>
      {/* Left side - Pet Image with Next.js Image */}
      <div className={styles.left + ' relative'}>
        <Image
          src="/images/background.jpg"
          alt="Pet Shop Background"
          fill
          priority
        />
      </div>

      {/* Right side - Login Form */}
      <div className={styles.right}>
        <div className={styles.formBox}>
          <div className="text-center">
            <h2 className={styles.title}>Chào mừng trở lại!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Đăng nhập để tiếp tục
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4A5568]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#4A5568]">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-[#FCFBE9] focus:ring-[#FCFBE9] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#4A5568]">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgetpass" className={styles.link}>
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.button}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#4A5568] border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/register"
                className={styles.link + ' inline-block mt-4 text-sm font-medium'}
              >
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                text="signin_with"
                shape="rectangular"
                locale="vi"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Tài khoản chưa được xác minh</h3>
            <p className="text-gray-600 mb-6">
              Tài khoản của bạn chưa được xác minh email. Vui lòng kiểm tra hộp thư của bạn để kích hoạt tài khoản.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Đóng
              </button>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {resendLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Gửi lại email xác thực'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
