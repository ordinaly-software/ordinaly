"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Alert from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Upload,
  FileText
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import Image from "next/image";

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  price?: string | null;
  location: string;
  date: string;
  max_attendants: number;
  created_at: string;
  updated_at: string;
}

// Custom image loader to handle potential URL issues
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

const AdminCoursesTab = () => {
  const t = useTranslations("admin.courses");
  const tAdmin = useTranslations("admin");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    price: "",
    location: "",
    date: "",
    max_attendants: ""
  });

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/courses/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } else {
        setAlert({type: 'error', message: t('messages.fetchError')});
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      price: "",
      location: "",
      date: "",
      max_attendants: ""
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (course: Course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title,
      subtitle: course.subtitle || "",
      description: course.description,
      price: course.price || "",
      location: course.location,
      date: course.date,
      max_attendants: course.max_attendants.toString()
    });
    setPreviewUrl(course.image);
    setShowEditModal(true);
  };

  const handleDelete = (course: Course) => {
    setCurrentCourse(course);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedCourses.length === 0) {
      setAlert({type: 'warning', message: t('messages.selectToDelete')});
      return;
    }
    setShowDeleteModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setAlert({type: 'error', message: t('messages.fileSizeLimit')});
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setAlert({type: 'error', message: t('messages.imageFileOnly')});
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const submitCourse = async (isEdit: boolean) => {
    try {
      // Basic validation
      if (!formData.title.trim()) {
        setAlert({type: 'error', message: t('messages.validation.titleRequired')});
        return;
      }
      if (!formData.description.trim()) {
        setAlert({type: 'error', message: t('messages.validation.descriptionRequired')});
        return;
      }
      if (!formData.location.trim()) {
        setAlert({type: 'error', message: t('messages.validation.locationRequired')});
        return;
      }
      if (!formData.date.trim()) {
        setAlert({type: 'error', message: t('messages.validation.dateRequired')});
        return;
      }
      if (!formData.max_attendants || parseInt(formData.max_attendants) < 1) {
        setAlert({type: 'error', message: t('messages.validation.maxAttendantsInvalid')});
        return;
      }
      if (formData.price && parseFloat(formData.price) < 0.01) {
        setAlert({type: 'error', message: t('messages.validation.priceInvalid')});
        return;
      }
      if (!isEdit && !selectedFile) {
        setAlert({type: 'error', message: t('messages.validation.imageRequired')});
        return;
      }

      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('description', formData.description);
      if (formData.price) {
        formDataToSend.append('price', formData.price);
      }
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('max_attendants', formData.max_attendants);
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const url = isEdit 
        ? `${apiUrl}/api/courses/${currentCourse?.id}/`
        : `${apiUrl}/api/courses/`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const courseTitle = formData.title;
        const successMessage = isEdit 
          ? t('messages.updateSuccess', { title: courseTitle })
          : t('messages.createSuccess', { title: courseTitle });
        
        setAlert({type: 'success', message: successMessage});
        
        fetchCourses();
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        
        // Handle specific validation errors
        if (errorData.title) {
          setAlert({type: 'error', message: t('messages.validation.titleRequired')});
        } else if (errorData.description) {
          setAlert({type: 'error', message: t('messages.validation.descriptionRequired')});
        } else if (errorData.location) {
          setAlert({type: 'error', message: t('messages.validation.locationRequired')});
        } else if (errorData.date) {
          setAlert({type: 'error', message: t('messages.validation.dateRequired')});
        } else if (errorData.max_attendants) {
          setAlert({type: 'error', message: t('messages.validation.maxAttendantsInvalid')});
        } else if (errorData.price) {
          setAlert({type: 'error', message: t('messages.validation.priceInvalid')});
        } else if (errorData.image) {
          setAlert({type: 'error', message: t('messages.validation.imageRequired')});
        } else {
          setAlert({type: 'error', message: errorData.detail || t(isEdit ? 'messages.updateError' : 'messages.createError')});
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      setAlert({type: 'error', message: t('messages.networkError')});
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      if (selectedCourses.length > 0) {
        // Bulk delete
        const deletePromises = selectedCourses.map(id =>
          fetch(`${apiUrl}/api/courses/${id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Token ${token}`,
            },
          })
        );

        const results = await Promise.all(deletePromises);
        const failedCount = results.filter(r => !r.ok).length;
        
        if (failedCount === 0) {
          setAlert({type: 'success', message: `${selectedCourses.length} ${t('messages.bulkDeleteSuccess')}`});
        } else {
          setAlert({type: 'warning', message: `${selectedCourses.length - failedCount} ${t('messages.bulkDeleteSuccess')}, ${failedCount} failed`});
        }
        
        setSelectedCourses([]);
      } else if (currentCourse) {
        // Single delete
        const response = await fetch(`${apiUrl}/api/courses/${currentCourse.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          setAlert({type: 'success', message: t('messages.deleteSuccess')});
        } else {
          setAlert({type: 'error', message: t('messages.deleteError')});
        }
      }

      fetchCourses();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete error:', error);
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCourseSelection = (id: number) => {
    setSelectedCourses(prev =>
      prev.includes(id)
        ? prev.filter(courseId => courseId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filteredCourses = (courses || []).filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.id));
    }
  };

  const filteredCourses = (courses || []).filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29BF12]"></div>
      </div>
    );
  }

  return (
    <div>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedCourses.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("deleteSelected")} ({selectedCourses.length})</span>
            </Button>
          )}
          <Button
            onClick={handleCreate}
            className="bg-[#29BF12] hover:bg-[#22A010] text-white flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>{t("addCourse")}</span>
          </Button>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm ? t('noCoursesFound') : t('noCourses')}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-[#29BF12] focus:ring-[#29BF12]"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("selectAll")} ({filteredCourses.length} {t("courses")})
            </span>
          </div>

          {filteredCourses.map((course) => (
            <Card key={course.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => toggleCourseSelection(course.id)}
                    className="mt-1 rounded border-gray-300 text-[#29BF12] focus:ring-[#29BF12]"
                  />
                  
                  {/* Course Image */}
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                    {course.image && course.image !== 'undefined' && course.image !== 'null' ? (
                      <Image
                        loader={imageLoader}
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={(e) => {
                          console.error('Course image failed to load:', course.image);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {course.subtitle}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{tAdmin("labels.price")}: {course.price ? `€${course.price}` : t("contactForQuote")}</span>
                          <span>{tAdmin("labels.location")}: {course.location}</span>
                          <span>{tAdmin("labels.date")}: {course.date}</span>
                          <span>{tAdmin("labels.maxAttendants")}: {course.max_attendants}</span>
                          <span>{tAdmin("labels.created")}: {new Date(course.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(course)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Course Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        title={showEditModal ? t("editCourse") : t("createCourse")}
        showHeader={true}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Course Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-[#29BF12]/10 rounded flex items-center justify-center">
                <FileText className="w-3 h-3 text-[#29BF12]" />
              </div>
              <span>{t("form.titleRequired")}</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
              placeholder={t("form.titlePlaceholder")}
              className="h-12 border-gray-300 focus:border-[#29BF12] focus:ring-[#29BF12]/20 rounded-lg transition-all duration-200"
              required
            />
          </div>
          
          {/* Course Subtitle */}
          <div className="space-y-3">
            <Label htmlFor="subtitle" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">S</span>
              </div>
              <span>{t("form.subtitleOptional")}</span>
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({...prev, subtitle: e.target.value}))}
              placeholder={t("form.subtitlePlaceholder")}
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
            />
          </div>

          {/* Course Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                <Edit className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span>{t("form.descriptionRequired")}</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder={t("form.descriptionPlaceholder")}
              rows={4}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg transition-all duration-200 resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label htmlFor="image" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                <Upload className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              </div>
              <span>{!showEditModal ? t("form.imageRequired") : t("form.imageOptional")}</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/5">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {selectedFile.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image')?.click()}
                        className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200"
                      >
                        {t("form.chooseImageText")}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">{t("form.imageRecommendation")}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {previewUrl && previewUrl !== 'undefined' && previewUrl !== 'null' && (
                <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    loader={imageLoader}
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="128px"
                    onError={() => {
                      console.error('Preview image failed to load:', previewUrl);
                      setPreviewUrl("");
                    }}
                  />
                  <ModalCloseButton
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    variant="light"
                    size="sm"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Price and Max Attendants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="price" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">€</span>
                </div>
                <span>{t("form.price")}</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                placeholder={t("form.pricePlaceholder")}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 rounded-lg transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="max_attendants" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">#</span>
                </div>
                <span>{t("form.maxAttendantsRequired")}</span>
              </Label>
              <Input
                id="max_attendants"
                type="number"
                min="1"
                value={formData.max_attendants}
                onChange={(e) => setFormData(prev => ({...prev, max_attendants: e.target.value}))}
                placeholder={t("form.maxAttendantsPlaceholder")}
                className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label htmlFor="location" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">📍</span>
              </div>
              <span>{t("form.locationRequired")}</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
              placeholder={t("form.locationPlaceholder")}
              className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
              required
            />
          </div>

          {/* Course Date */}
          <div className="space-y-3">
            <Label htmlFor="date" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">📅</span>
              </div>
              <span>{t("form.dateRequired")}</span>
            </Label>
            <Input
              id="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
              placeholder={t("form.datePlaceholder")}
              className="h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-lg transition-all duration-200"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {t("form.cancel")}
            </Button>
            <Button
              onClick={() => submitCourse(showEditModal)}
              className="px-6 py-2 bg-[#29BF12] hover:bg-[#22A010] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <span>{showEditModal ? t("form.update") : t("form.create")}</span>
              {showEditModal ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("confirmDelete.title")}
        message={
          selectedCourses.length > 0
            ? t("confirmDelete.multiple", { count: selectedCourses.length })
            : t("confirmDelete.single", { title: currentCourse?.title ?? "" })
        }
        confirmText={t("confirmDelete.delete")}
        cancelText={t("confirmDelete.cancel")}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCoursesTab;
