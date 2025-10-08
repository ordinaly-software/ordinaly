"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Slider from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { IconSelect } from "@/components/ui/icon-select";
import { Plus, Edit, Star, FileText } from "lucide-react";
import { Service } from "@/hooks/useServices";
import { getApiEndpoint } from "@/lib/api-config";
import { servicesEvents } from "@/lib/events";
import Alert from "@/components/ui/alert";
import React, { useState, useEffect } from "react";
import { Dropdown } from "@/components/ui/dropdown";

interface AdminServiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit: boolean;
  initialService?: Service | null;
  refetch: () => void;
  COLOR_CHOICES: Array<{ value: string; label: string; color: string; darkModeColor?: string }>;
}

const defaultFormData = {
  type: "SERVICE",
  title: "",
  subtitle: "",
  description: "",
  icon: "",
  color: "29BF12",
  duration: "",
  price: "",
  requisites: "",
  is_featured: false,
  draft: false,
};

export const AdminServiceEditModal = ({
  isOpen,
  onClose,
  isEdit,
  initialService,
  refetch,
  COLOR_CHOICES,
}: AdminServiceEditModalProps) => {
  const t = useTranslations("admin.services");
  const [formData, setFormData] = useState(() => {
    if (isEdit && initialService) {
      return {
        type: initialService.type || "SERVICE",
        title: initialService.title,
        subtitle: initialService.subtitle || "",
        description: initialService.description,
        icon: initialService.icon,
        color: initialService.color || "29BF12",
        duration: initialService.duration?.toString() || "",
        price: initialService.price || "",
        requisites: initialService.requisites || "",
        is_featured: initialService.is_featured,
        draft: initialService.draft ?? false,
      };
    }
    return { ...defaultFormData };
  });
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  // Reset form when modal opens/closes or initialService changes
  useEffect(() => {
    if (isEdit && initialService) {
      setFormData({
        type: initialService.type || "SERVICE",
        title: initialService.title,
        subtitle: initialService.subtitle || "",
        description: initialService.description,
        icon: initialService.icon,
        color: initialService.color || "29BF12",
        duration: initialService.duration?.toString() || "",
        price: initialService.price || "",
        requisites: initialService.requisites || "",
        is_featured: initialService.is_featured,
        draft: initialService.draft ?? false,
      });
    } else {
      setFormData({ ...defaultFormData });
    }
  }, [isOpen, isEdit, initialService]);

  const submitService = async () => {
    try {
      if (!formData.title.trim()) {
        setAlert({ type: "error", message: t("messages.validation.titleRequired") });
        return;
      }
      if (!formData.subtitle.trim()) {
        setAlert({ type: "error", message: t("messages.validation.subtitleRequired") });
        return;
      }
      if (!formData.description.trim()) {
        setAlert({ type: "error", message: t("messages.validation.descriptionRequired") });
        return;
      }
      if (!formData.icon.trim()) {
        setAlert({ type: "error", message: t("messages.validation.iconRequired") });
        return;
      }
      if (formData.duration && parseInt(formData.duration) < 1) {
        setAlert({ type: "error", message: t("messages.validation.durationInvalid") });
        return;
      }
      if (formData.price && parseFloat(formData.price) < 0.01) {
        setAlert({ type: "error", message: t("messages.validation.priceInvalid") });
        return;
      }
      const token = localStorage.getItem("authToken");
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        draft: !!formData.draft,
        type: formData.type,
      };
      const url = isEdit && initialService
        ? getApiEndpoint(`/api/services/${initialService.id}/`)
        : getApiEndpoint("/api/services/");
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const responseData = await response.json();
        setAlert({
          type: "success",
          message: isEdit ? t("messages.updateSuccess") : t("messages.createSuccess"),
        });
        refetch();
        onClose();
        if (isEdit) {
          servicesEvents.emitUpdated(responseData);
        } else {
          servicesEvents.emitCreated(responseData);
        }
      } else {
        const errorData = await response.json();
        if (errorData.title) {
          setAlert({ type: "error", message: t("messages.validation.titleRequired") });
        } else if (errorData.subtitle) {
          setAlert({ type: "error", message: t("messages.validation.subtitleRequired") });
        } else if (errorData.description) {
          setAlert({ type: "error", message: t("messages.validation.descriptionRequired") });
        } else if (errorData.icon) {
          setAlert({ type: "error", message: t("messages.validation.iconRequired") });
        } else if (errorData.duration) {
          setAlert({ type: "error", message: t("messages.validation.durationInvalid") });
        } else if (errorData.price) {
          setAlert({ type: "error", message: t("messages.validation.priceInvalid") });
        } else {
          setAlert({ type: "error", message: errorData.detail || t(isEdit ? "messages.updateError" : "messages.createError") });
        }
      }
    } catch {
      setAlert({ type: "error", message: t("messages.networkError") });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t("editService") : t("createService")}
      showHeader={true}
      className="max-w-4xl w-full mx-4"
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={5000}
        />
      )}
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pb-40">
        {/* Toggles */}
        <div className="flex flex-wrap items-center w-full gap-x-8 gap-y-6 md:gap-x-12 md:gap-y-8">
          <div className="flex items-center px-4 py-3">
            <Label htmlFor="type" className="text-sm font-medium cursor-pointer text-purple-600 flex items-center gap-1 min-w-0 mr-2 md:mr-4">
              <span className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center text-purple-600">{formData.type === 'SERVICE' ? 'S' : 'P'}</span>
              {t("form.type")}
            </Label>
            <Dropdown
              options={[
          { value: 'SERVICE', label: t('form.service') },
          { value: 'PRODUCT', label: t('form.product') }
              ]}
              value={formData.type}
              onChange={(val: string) => setFormData(prev => ({ ...prev, type: val as 'SERVICE' | 'PRODUCT' }))}
              placeholder={t('form.type')}
              className="min-w-[120px] flex-shrink"
              theme="default"
            />
          </div>
          <div className="flex items-center px-4 py-3">
            <Label htmlFor="draft" className="text-sm font-medium cursor-pointer text-orange-600 flex items-center gap-1 min-w-0 mr-2 md:mr-4">
              <FileText className="w-4 h-4 text-orange-500" />
              {t("form.draftMode")}
            </Label>
            <Slider
              checked={!!formData.draft}
              onChange={() => setFormData(prev => ({ ...prev, draft: !prev.draft }))}
              className="flex-shrink"
              color="orange"
            />
          </div>
          <div className="flex items-center px-4 py-3">
            <Label htmlFor="is_featured" className="text-sm font-medium cursor-pointer text-green-600 flex items-center gap-1 min-w-0 mr-2 md:mr-4">
              <Star className="w-4 h-4 text-green-500 fill-green-500" />
              {t("form.featured")}
            </Label>
            <Slider
              checked={!!formData.is_featured}
              onChange={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
              className="flex-shrink"
            />
          </div>
        </div>
        {/* Service Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="title" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-[#22A60D]/10 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-[#22A60D]">S</span>
              </div>
              <span>{t("form.title")} *</span>
            </Label>
          </div>
          <Input
            id="title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={t("form.titlePlaceholder")}
            className="h-12 border-gray-300 focus:border-[#22A60D] focus:ring-[#22A60D]/20 rounded-lg transition-all duration-200"
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
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t("form.descriptionPlaceholder")}
            rows={10}
            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg transition-all duration-200 resize-none font-mono text-sm"
            required
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("form.markdownSupported")}
          </div>
        </div>
        {/* Icon and Price */}
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
              onChange={value => setFormData(prev => ({ ...prev, icon: value }))}
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
              onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder={t("form.pricePlaceholder") || "Leave empty for 'Contact for quote'"}
              className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 rounded-lg transition-all duration-200"
            />
          </div>
        </div>
        {/* Service Color and Requisites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-pink-100 dark:bg-pink-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">🎨</span>
              </div>
              <span>{t("form.color")}</span>
            </Label>
            <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-2">
              {COLOR_CHOICES.map(colorChoice => {
                const getColorClasses = () => {
                  if (colorChoice.value === "1A1924") {
                    return "bg-[#1A1924] dark:bg-[#efefef] text-white dark:text-black";
                  } else if (colorChoice.value === "623CEA") {
                    return "bg-[#623CEA] dark:bg-[#8B5FF7] text-white";
                  } else if (colorChoice.value === "46B1C9") {
                    return "bg-[#217093] dark:bg-[#5ECAE0] text-white";
                  } else if (colorChoice.value === "29BF12") {
                    return "bg-[#29BF12] dark:bg-[#3DD421] text-white";
                  } else {
                    return "text-white";
                  }
                };
                // Use inline style for dynamic color
                const isDynamicColor = !["1A1924", "623CEA", "46B1C9", "29BF12"].includes(colorChoice.value);
                return (
                  <button
                    key={colorChoice.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: colorChoice.value }))}
                    className={`relative w-20 h-12 rounded-md transition-all duration-200 flex items-center justify-center text-xs font-medium border-2 ${
                      formData.color === colorChoice.value
                        ? "border-gray-400 dark:border-gray-500 shadow-lg scale-105"
                        : "border-transparent hover:shadow-md hover:scale-102"
                    } ${getColorClasses()}`}
                    style={
                      isDynamicColor
                        ? { backgroundColor: colorChoice.color }
                        : undefined
                    }
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold leading-tight">{t(`form.colors.${colorChoice.label}`)}</div>
                    </div>
                    {formData.color === colorChoice.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">📋</span>
              </div>
              <span>{t("form.requisites")}</span>
            </Label>
            <Textarea
              id="requisites"
              value={formData.requisites}
              onChange={e => setFormData(prev => ({ ...prev, requisites: e.target.value }))}
              placeholder={t("form.requisitesPlaceholder")}
              rows={4}
              className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-lg transition-all duration-200 resize-none"
            />
          </div>
        </div>
        {/* Duration */}
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
            onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder={t("form.durationPlaceholder")}
            className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg transition-all duration-200"
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-end space-x-3 pt-6 pb-6 px-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1924]">
        <Button
          variant="ghost"
          onClick={onClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          {t("form.cancel")}
        </Button>
        <Button
          onClick={submitService}
          className="px-6 py-2 bg-[#22A60D] hover:bg-[#22A010] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <span>{isEdit ? t("form.update") : t("form.create")}</span>
          {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>
    </Modal>
  );
};

export default AdminServiceEditModal;
