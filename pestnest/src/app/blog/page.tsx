'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BlogImage {
  url: string;
}

interface Author {
  name: string;
  email: string;
}

interface BlogPost {
  _id: string;
  title: string;
  description: string;
  tag: string;
  images: BlogImage[];
  author: Author | null;
  createdAt: string;
}

export default function BlogPage() {
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/blogs');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch blogs');
        }
        
        setPosts(data.blogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">Blog PestNest</h1>
          <p className="text-xl md:text-2xl text-center max-w-2xl mx-auto text-amber-100">Chia sẻ kiến thức về phòng chống và diệt côn trùng</p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-16">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 rounded-full border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-md text-black placeholder-gray-500"
            />
          </div>
        </div>

        {/* Tag Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                selectedTag === '' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              Tất cả
            </button>
            {Array.from(new Set(posts.map(post => post.tag))).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  selectedTag === tag 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts
            .filter(post => 
              (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
              (selectedTag === '' || post.tag === selectedTag)
            )
            .map((post) => (
            <article key={post._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100">
              <div className="relative h-56">
                <Image
                  src={post.images[0]?.url || '/images/blog/default.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {post.tag}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <span className="text-sm text-amber-600 block mb-3">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 hover:text-amber-600 transition-colors duration-300">
                  <Link href={`/blog/${post._id}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">{post.description}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/blog/${post._id}`}
                    className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors duration-300"
                  >
                    Đọc thêm
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <span className="text-sm text-gray-500">
                    By {post.author?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl font-bold mb-6 text-white">Đăng ký nhận tin</h2>
          <p className="text-xl text-amber-100 mb-10 max-w-2xl mx-auto">Nhận thông tin mới nhất về phòng chống và diệt côn trùng</p>
          <div className="max-w-xl mx-auto">
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-6 py-4 rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:border-white bg-white/10 text-white placeholder-amber-200"
              />
              <button
                type="submit"
                className="bg-white text-amber-600 px-8 py-4 rounded-full font-semibold hover:bg-amber-50 transition-colors duration-300 transform hover:scale-105 shadow-lg"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
