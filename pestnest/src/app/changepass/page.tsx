"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import { api } from '../../../utils/axios'
import { AxiosError } from 'axios'
import { useLanguage } from '@/context/LanguageContext'
import viConfig from '../../../utils/petPagesConfig.vi'
import enConfig from '../../../utils/petPagesConfig.en'

interface ChangePasswordForm {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

interface ValidationErrors {
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
}

interface ErrorResponse {
    success: boolean;
    message: string;
}

const passwordRules = [
    {
        label: 'Ít nhất 8 ký tự',
        test: (pw: string) => pw.length >= 8,
    },
    {
        label: 'Ít nhất 1 chữ cái in hoa (A-Z)',
        test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
        label: 'Ít nhất 1 chữ cái thường (a-z)',
        test: (pw: string) => /[a-z]/.test(pw),
    },
    {
        label: 'Ít nhất 1 số (0-9)',
        test: (pw: string) => /[0-9]/.test(pw),
    },
    {
        label: 'Ít nhất 1 ký tự đặc biệt (!@#$...)',
        test: (pw: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
    },
];

export default function ChangePasswordPage() {
    const { lang } = useLanguage()
    const changepassConfig = (lang === 'vi' ? viConfig : enConfig).changepass
    const [formData, setFormData] = useState<ChangePasswordForm>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [errors, setErrors] = useState<ValidationErrors>({})
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Kiểm tra tất cả rule đều đúng
    const isStrongPassword = passwordRules.every(rule => rule.test(formData.newPassword));

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        if (!formData.currentPassword) {
            newErrors.currentPassword = changepassConfig.errors.requiredCurrent
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
        } else if (!isStrongPassword) {
            newErrors.newPassword = 'Mật khẩu chưa đủ mạnh theo yêu cầu'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = changepassConfig.errors.requiredConfirm
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = changepassConfig.errors.notMatch
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof ChangePasswordForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }))
        }
    }

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // Gọi API đổi mật khẩu
            const response = await api.post('/auth/changepassword', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            })

            if (response.data.success) {
                setIsSuccess(true)
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })

                // Reset success message after 3 seconds
                setTimeout(() => setIsSuccess(false), 3000)
            } else {
                setErrors({ currentPassword: response.data.message || changepassConfig.errors.changeError })
            }

        } catch (error: unknown) {
            console.error('Error changing password:', error)

            const axiosError = error as AxiosError<ErrorResponse>

            // Xử lý các loại lỗi khác nhau
            if (axiosError.response?.status === 401) {
                setErrors({ currentPassword: changepassConfig.errors.wrongCurrent })
            } else if (axiosError.response?.status === 403) {
                setErrors({ currentPassword: changepassConfig.errors.tokenInvalid })
            } else if (axiosError.response?.data?.message) {
                setErrors({ currentPassword: axiosError.response.data.message })
            } else {
                setErrors({ currentPassword: changepassConfig.errors.tryAgain })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="flex items-center justify-center p-4 pt-20">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{changepassConfig.title}</CardTitle>
                        <CardDescription>
                            {changepassConfig.description}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">{changepassConfig.fields.currentPassword.label}</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showPasswords.current ? 'text' : 'password'}
                                        placeholder={changepassConfig.fields.currentPassword.placeholder}
                                        value={formData.currentPassword}
                                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                        className={errors.currentPassword ? 'border-destructive' : ''}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => togglePasswordVisibility('current')}
                                    >
                                        {showPasswords.current ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {errors.currentPassword && (
                                    <div className="flex items-center gap-2 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.currentPassword}
                                    </div>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">{changepassConfig.fields.newPassword.label}</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPasswords.new ? 'text' : 'password'}
                                        placeholder={changepassConfig.fields.newPassword.placeholder}
                                        value={formData.newPassword}
                                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                        className={errors.newPassword ? 'border-destructive' : ''}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => togglePasswordVisibility('new')}
                                    >
                                        {showPasswords.new ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            className={errors.confirmPassword ? 'border-destructive' : ''}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <div className="flex items-center gap-2 text-sm text-destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.confirmPassword}
                                        </div>
                                    )}
                                </div>

                                {/* Hiển thị điều kiện password */}
                                <ul className="mt-2 space-y-1">
                                    {passwordRules.map((rule, idx) => {
                                        const passed = rule.test(formData.newPassword);
                                        return (
                                            <li key={idx} className="flex items-center gap-2 text-sm">
                                                {passed ? (
                                                    <span className="text-green-600 font-bold">✔</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold">✘</span>
                                                )}
                                                <span className={passed ? 'text-green-700' : 'text-gray-700'}>{rule.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {errors.newPassword && (
                                    <div className="flex items-center gap-2 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.newPassword}
                                    </div>
                                )}
                            </div>



                            {/* Success Message */}
                            {isSuccess && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-green-800">
                                        {changepassConfig.success}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                        <br />
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? changepassConfig.button.loading : changepassConfig.button.submit}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
