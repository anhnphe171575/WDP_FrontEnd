'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { User, Mail, Phone, MapPin, Calendar, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import viConfig from '../../../utils/petPagesConfig.vi';
import enConfig from '../../../utils/petPagesConfig.en';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    joinDate?: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        role: number;
        address?: string;
        verified: boolean;
        createdAt: string;
    }
}

const UserProfilePage = () => {
    const router = useRouter();
    const { lang } = useLanguage();
    const pagesConfig = lang === 'vi' ? viConfig : enConfig;
    const config = pagesConfig.userProfilePage;
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        address: '',
        joinDate: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error(config.notFoundToken);
                }

                const response = await axios.get<ApiResponse>('http://localhost:5000/api/auth/myprofile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    const profileData = response.data.user;
                    setUserData({
                        name: profileData.name,
                        email: profileData.email,
                        phone: profileData.phone,
                        address: profileData.address || config.notUpdatedAddress,
                        joinDate: new Date(profileData.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                            month: 'long',
                            year: 'numeric'
                        })
                    });
                }
            } catch (err) {
                setError(config.fetchError);
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [lang]);

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleUpdate = () => {
        // TODO: Thêm logic cập nhật thông tin lên server
        setIsEditing(false);
    };

    const handleChangePassword = () => {
        router.push('/changepass');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="text-red-500 text-xl font-medium mb-4">⚠️ {error}</div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {config.retry}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-t-xl shadow-sm p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-blue-500" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
                                    <p className="text-gray-500">{config.memberSince.replace('{joinDate}', userData.joinDate || '')}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleChangePassword}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>{config.changePassword}</span>
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        isEditing 
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    {isEditing ? config.cancel : config.edit}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-white rounded-b-xl shadow-sm p-6">
                        <div className="space-y-6">
                            {/* Name Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <User className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.name}</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userData.name}
                                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 text-lg">{userData.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <Mail className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.email}</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={userData.email}
                                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 text-lg">{userData.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Phone className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.phone}</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={userData.phone}
                                            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 text-lg">{userData.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Address Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <MapPin className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.address}</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userData.address}
                                            onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 text-lg">{userData.address}</p>
                                    )}
                                </div>
                            </div>

                            {/* Join Date Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-pink-50 rounded-lg">
                                    <Calendar className="w-6 h-6 text-pink-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.joinDate}</label>
                                    <p className="text-gray-900 text-lg">{userData.joinDate}</p>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-8">
                                <button
                                    onClick={handleUpdate}
                                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
                                >
                                    {config.save}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfilePage;