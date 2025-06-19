'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { api } from "../../../../utils/axios";
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
import { useLanguage } from '@/context/LanguageContext';
import viConfig from '../../../../utils/petPagesConfig.vi';
import enConfig from '../../../../utils/petPagesConfig.en';

interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;  // URL của ảnh sau khi upload
  image?: File;       // File ảnh khi upload
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
  link?: string;
}

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (data: Omit<Banner, '_id'>) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

function BannerForm({ banner, onSubmit, isOpen, onClose }: BannerFormProps) {
  const { lang } = useLanguage();
  const pagesConfig = lang === 'vi' ? viConfig : enConfig;
  const bannerManagementConfig = pagesConfig.bannerManagement;
  const [formData, setFormData] = useState({
    _id: banner?._id || '',
    title: banner?.title || '',
    description: banner?.description || '',
    image: banner?.image || '',
    status: banner?.status || 'active',
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    link: banner?.link || ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

    try {
      if (!selectedFile && !banner) {
        throw new Error('Please select an image');
      }

      const bannerData: Omit<Banner, '_id'> = {
        title: formData.title,
        description: formData.description,
        status: formData.status as 'active' | 'inactive',
        startDate: formData.startDate,
        endDate: formData.endDate,
        link: formData.link,
        image: selectedFile || undefined
      };

      await onSubmit(bannerData);
      onClose();
    } catch (error) {
      console.error('Error saving banner:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="xl:max-w-[1000px] w-full max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{banner ? bannerManagementConfig.form.editTitle : bannerManagementConfig.form.addTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{bannerManagementConfig.form.fields.title} <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{bannerManagementConfig.form.fields.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{bannerManagementConfig.form.fields.image} <span className="text-red-500">*</span></Label>
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
                <p className="text-sm text-gray-500">{bannerManagementConfig.uploadingProgress}{uploadProgress}%</p>
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
            <Label htmlFor="status">{bannerManagementConfig.form.fields.status} <span className="text-red-500">*</span></Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={bannerManagementConfig.search.statusPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{bannerManagementConfig.form.fields.startDate}</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{bannerManagementConfig.form.fields.endDate}</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">{bannerManagementConfig.form.fields.link}</Label>
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
              {bannerManagementConfig.form.buttons.cancel}
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? `${bannerManagementConfig.uploadingProgress}${uploadProgress}%` : banner ? bannerManagementConfig.form.buttons.save : bannerManagementConfig.form.buttons.add}
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
  const { lang } = useLanguage();
  const pagesConfig = lang === 'vi' ? viConfig : enConfig;
  const bannerManagementConfig = pagesConfig.bannerManagement;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bannerManagementConfig.detail.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{bannerManagementConfig.form.fields.title}</Label>
            <p className="text-sm text-gray-700">{banner.title}</p>
          </div>
          <div className="space-y-2">
            <Label>{bannerManagementConfig.form.fields.description}</Label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{banner.description}</p>
          </div>
          <div className="space-y-2">
            <Label>{bannerManagementConfig.form.fields.image}</Label>
            <img src={banner.imageUrl} alt="Banner" width={600} height={600} />
          </div>
          <div className="space-y-2">
            <Label>{bannerManagementConfig.form.fields.status}</Label>
            <Badge variant={banner.status === 'active' ? 'default' : 'secondary'}>
              {banner.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label>{bannerManagementConfig.form.fields.startDate}</Label>
            <p className="text-sm text-gray-700">
              {new Date(banner.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{bannerManagementConfig.form.fields.endDate}</Label>
            <p className="text-sm text-gray-700">
              {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{bannerManagementConfig.form.fields.link}</Label>
            <p className="text-sm text-gray-700">
              {banner.link || 'N/A'}
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              {bannerManagementConfig.detail.closeButton}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BannerPage() {
  const { lang } = useLanguage();
  const pagesConfig = lang === 'vi' ? viConfig : enConfig;
  const bannerManagementConfig = pagesConfig.bannerManagement;
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await api.get('/banners');
      setBanners(data.data);
      console.log(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

      await api.post('/banners', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchBanners();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditBanner = async (data: Omit<Banner, '_id'>) => {
    if (!selectedBanner) return;
    
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

      const response = await api.put(`/banners/${selectedBanner._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBanners(banners.map(banner => 
        banner._id === selectedBanner._id ? response.data : banner
      ));
      
      setIsFormOpen(false);
      setSelectedBanner(undefined);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await api.delete(`/banners/${id}`);
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
            <CardTitle>{bannerManagementConfig.title}</CardTitle>
            <Button onClick={() => {
              setSelectedBanner(undefined);
              setIsFormOpen(true);
            }}>{bannerManagementConfig.addNewButton}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder={bannerManagementConfig.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={bannerManagementConfig.search.statusPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div>{bannerManagementConfig.loading}</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{bannerManagementConfig.table.headers.no}</TableHead>
                  <TableHead>{bannerManagementConfig.table.headers.title}</TableHead>
                  <TableHead>{bannerManagementConfig.table.headers.description}</TableHead>
                  <TableHead>{bannerManagementConfig.table.headers.status}</TableHead>
                  <TableHead>{bannerManagementConfig.table.headers.startDate}</TableHead>
                  <TableHead className="text-right">{bannerManagementConfig.table.headers.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBanners.map((banner, index) => (
                  <TableRow key={banner._id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
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

          <Pagination 
            filteredBanners={filteredBanners}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      <BannerForm
        banner={selectedBanner}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBanner(undefined);
        }}
        onSubmit={selectedBanner ? handleEditBanner : handleAddBanner}
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

interface PaginationProps {
  filteredBanners: Banner[];
  itemsPerPage: number;
  currentPage: number;
  setItemsPerPage: (value: number) => void;
  setCurrentPage: (value: number) => void;
}

function Pagination({ filteredBanners, itemsPerPage, currentPage, setItemsPerPage, setCurrentPage }: PaginationProps) {
  const { lang } = useLanguage();
  const pagesConfig = lang === 'vi' ? viConfig : enConfig;
  const bannerManagementConfig = pagesConfig.bannerManagement;
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          {bannerManagementConfig.pagination.previous}
        </Button>
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {bannerManagementConfig.pagination.next}
        </Button>
      </div>
    </div>
  );
}