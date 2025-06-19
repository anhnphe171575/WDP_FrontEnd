'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { User, Mail, Phone, MapPin, Calendar, Lock } from 'lucide-react';

interface Address {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: Address;
    joinDate?: string;
    birthday?: string;
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
        birthday?: string;
    }
}

const UserProfilePage = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        address: {},
        joinDate: '',
        birthday: ''
    });
    const [editData, setEditData] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('Không tìm thấy token');
                }

                const response = await axios.get<ApiResponse>('http://localhost:5000/api/auth/myprofile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    const profileData = response.data.user;
                    let addressObj: Address = {};
                    if (Array.isArray(profileData.address) && profileData.address.length > 0) {
                        addressObj = profileData.address[0];
                    } else if (typeof profileData.address === 'object') {
                        addressObj = profileData.address;
                    }
                    setUserData({
                        name: profileData.name,
                        email: profileData.email,
                        phone: profileData.phone,
                        address: addressObj,
                        joinDate: new Date(profileData.createdAt).toLocaleDateString('vi-VN', {
                            month: 'long',
                            year: 'numeric'
                        }),
                        birthday: profileData.birthday ? new Date(profileData.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'
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
        if (!isEditing) {
            setEditData(userData);
        }
        setIsEditing(!isEditing);
    };

    const handleUpdate = async () => {
        if (!editData) return;
        try {
            setLoading(true);
            setError(null);
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Không tìm thấy token');
            }
            const payload: Record<string, unknown> = {
                name: editData.name,
                phone: editData.phone,
                dob: editData.birthday ? new Date(editData.birthday).toISOString() : undefined,
                address: editData.address
            };
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
            await axios.put('http://localhost:5000/api/users/edit-profile', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setUserData(editData);
            setIsEditing(false);
            setEditData(null);
        } catch (err) {
            setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
            console.error('Error updating profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData(null);
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
                        Thử lại
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
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {isEditing ? editData?.name : userData.name}
                                    </h1>
                                    <p className="text-gray-500">Thành viên từ {isEditing ? editData?.joinDate : userData.joinDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleChangePassword}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>Thay đổi mật khẩu</span>
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className={`px-4 py-2 rounded-lg transition-colors ${isEditing
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={isEditing ? editData?.name : userData.name}
                                        onChange={e => isEditing && setEditData(editData => editData ? { ...editData, name: e.target.value } : null)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <Mail className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900 text-lg">{userData.email}</p>
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Phone className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={isEditing ? editData?.phone : userData.phone}
                                        onChange={e => isEditing && setEditData(editData => editData ? { ...editData, phone: e.target.value } : null)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {/* Address Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <MapPin className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="block text-sm text-gray-700">Đường</label>
                                                <input
                                                    type="text"
                                                    placeholder="Số nhà, đường..."
                                                    value={isEditing ? editData?.address?.street || '' : userData.address?.street || ''}
                                                    onChange={e => isEditing && setEditData(editData => editData ? { ...editData, address: { ...editData.address, street: e.target.value } } : null)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-1"
                                                    disabled={!isEditing}
                                                />
                                                <label className="block text-sm text-gray-700">Thành phố</label>
                                                <input
                                                    type="text"
                                                    placeholder="Thành phố"
                                                    value={isEditing ? editData?.address?.city || '' : userData.address?.city || ''}
                                                    onChange={e => isEditing && setEditData(editData => editData ? { ...editData, address: { ...editData.address, city: e.target.value } } : null)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-1"
                                                    disabled={!isEditing}
                                                />
                                                <label className="block text-sm text-gray-700">Tỉnh/Bang</label>
                                                <input
                                                    type="text"
                                                    placeholder="Tỉnh/Bang"
                                                    value={isEditing ? editData?.address?.state || '' : userData.address?.state || ''}
                                                    onChange={e => isEditing && setEditData(editData => editData ? { ...editData, address: { ...editData.address, state: e.target.value } } : null)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-1"
                                                    disabled={!isEditing}
                                                />
                                                <label className="block text-sm text-gray-700">Mã bưu điện</label>
                                                <input
                                                    type="text"
                                                    placeholder="Mã bưu điện"
                                                    value={isEditing ? editData?.address?.postalCode || '' : userData.address?.postalCode || ''}
                                                    onChange={e => isEditing && setEditData(editData => editData ? { ...editData, address: { ...editData.address, postalCode: e.target.value } } : null)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-1"
                                                    disabled={!isEditing}
                                                />
                                                <label className="block text-sm text-gray-700">Quốc gia</label>
                                                <input
                                                    type="text"
                                                    placeholder="Quốc gia"
                                                    value={isEditing ? editData?.address?.country || '' : userData.address?.country || ''}
                                                    onChange={e => isEditing && setEditData(editData => editData ? { ...editData, address: { ...editData.address, country: e.target.value } } : null)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        userData.address && (userData.address.street || userData.address.city || userData.address.state || userData.address.postalCode || userData.address.country) ? (
                                            <p className="text-gray-900 text-lg">
                                                {[userData.address.street, userData.address.city, userData.address.state, userData.address.postalCode, userData.address.country].filter(Boolean).join(', ')}
                                            </p>
                                        ) : (
                                            <p className="text-gray-500">Chưa cập nhật địa chỉ</p>
                                        )
                                    )}
                                </div>
                            </div>
                            {/* Birthday Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <Calendar className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={isEditing ? (editData?.birthday ? new Date(editData.birthday).toISOString().split('T')[0] : '') : (userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '')}
                                        onChange={e => isEditing && setEditData(editData => editData ? { ...editData, birthday: e.target.value } : null)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            {/* Join Date Field */}
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-pink-50 rounded-lg">
                                    <Calendar className="w-6 h-6 text-pink-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tham gia</label>
                                    <p className="text-gray-900 text-lg">{userData.joinDate}</p>
                                </div>
                            </div>


                        </div>

                        {isEditing && (
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={handleUpdate}
                                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
                                >
                                    Lưu thay đổi
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-lg"
                                >
                                    Hủy
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