'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../utils/axios';
import Image from 'next/image';
import styles from './RegisterPage.module.css';
import { AxiosError } from 'axios';

interface ErrorResponse {
  success: boolean;
  message: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validatePhoneNumber = (phone: string): boolean => {
    // Kiểm tra số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0)
    const phoneRegex = /^0[0-9]{9,10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(formData.phone)) {
      setError('Số điện thoại không hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      if (response.data.success) {
        // Show success message or redirect
        router.push('/login?registered=true');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setError(axiosError.response.data.message || 'Đăng ký thất bại');
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Chỉ cho phép nhập số cho trường phone
    if (name === 'phone' && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      {/* Right side - Register Form */}
      <div className={styles.right}>
        <div className={styles.formBox}>
          <div className="text-center">
            <h2 className={styles.title}>Tạo tài khoản mới</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#4A5568]">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4A5568]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#4A5568]">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0123456789"
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
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#4A5568]">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                />
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
                  'Đăng ký'
                )}
              </button>
            </div>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}
            <div className="text-center">
              <Link 
                href="/login"
                className={styles.link + ' inline-block mt-4 text-sm font-medium'}
              >
                Đã có tài khoản? Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
