'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Định nghĩa kiểu dữ liệu category
interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  children?: Category[];
}

interface ParentCategory {
  parent: Category;
  children: Category[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Sửa lại nếu cần

const Header: React.FC = () => {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Gọi API backend lấy category cha-con-cháu
    fetch(`${API_URL}/categories/childCategories`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Lỗi lấy danh mục');
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Đang tải menu...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <nav className="bg-blue-700 text-white px-8 py-3 shadow">
      <ul className="flex gap-8">
        {categories.map((cat) => (
          <li key={cat.parent._id} className="relative group">
            <button
              className="font-semibold flex items-center gap-1 focus:outline-none mr-3 mt-1"
              onClick={() => router.push(`/category/${cat.parent._id}`)}
            >
              {cat.parent.name}
              <span className="ml-1">▼</span>
            </button>
            {/* Mega menu */}
            <div className="absolute left-0 top-full bg-white text-black shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 min-w-[800px] p-6 border-t border-gray-200">
              <div className="grid grid-cols-4 gap-8">
                {cat.children.map((child) => (
                  <div key={child._id}>
                    <div
                      className="font-bold mb-2 flex items-center cursor-pointer hover:underline"
                      onClick={() => router.push(`/category/${child._id}`)}
                    >
                      {child.name}
                      {child.children && child.children.length > 0 && (
                        <span className="ml-1">&gt;</span>
                      )}
                    </div>
                    <ul>
                      {child.children?.map((grand) => (
                        <li
                          key={grand._id}
                          className="mb-1 hover:underline cursor-pointer text-sm pl-2"
                          onClick={() => router.push(`/category/${grand._id}`)}
                        >
                          {grand.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Header;
