'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { useApi } from "../../../../utils/axios";
import { api } from "../../../../utils/axios";
import { AxiosProgressEvent } from "axios";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Eye, Image, Trash2 } from "lucide-react";
import NextImage from "next/image";

interface Blog {
  _id: string;
  title: string;
  description: string;
  tag: string;
  images: { url: string }[];
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface BlogFormProps {
  blog?: Blog;
  onSubmit: (data: Omit<Blog, '_id' | 'author' | 'createdAt'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

function BlogForm({ blog, onSubmit, isOpen, onClose }: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    description: blog?.description || '',
    tag: blog?.tag || '',
  });
  const [imagePreview, setImagePreview] = useState<string[]>(blog?.images.map(img => img.url) || []);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { request } = useApi();

  // Reset form when blog changes
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        description: blog.description,
        tag: blog.tag,
      });
      setImagePreview(blog.images.map(img => img.url));
    } else {
      setFormData({
        title: '',
        description: '',
        tag: '',
      });
      setImagePreview([]);
    }
  }, [blog]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...previews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreview(imagePreview.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tag', formData.tag);
      
      selectedFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const response = await request(() => 
        api.post('/blogs', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        })
      );
      onSubmit(response);
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold">{blog ? 'Edit Blog' : 'Add New Blog'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-bold">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter blog title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="font-bold">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Enter blog description"
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag" className="font-bold">Tag <span className="text-red-500">*</span></Label>
            <Input
              id="tag"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              required
              placeholder="Enter blog tag"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images" className="font-bold">Blog Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">Uploading: {uploadProgress}%</p>
              </div>
            )}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {imagePreview.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32">
                      <NextImage
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? `Uploading ${uploadProgress}%` : blog ? 'Save Changes' : 'Add Blog'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface BlogDetailProps {
  blog: Blog;
  isOpen: boolean;
  onClose: () => void;
}

function BlogDetail({ blog, isOpen, onClose }: BlogDetailProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold">Blog Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold">Title</Label>
            <p className="text-sm text-gray-700">{blog.title}</p>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Description</Label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{blog.description}</p>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Tag</Label>
            <Badge variant="secondary">{blog.tag}</Badge>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Author</Label>
            <p className="text-sm text-gray-700">{blog.author.name}</p>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Created At</Label>
            <p className="text-sm text-gray-700">
              {new Date(blog.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Images</Label>
            <div className="grid grid-cols-2 gap-2">
              {blog.images.map((image, index) => (
                <div key={index} className="relative w-full h-32">
                  <NextImage
                    src={image.url}
                    alt={`Blog image ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | undefined>();
  const { request } = useApi();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await request(() => api.get('/blogs'));
        setBlogs(response.blogs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBlog = async (data: Omit<Blog, '_id' | 'author' | 'createdAt'>) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('tag', data.tag);
      
      const response = await request(() => 
        api.post('/blogs', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
      );
      
      setBlogs([...blogs, response]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditBlog = async (data: Omit<Blog, '_id' | 'author' | 'createdAt'>) => {
    if (!selectedBlog) return;
    try {
      const response = await request(() => api.put(`/blogs/${selectedBlog._id}`, data));
      setBlogs(blogs.map(blog => blog._id === selectedBlog._id ? response : blog));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      await request(() => api.delete(`/blogs/${id}`));
      setBlogs(blogs.filter(blog => blog._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blog Management</CardTitle>
            <Button onClick={() => {
              setSelectedBlog(undefined);
              setIsFormOpen(true);
            }}>Add New Blog</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="tips">Tips</SelectItem>
                <SelectItem value="guides">Guides</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.map((blog, index) => (
                  <TableRow key={blog._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{blog.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{blog.tag}</Badge>
                    </TableCell>
                    <TableCell>{blog.author.name}</TableCell>
                    <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="View Details"
                          onClick={() => {
                            setSelectedBlog(blog);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="Edit Blog" 
                          onClick={() => {
                            setSelectedBlog(blog);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Blog"
                          onClick={() => handleDeleteBlog(blog._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BlogForm
        blog={selectedBlog}
        onSubmit={selectedBlog ? handleEditBlog : handleAddBlog}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBlog(undefined);
        }}
      />

      {selectedBlog && (
        <BlogDetail
          blog={selectedBlog}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedBlog(undefined);
          }}
        />
      )}
    </div>
  );
} 