'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    avatar?: string;
    title?: string;
    joinDate?: string;
}

interface InfoFieldProps {
    icon: string;
    label: string;
    value: string;
    className?: string;
    isEditing?: boolean;
    onChange?: (value: string) => void;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        dob: string;
        role: number;
        verified: boolean;
        address: string[];
        createdAt: string;
        updatedAt: string;
    }
}

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        address: '',
        title: 'Người Yêu Động Vật',
        joinDate: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage
                if (!token) {
                    throw new Error('Không tìm thấy token');
                }

                const response = await axios.get<ApiResponse>('http://localhost:5000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    const profileData = response.data.data;
                    setUserData({
                        name: profileData.name,
                        email: profileData.email,
                        phone: profileData.phone,
                        address: profileData.address.join(', ') || '',
                        title: 'Người Yêu Động Vật',
                        joinDate: new Date(profileData.createdAt).toLocaleDateString('vi-VN', {
                            month: 'long',
                            year: 'numeric'
                        })
                    });
                }
            } catch (err) {
                setError('Không thể tải thông tin profile. Vui lòng thử lại sau.');
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleUpdate = () => {
        // TODO: Thêm logic cập nhật thông tin lên server
        setIsEditing(false);
    };

    const handleChangePassword = () => {
        // TODO: Thêm logic đổi mật khẩu
    };

    const InfoField = ({ icon, label, value, className = "", isEditing = false, onChange }: InfoFieldProps) => (
        <div className={`group p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}>
            <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-lg font-bold">{icon}</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</p>
                    {isEditing ? (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange?.(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-900 font-medium text-lg">{value}</p>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="text-2xl font-semibold text-gray-700">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="text-2xl font-semibold text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>

            <div className="relative py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Main Profile Card */}
                    <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/30 hover:shadow-3xl transition-all duration-500">
                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-16 text-white relative overflow-hidden">
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">
                                    {/* Avatar */}
                                    <div className="relative group">
                                        <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-6xl font-bold border-4 border-white/40 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                                            {userData.name.charAt(0)}
                                        </div>
                                        <button className="absolute bottom-2 right-2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/40 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center text-lg">
                                            📷
                                        </button>
                                    </div>

                                    {/* User Details */}
                                    <div className="text-center md:text-left flex-1">
                                        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text">{userData.name}</h1>
                                        <p className="text-2xl text-white/90 mb-6 font-light">{userData.title}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30 font-medium">
                                                🗓️ Thành viên từ {userData.joinDate}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Edit Button */}
                                    <button
                                        onClick={handleEdit}
                                        className="p-4 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 text-2xl shadow-lg"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Information Section */}
                        <div className="px-8 py-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                👤 Thông tin liên hệ
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField
                                    icon="👤"
                                    label="Họ và tên"
                                    value={userData.name}
                                    isEditing={isEditing}
                                    onChange={(value) => setUserData({ ...userData, name: value })}
                                />
                                <InfoField
                                    icon="📧"
                                    label="Email"
                                    value={userData.email}
                                    isEditing={isEditing}
                                    onChange={(value) => setUserData({ ...userData, email: value })}
                                />
                                <InfoField
                                    icon="📱"
                                    label="Số điện thoại"
                                    value={userData.phone}
                                    isEditing={isEditing}
                                    onChange={(value) => setUserData({ ...userData, phone: value })}
                                />
                                <InfoField
                                    icon="📍"
                                    label="Địa chỉ"
                                    value={userData.address}
                                    className="md:col-span-2"
                                    isEditing={isEditing}
                                    onChange={(value) => setUserData({ ...userData, address: value })}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-8 pb-10">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
                                >
                                    🔄 Cập nhật thông tin
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                                >
                                    🔐 Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;