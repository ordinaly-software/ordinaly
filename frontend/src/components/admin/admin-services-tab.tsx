"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminServiceCard } from "@/components/admin/admin-service-card";
import Alert from "@/components/ui/alert";
import { getApiEndpoint } from "@/lib/api-config";
import { 
  Plus, 
  Trash2, 
  Search,
  ArrowUpDown,
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { ServiceAppleDetailsModal } from "@/components/services/service-apple-details-modal";
import AdminServiceEditModal from "@/components/admin/admin-service-edit-modal";
import { servicesEvents } from "@/lib/events";
import { Service, useServices } from "@/hooks/useServices";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { PaginationControls } from "@/components/ui/pagination-controls";

type SortOption = 'title' | 'created_at' | 'updated_at' | 'price' | 'duration' | 'type' | 'featured';
type SortOrder = 'asc' | 'desc';

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
  const { services, isLoading, refetch } = useServices(undefined, true);

  // Color choices matching backend
  const COLOR_CHOICES = [
    { value: '1A1924', label: 'darkPurple', color: '#1A1924', darkModeColor: '#efefefbb' },
    { value: '623CEA', label: 'purple', color: '#623CEA', darkModeColor: '#8B5FF7' },
  { value: '217093', label: 'cyan', color: '#217093', darkModeColor: '#5ECAE0' },
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
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortOptions: DropdownOption[] = [
    { value: 'created_at', label: t("sorting.created") },
    { value: 'updated_at', label: t("sorting.updated") },
    { value: 'title', label: t("sorting.title") },
    { value: 'featured', label: t("sorting.featured") },
    { value: 'type', label: t("sorting.type") },
    { value: 'duration', label: t("sorting.duration") },
    { value: 'price', label: t("sorting.price") },
  ];

  const sortServices = (items: Service[]) => {
    const compare = (a: Service, b: Service) => {
      let aValue: string | number | Date | boolean;
      let bValue: string | number | Date | boolean;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case 'duration':
          aValue = a.duration ?? -1;
          bValue = b.duration ?? -1;
          break;
        case 'price':
          aValue = a.price == null || a.price === "" ? -1 : Number(a.price);
          bValue = b.price == null || b.price === "" ? -1 : Number(b.price);
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'featured':
          aValue = a.is_featured;
          bValue = b.is_featured;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    };

    const sorted = [...items].sort(compare);

    // Keep featured services grouped first (like courses separating finished courses),
    // unless the user is explicitly sorting by "featured".
    if (sortBy === 'featured') return sorted;
    const featured = sorted.filter(s => s.is_featured);
    const notFeatured = sorted.filter(s => !s.is_featured);
    return [...featured, ...notFeatured];
  };


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

  const handleDuplicate = async (service: Service) => {
    try {
      const token = localStorage.getItem('authToken');
      const identifier = service.slug ?? service.id;
      const response = await fetch(getApiEndpoint(`/api/services/${identifier}/duplicate/`), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) {
        setAlert({ type: 'error', message: t('messages.duplicateError') });
        return;
      }
      const data = await response.json();
      servicesEvents.emitCreated(data);
      setAlert({ type: 'success', message: t('messages.duplicateSuccess') });
      refetch();
    } catch {
      setAlert({ type: 'error', message: t('messages.networkError') });
    }
  };

  const toggleServiceSelection = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id)
        ? prev.filter(serviceId => serviceId !== id)
        : [...prev, id]
    );
  };

  const filteredServices = sortServices(
    (services || []).filter(service =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.subtitle && service.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const toggleSelectAll = () => {
    const visibleIds = paginatedServices.map((service) => service.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedServices.includes(id));

    if (allVisibleSelected) {
      setSelectedServices((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedServices((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F8A0D] dark:border-[#3FBD6F]"></div>
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
        <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 w-full md:w-auto min-w-0">
          <div className="relative w-full sm:w-64 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full min-w-0"
            />
          </div>

          {/* Sort Controls (like courses) */}
          <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-2 w-full md:w-auto min-w-0">
            <Label className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t("sorting.sortBy")}:
            </Label>
            <Dropdown
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              minWidth="240px"
              width="240px"
              theme="orange"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
              aria-label={t("sorting.toggleOrder")}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
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
            className="bg-[#0d6e0c] dark:bg-[#3FBD6F] hover:bg-[#0A4D08] text-white dark:text-black flex items-center gap-1 whitespace-nowrap px-2 sm:px-3 min-w-[140px] justify-center"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">{t("addService")}</span>
          </Button>
        </div>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm ? t('noServicesFound') : t('noServices')}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              checked={paginatedServices.length > 0 && paginatedServices.every((s) => selectedServices.includes(s.id))}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-[#1F8A0D] dark:text-[#3FBD6F] focus:ring-[#1F8A0D]"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("selectAll")} ({filteredServices.length} {t("services")})
            </span>
          </div>

          {paginatedServices.map((service) => (
            <AdminServiceCard
              key={service.id}
              service={service}
              isSelected={selectedServices.includes(service.id)}
              onSelect={toggleServiceSelection}
              onView={handleServiceClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              tAdmin={tAdmin}
              t={t}
              getServiceColor={getServiceColor}
            />
          ))}

          <PaginationControls
            totalItems={filteredServices.length}
            currentPage={safeCurrentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            className="pt-2"
          />
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
      <ServiceAppleDetailsModal
        service={selectedServiceForModal}
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedServiceForModal(null);
        }}
      />
    </div>
  );
};

export default AdminServicesTab;
