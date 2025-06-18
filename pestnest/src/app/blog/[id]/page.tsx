'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '../../../../utils/axios';
import Header from '@/components/layout/Header';

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

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/blogs/${resolvedParams.id}`);
        const data = response.data;
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch blog');
        }
        
        setPost(data.blog);

        // Fetch all blogs for suggested reading
        const relatedResponse = await api.get(`/blogs`);
        if (relatedResponse.data.success) {
          // Filter out current post and limit to 6 posts
          const filteredRelated = relatedResponse.data.blogs
            .filter((blog: BlogPost) => blog._id !== data.blog._id)
            .slice(0, 6);
          setRelatedPosts(filteredRelated);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! An error occurred</h2>
          <p className="text-gray-600 mb-6">{error || 'Post not found'}</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-green-700 text-white rounded-full hover:bg-green-800 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans">
      
      
      <Header></Header>
      

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-orange-700 hover:text-orange-900 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>

        {/* Blog Post Content */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-900 mb-4 leading-tight">{post.title}</h2>
          <div className="flex flex-wrap items-center text-orange-700 text-sm mb-4 gap-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.images.length > 0 && (
            <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden shadow-md">
              <Image
                src={post.images[0].url}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Blog Content */}
          <article className="prose prose-lg max-w-none text-orange-900 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: post.description }} />
          </article>

          {/* Related Blogs Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-orange-900 mb-8">Suggested Reading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    href={`/blog/${relatedPost._id}`} 
                    key={relatedPost._id}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:transform group-hover:scale-105">
                      {relatedPost.images.length > 0 && (
                        <div className="relative h-48">
                          <Image
                            src={relatedPost.images[0].url}
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="text-sm text-orange-600 mb-2">{relatedPost.tag}</div>
                        <h4 className="text-lg font-semibold text-orange-900 mb-2 group-hover:text-orange-700">
                          {relatedPost.title}
                        </h4>
                        <p className="text-orange-700 text-sm line-clamp-2">
                          {relatedPost.description.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 