'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, onKeyDown, inputRef }) => {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
    />
  );
};

export default function VerifyOTP() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    const email = localStorage.getItem('email');
    
    if (!email) {
      toast.error('Không tìm thấy email. Vui lòng thử lại!');
      router.push('/forgot-password');
      return;
    }
    
    if (otpString.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpString
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Xác thực OTP thất bại');
      }

      // Lưu OTP vào localStorage
      localStorage.setItem('otp', otpString);
      
      toast.success(data.message || 'Xác thực OTP thành công!');
      router.push('/resetpass');
    } catch (err) {
      console.error('Lỗi xác thực OTP:', err);
      toast.error(err instanceof Error ? err.message : 'Xác thực OTP thất bại. Vui lòng thử lại!');
    }
  };

  const handleResendOTP = () => {
    // TODO: Thêm logic gửi lại OTP ở đây
    setTimer(60);
    setIsResendDisabled(true);
    toast.success('Đã gửi lại mã OTP!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[400px] p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-black text-center mb-2">Xác thực OTP</h1>
        <p className="text-gray-600 text-center mb-6">
          Vui lòng nhập mã OTP đã được gửi đến email của bạn
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <OTPInput
                key={index}
                value={digit}
                onChange={(value) => handleChange(index, value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputRef={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Xác nhận
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResendDisabled}
              className={`text-sm text-blue-600 hover:text-blue-800 ${
                isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isResendDisabled
                ? `Gửi lại mã sau ${timer}s`
                : 'Gửi lại mã OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
