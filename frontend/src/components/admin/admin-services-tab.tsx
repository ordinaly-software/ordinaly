"use client";

import { useState, useEffect } from "react";
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
  Star,
} from "lucide-react";
import { IconSelect, renderIcon } from "@/components/ui/icon-select";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { servicesEvents } from "@/lib/events";

interface Service {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  duration?: number;
  price?: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const AdminServicesTab = () => {
  const t = useTranslations("admin.services");
  const tAdmin = useTranslations("admin");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    icon: "",
    duration: "",
    price: "",
    is_featured: false
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/services/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } else {
        setAlert({type: 'error', message: 'Failed to fetch services'});
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setAlert({type: 'error', message: 'Network error while fetching services'});
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      icon: "",
      duration: "",
      price: "",
      is_featured: false
    });
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setFormData({
      title: service.title,
      subtitle: service.subtitle || "",
      description: service.description,
      icon: service.icon,
      duration: service.duration?.toString() || "",
      price: service.price || "",
      is_featured: service.is_featured
    });
    setShowEditModal(true);
  };

  const handleDelete = (service: Service) => {
    setCurrentService(service);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedServices.length === 0) {
      setAlert({type: 'warning', message: t('messages.selectToDelete')});
      return;
    }
    setShowDeleteModal(true);
  };

  const submitService = async (isEdit: boolean) => {
    try {
      // Basic validation
      if (!formData.title.trim()) {
        setAlert({type: 'error', message: t('messages.validation.titleRequired')});
        return;
      }
      if (!formData.subtitle.trim()) {
        setAlert({type: 'error', message: t('messages.validation.subtitleRequired')});
        return;
      }
      if (!formData.description.trim()) {
        setAlert({type: 'error', message: t('messages.validation.descriptionRequired')});
        return;
      }
      if (!formData.icon.trim()) {
        setAlert({type: 'error', message: t('messages.validation.iconRequired')});
        return;
      }
      if (formData.duration && parseInt(formData.duration) < 1) {
        setAlert({type: 'error', message: t('messages.validation.durationInvalid')});
        return;
      }
      if (formData.price && parseFloat(formData.price) < 0.01) {
        setAlert({type: 'error', message: t('messages.validation.priceInvalid')});
        return;
      }

      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        price: formData.price ? parseFloat(formData.price) : null
      };

      const url = isEdit 
        ? `${apiUrl}/api/services/${currentService?.id}/`
        : `${apiUrl}/api/services/`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        const serviceTitle = formData.title;
        const successMessage = isEdit 
          ? t('messages.updateSuccess', { title: serviceTitle })
          : t('messages.createSuccess', { title: serviceTitle });
        
        setAlert({type: 'success', message: successMessage});
        
        // Show featured status change if applicable
        if (isEdit && currentService && formData.is_featured !== currentService.is_featured) {
          const featuredMessage = formData.is_featured
            ? t('messages.featured.enabled', { title: serviceTitle })
            : t('messages.featured.disabled', { title: serviceTitle });
          
          setTimeout(() => {
            setAlert({type: 'info', message: featuredMessage});
          }, 2000);
        }
        
        fetchServices();
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
        
        // Emit event to notify other components
        if (isEdit) {
          servicesEvents.emitUpdated(responseData);
        } else {
          servicesEvents.emitCreated(responseData);
        }
      } else {
        const errorData = await response.json();
        
        // Handle specific validation errors
        if (errorData.title) {
          setAlert({type: 'error', message: t('messages.validation.titleRequired')});
        } else if (errorData.subtitle) {
          setAlert({type: 'error', message: t('messages.validation.subtitleRequired')});
        } else if (errorData.description) {
          setAlert({type: 'error', message: t('messages.validation.descriptionRequired')});
        } else if (errorData.icon) {
          setAlert({type: 'error', message: t('messages.validation.iconRequired')});
        } else if (errorData.duration) {
          setAlert({type: 'error', message: t('messages.validation.durationInvalid')});
        } else if (errorData.price) {
          setAlert({type: 'error', message: t('messages.validation.priceInvalid')});
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

      if (selectedServices.length > 0) {
        // Bulk delete
        const deletePromises = selectedServices.map(id =>
          fetch(`${apiUrl}/api/services/${id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Token ${token}`,
            },
          })
        );

        const results = await Promise.all(deletePromises);
        const failedCount = results.filter(r => !r.ok).length;
        
        if (failedCount === 0) {
          setAlert({type: 'success', message: `${selectedServices.length} ${t('messages.bulkDeleteSuccess')}`});
          // Emit delete events for each deleted service
          selectedServices.forEach(id => servicesEvents.emitDeleted(id));
        } else {
          setAlert({type: 'warning', message: `${selectedServices.length - failedCount} ${t('messages.bulkDeleteSuccess')}, ${failedCount} failed`});
          // Emit delete events for successful deletions only
          const successfulDeletions = selectedServices.filter((_, index) => results[index].ok);
          successfulDeletions.forEach(id => servicesEvents.emitDeleted(id));
        }
        
        setSelectedServices([]);
      } else if (currentService) {
        // Single delete
        const response = await fetch(`${apiUrl}/api/services/${currentService.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          setAlert({type: 'success', message: t('messages.deleteSuccess')});
          // Emit delete event
          servicesEvents.emitDeleted(currentService.id);
        } else {
          setAlert({type: 'error', message: t('messages.deleteError')});
        }
      }

      fetchServices();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete error:', error);
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleServiceSelection = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id)
        ? prev.filter(serviceId => serviceId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filteredServices = (services || []).filter(service =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.subtitle && service.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(service => service.id));
    }
  };

  const filteredServices = (services || []).filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.subtitle && service.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
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
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedServices.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected ({selectedServices.length})</span>
            </Button>
          )}
          <Button
            onClick={handleCreate}
            className="bg-[#29BF12] hover:bg-[#22A010] text-white flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Service</span>
          </Button>
        </div>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No services found matching your search.' : 'No services available.'}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-[#29BF12] focus:ring-[#29BF12]"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Select All ({filteredServices.length} services)
            </span>
          </div>

          {filteredServices.map((service) => (
            <Card key={service.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleServiceSelection(service.id)}
                    className="mt-1 rounded border-gray-300 text-[#29BF12] focus:ring-[#29BF12]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {service.icon && (
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              {renderIcon(service.icon, "w-4 h-4 text-gray-600 dark:text-gray-400")}
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {service.title}
                          </h3>
                          {service.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {service.subtitle}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{tAdmin("labels.price")}: {service.price ? `€${service.price}` : t("form.contactForQuote") || 'Contact for quote'}</span>
                          {service.duration && <span>{tAdmin("labels.duration")}: {service.duration} {service.duration === 1 ? t("home.services.durationDay") : t("home.services.durationDays", { count: service.duration })}</span>}
                          <span>{tAdmin("labels.icon")}: {service.icon}</span>
                          <span>{tAdmin("labels.created")}: {new Date(service.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service)}
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

      {/* Create/Edit Service Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        title={showEditModal ? t("editService") : t("createService")}
        showHeader={true}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Service Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-[#29BF12]/10 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-[#29BF12]">S</span>
              </div>
              <span>{t("form.title")} *</span>
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
          
          {/* Service Subtitle */}
          <div className="space-y-3">
            <Label htmlFor="subtitle" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">S</span>
              </div>
              <span>{t("form.subtitle")} *</span>
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({...prev, subtitle: e.target.value}))}
              placeholder={t("form.subtitlePlaceholder")}
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
              required
            />
          </div>

          {/* Service Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                <Edit className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span>{t("form.description")} *</span>
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

          {/* Icon and Featured Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="icon" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">🎨</span>
                </div>
                <span>{t("form.icon")} *</span>
              </Label>
              <IconSelect
                value={formData.icon}
                onChange={(value) => setFormData(prev => ({...prev, icon: value}))}
                placeholder={t("form.iconPlaceholder")}
                className="h-12"
              />
            </div>

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
                placeholder={t("form.pricePlaceholder") || "Leave empty for 'Contact for quote'"}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 rounded-lg transition-all duration-200"
              />
            </div>
          </div>

          {/* Duration and Featured Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="duration" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">⏱️</span>
                </div>
                <span>{t("form.duration")}</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                placeholder={t("form.durationPlaceholder")}
                className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">⭐</span>
                </div>
                <span>Featured Status</span>
              </Label>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({...prev, is_featured: e.target.checked}))}
                  className="w-5 h-5 rounded border-gray-300 text-[#29BF12] focus:ring-[#29BF12] transition-colors"
                />
                <Label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
                  {t("form.featured")}
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6 -mb-6 pb-6 bg-gray-50 dark:bg-gray-800/50">
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
              onClick={() => submitService(showEditModal)}
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
          selectedServices.length > 0
            ? t("confirmDelete.multiple", { count: selectedServices.length })
            : t("confirmDelete.single", { title: currentService?.title ?? "" })
        }
        confirmText={t("confirmDelete.delete")}
        cancelText={t("confirmDelete.cancel")}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminServicesTab;
