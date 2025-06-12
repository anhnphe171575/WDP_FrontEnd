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

interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  image?: File;
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
  link?: string;
}

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (data: Omit<Banner, '_id'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

function BannerForm({ banner, onSubmit, isOpen, onClose }: BannerFormProps) {
  const [formData, setFormData] = useState({
    _id: banner?._id || '',
    title: banner?.title || '',
    description: banner?.description || '',
    imageUrl: banner?.imageUrl || '',
    status: banner?.status || 'active',
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    link: banner?.link || ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { request } = useApi();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (!selectedFile && !banner) {
        throw new Error('Please select an image');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('status', formData.status);
      formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      if (formData.link) formDataToSend.append('link', formData.link);
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await request(() => 
        api.post('/banners', formDataToSend, {
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
      console.error('Error saving banner:', error);
      // You might want to show an error toast here
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{banner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Banner Image <span className="text-red-500">*</span></Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
              required={!banner}
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
            {imagePreview && (
              <div className="mt-2 relative w-full h-48">
                <NextImage
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? `Uploading ${uploadProgress}%` : banner ? 'Save Changes' : 'Add Banner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface BannerDetailProps {
  banner: Banner;
  isOpen: boolean;
  onClose: () => void;
}

function BannerDetail({ banner, isOpen, onClose }: BannerDetailProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Banner Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <p className="text-sm text-gray-700">{banner.title}</p>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{banner.description}</p>
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <img src={banner.imageUrl} alt="Banner" width={600} height={600} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Badge variant={banner.status === 'active' ? 'default' : 'secondary'}>
              {banner.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <p className="text-sm text-gray-700">
              {new Date(banner.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <p className="text-sm text-gray-700">
              {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <p className="text-sm text-gray-700">
              {banner.link || 'N/A'}
            </p>
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

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | undefined>();
  const { request } = useApi();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await request(() => api.get('/banners'));
        setBanners(data);
        console.log(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const filteredBanners = banners.filter(banner =>
    banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBanner = async (data: Omit<Banner, '_id'>) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('status', data.status);
      formData.append('startDate', data.startDate);
      if (data.endDate) formData.append('endDate', data.endDate);
      if (data.link) formData.append('link', data.link);
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await request(() => 
        api.post('/banners', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
      );
      
      setBanners([...banners, response]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditBanner = async (data: Omit<Banner, '_id'>) => {
    if (!selectedBanner) return;
    try {
      const response = await request(() => api.put(`/banners/${selectedBanner._id}`, data));
      setBanners(banners.map(banner => banner._id === selectedBanner._id ? response : banner));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await request(() => api.delete(`/banners/${id}`));
      setBanners(banners.filter(banner => banner._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Banner Management</CardTitle>
            <Button onClick={() => {
              setSelectedBanner(undefined);
              setIsFormOpen(true);
            }}>Add New Banner</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search banners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="table-banner">
                {filteredBanners.map((banner, index) => (
                  <TableRow key={banner._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{banner.title}</TableCell>
                    <TableCell>{banner.description}</TableCell>
                    <TableCell>
                      <Badge variant={banner.status === 'active' ? 'default' : 'secondary'}>
                        {banner.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(banner.startDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="View Details"
                          onClick={() => {
                            setSelectedBanner(banner);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="Edit Banner" 
                          onClick={() => {
                            setSelectedBanner(banner);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Banner"
                          onClick={() => handleDeleteBanner(banner._id)}
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

      <BannerForm
        banner={selectedBanner}
        onSubmit={selectedBanner ? handleEditBanner : handleAddBanner}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBanner(undefined);
        }}
      />

      {selectedBanner && (
        <BannerDetail
          banner={selectedBanner}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedBanner(undefined);
          }}
        />
      )}
    </div>
  );
}