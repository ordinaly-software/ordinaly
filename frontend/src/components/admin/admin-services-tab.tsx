"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminServiceCard } from "@/components/admin/admin-service-card";
import Alert from "@/components/ui/alert";
import { getApiEndpoint } from "@/lib/api-config";
import { 
  Plus, 
  Trash2, 
  Search,
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { ServiceDetailsModal } from "@/components/services/service-details-modal";
import AdminServiceEditModal from "@/components/admin/admin-service-edit-modal";
import { servicesEvents } from "@/lib/events";
import { Service, useServices } from "@/hooks/useServices";

const AdminServicesTab = () => {
  // Confirm delete logic must be inside the component to access state
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (selectedServices.length > 0) {
        // Bulk delete
        const deletePromises = selectedServices.map(id =>
          fetch(getApiEndpoint(`/api/services/${id}/`), {
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
          selectedServices.forEach(id => servicesEvents.emitDeleted(id));
        } else {
          setAlert({type: 'warning', message: `${selectedServices.length - failedCount} ${t('messages.bulkDeleteSuccess')}, ${failedCount} failed`});
          const successfulDeletions = selectedServices.filter((_, index) => results[index].ok);
          successfulDeletions.forEach(id => servicesEvents.emitDeleted(id));
        }
        setSelectedServices([]);
      } else if (currentService) {
        // Single delete
        const response = await fetch(getApiEndpoint(`/api/services/${currentService.id}/`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        if (response.ok) {
          setAlert({type: 'success', message: t('messages.deleteSuccess')});
          servicesEvents.emitDeleted(currentService.id);
        } else {
          setAlert({type: 'error', message: t('messages.deleteError')});
        }
      }
      refetch();
      setShowDeleteModal(false);
    } catch {
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsDeleting(false);
    }
  };
  const t = useTranslations("admin.services");
  const tAdmin = useTranslations("admin");
  const { services, isLoading, refetch } = useServices();

  // Color choices matching backend
  const COLOR_CHOICES = [
    { value: '1A1924', label: 'darkPurple', color: '#1A1924', darkModeColor: '#efefefbb' },
    { value: '623CEA', label: 'purple', color: '#623CEA', darkModeColor: '#8B5FF7' },
    { value: '46B1C9', label: 'cyan', color: '#46B1C9', darkModeColor: '#5ECAE0' },
    { value: '29BF12', label: 'green', color: '#29BF12', darkModeColor: '#3DD421' },
    { value: 'E4572E', label: 'orange', color: '#E4572E' },
  ];

  const getServiceColor = (service: Service, isDarkMode: boolean = false) => {
    const colorChoice = COLOR_CHOICES.find(choice => choice.value === service.color);
    if (!colorChoice) return service.color_hex;
    
    if (isDarkMode && colorChoice.darkModeColor) {
      return colorChoice.darkModeColor;
    }
    return colorChoice.color;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleCreate = () => {
    setCurrentService(null);
    setShowCreateModal(true);
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
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

  const handleServiceClick = (service: Service) => {
    setSelectedServiceForModal(service);
    setShowServiceModal(true);
  };

  const handleContact = () => {
    // Simple WhatsApp contact functionality
    const message = selectedServiceForModal 
      ? `Hola, estoy interesado en el servicio "${selectedServiceForModal.title}". ¿Podrían proporcionarme más información?`
      : "Hola, me gustaría obtener más información sobre sus servicios.";
    const whatsappUrl = `https://wa.me/34123456789?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22A60D]"></div>
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
          <div className="relative w-full sm:w-64 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full min-w-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedServices.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-1 whitespace-nowrap px-2 sm:px-3 min-w-[140px] justify-center"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden xs:inline">{t("deleteSelected")} ({selectedServices.length})</span>
            </Button>
          )}
          <Button
            onClick={handleCreate}
            size="sm"
            className="bg-[#22A60D] hover:bg-[#22A010] text-white flex items-center gap-1 whitespace-nowrap px-2 sm:px-3 min-w-[140px] justify-center"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">{t("addService")}</span>
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
              className="rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("selectAll")} ({filteredServices.length} {t("services")})
            </span>
          </div>

          {filteredServices.map((service) => (
            <AdminServiceCard
              key={service.id}
              service={service}
              isSelected={selectedServices.includes(service.id)}
              onSelect={toggleServiceSelection}
              onView={handleServiceClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              tAdmin={tAdmin}
              t={t}
              getServiceColor={getServiceColor}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Service Modal (generalized) */}
      <AdminServiceEditModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
        isEdit={showEditModal}
        initialService={showEditModal ? currentService : null}
        refetch={refetch}
        COLOR_CHOICES={COLOR_CHOICES}
      />

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

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={selectedServiceForModal}
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedServiceForModal(null);
        }}
        onContact={handleContact}
      />
    </div>
  );
};

export default AdminServicesTab;
