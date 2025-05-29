'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pets-hero.jpg"
            alt="Pets Accessories"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-6"
          >
            PetNest Shop
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl font-bold mb-8"
          >
            Thiên đường phụ kiện cho thú cưng của bạn
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              href="/products"
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full text-lg font-bold transition-colors"
            >
              Mua sắm ngay
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">Sản phẩm nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{product.name}</h3>
                <p className="text-gray-800 font-medium mb-3">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-pink-600 font-bold text-lg">{product.price}</span>
                  <Link 
                    href={`/products/${product.id}`}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-800 text-sm">{category.count} sản phẩm</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-8">Đăng ký nhận thông báo</h2>
          <p className="text-xl font-bold mb-8">Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt</p>
          <Link 
            href="/register"
            className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-bold transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

const featuredProducts = [
  {
    id: 1,
    name: "Vòng cổ thời trang",
    description: "Vòng cổ handmade với chất liệu cao cấp, phù hợp cho chó mèo",
    price: "299.000đ",
    image: "/images/products/collar.jpg"
  },
  {
    id: 2,
    name: "Giường ngủ êm ái",
    description: "Giường ngủ mềm mại với thiết kế hiện đại, dễ vệ sinh",
    price: "599.000đ",
    image: "/images/products/bed.jpg"
  },
  {
    id: 3,
    name: "Balo thú cưng",
    description: "Balo du lịch tiện lợi, an toàn cho thú cưng của bạn",
    price: "799.000đ",
    image: "/images/products/backpack.jpg"
  }
];

const categories = [
  {
    icon: "🦮",
    name: "Phụ kiện chó",
    count: 120
  },
  {
    icon: "🐱",
    name: "Phụ kiện mèo",
    count: 85
  },
  {
    icon: "🛏️",
    name: "Đồ dùng ngủ",
    count: 45
  },
  {
    icon: "🎮",
    name: "Đồ chơi",
    count: 95
  }
];
