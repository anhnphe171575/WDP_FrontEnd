'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../utils/axios';
import Image from 'next/image';
import styles from './LoginPage.module.css';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';  
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

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
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const [showVerifyNotice, setShowVerifyNotice] = useState(registered);

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
        // Decode token để lấy role
        try {
          const decoded = jwtDecode<{ role: number }>(token);
          const role = decoded.role;
          // Chuyển hướng theo role
          switch (role) {
            case 0: // ADMIN_DEVELOPER
              router.push('/admin/product');
              break;
            case 8: // ADMIN_BUSINESS
              router.push('/adminbusiness/statistics');
              break;
            case 2: // ORDER_MANAGER
              router.push('/ordermanager/dashboard');
              break;
            case 4: // MARKETING_MANAGER
              router.push('/marketing/dashboard');
              break;
            case 1: // CUSTOMER
            default:
              router.push('/homepage');
              break;
          }
        } catch (e) {
          // Nếu decode lỗi, chuyển về homepage mặc định
          router.push('/homepage');
        }
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
        
        // Decode token để lấy role
        try {
          const decoded = jwtDecode<{ role: number }>(token);
          const role = decoded.role;
          // Chuyển hướng theo role
          switch (role) {
            case 0: // ADMIN_DEVELOPER
            case 8: // ADMIN_BUSINESS
              router.push('/admin/dashboard');
              break;
            case 2: // ORDER_MANAGER
              router.push('/order');
              break;
            case 4: // MARKETING_MANAGER
              router.push('/marketing');
              break;
            case 1: // CUSTOMER
            default:
              router.push('/homepage');
              break;
          }
        } catch (e) {
          // Nếu decode lỗi, chuyển về homepage mặc định
          router.push('/homepage');
        }
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
          
          {showVerifyNotice && (
            <div className={styles.success}>
              Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập.
              <button
                type="button"
                className="ml-2 text-blue-600 underline text-sm"
                onClick={() => setShowVerifyNotice(false)}
              >
                Đóng
              </button>
            </div>
          )}

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
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Tài khoản chưa được xác minh</h3>
            <p className={styles.modalText}>
              Tài khoản của bạn chưa được xác minh email. Vui lòng kiểm tra hộp thư của bạn để kích hoạt tài khoản.<br/>
              Nếu chưa nhận được email, bạn có thể gửi lại bên dưới.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowVerificationModal(false)}
                className={styles.modalCloseBtn}
              >
                Đóng
              </button>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className={styles.modalResendBtn}
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
