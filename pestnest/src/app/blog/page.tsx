'use client';

import Image from 'next/image';
import Link from 'next/link';

// Mock data cho blog posts
const blogPosts = [
  {
    id: 1,
    title: 'Cách chăm sóc thú cưng mùa hè đúng cách',
    excerpt: 'Những lưu ý quan trọng khi chăm sóc thú cưng trong thời tiết nắng nóng và cách giúp chúng luôn khỏe mạnh.',
    image: '/images/blog/pet-summer-care.jpg',
    date: '15/03/2024',
    category: 'Chăm sóc thú cưng'
  },
  {
    id: 2,
    title: 'Dịch vụ spa và làm đẹp cho thú cưng tại Hà Nội',
    excerpt: 'Khám phá các dịch vụ spa, làm đẹp và chăm sóc thú cưng chuyên nghiệp tại khu vực Hà Nội.',
    image: '/images/blog/pet-spa.jpg',
    date: '10/03/2024',
    category: 'Dịch vụ'
  },
  {
    id: 3,
    title: 'Chế độ dinh dưỡng phù hợp cho từng loại thú cưng',
    excerpt: 'Tìm hiểu về chế độ dinh dưỡng khoa học và phù hợp cho chó, mèo và các loại thú cưng khác.',
    image: '/images/blog/pet-nutrition.jpg',
    date: '05/03/2024',
    category: 'Dinh dưỡng'
  }
];

export default function BlogPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100">
              <div className="relative h-56">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <span className="text-sm text-amber-600 block mb-3">{post.date}</span>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 hover:text-amber-600 transition-colors duration-300">
                  <Link href={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">{post.excerpt}</p>
                <Link 
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors duration-300"
                >
                  Đọc thêm
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
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
