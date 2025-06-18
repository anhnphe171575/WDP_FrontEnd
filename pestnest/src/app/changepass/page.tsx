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

export default function ChangePasswordPage() {
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

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        // Validate current password
        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
        }

        // Validate new password
        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = 'Mật khẩu phải chứa chữ hoa, chữ thường và số'
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
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
                setErrors({ currentPassword: response.data.message || 'Có lỗi xảy ra khi đổi mật khẩu' })
            }

        } catch (error: unknown) {
            console.error('Error changing password:', error)
            
            const axiosError = error as AxiosError<ErrorResponse>
            
            // Xử lý các loại lỗi khác nhau
            if (axiosError.response?.status === 401) {
                setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' })
            } else if (axiosError.response?.status === 403) {
                setErrors({ currentPassword: 'Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.' })
            } else if (axiosError.response?.data?.message) {
                setErrors({ currentPassword: axiosError.response.data.message })
            } else {
                setErrors({ currentPassword: 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.' })
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
                        <CardTitle className="text-2xl font-bold">Đổi Mật Khẩu</CardTitle>
                        <CardDescription>
                            Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản của bạn
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showPasswords.current ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu hiện tại"
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
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPasswords.new ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu mới"
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
                                {errors.newPassword && (
                                    <div className="flex items-center gap-2 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.newPassword}
                                    </div>
                                )}
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

                            {/* Success Message */}
                            {isSuccess && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-green-800">
                                        Đổi mật khẩu thành công!
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
                                {isLoading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
