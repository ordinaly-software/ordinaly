"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit, Upload, Plus } from "lucide-react";
import Slider from "@/components/ui/slider";
import Dropdown, { DropdownOption } from "../ui/dropdown";
import { ModalCloseButton } from "../ui/modal-close-button";
import Image from "next/image";
import type { Course } from "./admin-courses-tab";

export interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  price: string | number;
  max_attendants: string | number;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  periodicity: string;
  weekdays: number[];
  week_of_month: number | null;
  interval: number;
  timezone: string;
  exclude_dates: string[];
  draft?: boolean;
  enrolled_count?: number;
}

export interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  showEditModal: boolean;
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  resetForm: () => void;
}

// Custom image loader to handle potential URL issues
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src || src === 'undefined' || src === 'null') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMiA2LTItMiA0IDRoNCIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }
  return `${src}?w=${width}&q=${quality || 75}`;
};

const CourseEditModal: React.FC<CourseEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  showEditModal,
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  handleFileSelect,
  t,
}) => {

    // Timezone options
    const timezoneOptions: DropdownOption[] = [
      { value: 'Europe/Madrid', label: 'Europe/Madrid (CET)' },
      { value: 'Europe/London', label: 'Europe/London (GMT)' },
      { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
      { value: 'America/New_York', label: 'America/New_York (EST)' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
      { value: 'UTC', label: 'UTC' }
    ];
    // Week of month options
    const weekOfMonthOptions: DropdownOption[] = [
      { value: '', label: t("form.weekOfMonth.any") },
      { value: '1', label: t("form.weekOfMonth.first") },
      { value: '2', label: t("form.weekOfMonth.second") },
      { value: '3', label: t("form.weekOfMonth.third") },
      { value: '4', label: t("form.weekOfMonth.fourth") },
      { value: '-1', label: t("form.weekOfMonth.last") }
    ];
    // Periodicity options for recurrence pattern
    const periodicityOptions: DropdownOption[] = [
      { value: 'once', label: t("form.periodicity.once") },
      { value: 'daily', label: t("form.periodicity.daily") },
      { value: 'weekly', label: t("form.periodicity.weekly") },
      { value: 'biweekly', label: t("form.periodicity.biweekly") },
      { value: 'monthly', label: t("form.periodicity.monthly") }
    ];

    // Days of the week with internationalization
    const daysOfWeek = [
      { key: 'monday', short: t("form.weekdays.monday.short"), full: t("form.weekdays.monday.full") },
      { key: 'tuesday', short: t("form.weekdays.tuesday.short"), full: t("form.weekdays.tuesday.full") },
      { key: 'wednesday', short: t("form.weekdays.wednesday.short"), full: t("form.weekdays.wednesday.full") },
      { key: 'thursday', short: t("form.weekdays.thursday.short"), full: t("form.weekdays.thursday.full") },
      { key: 'friday', short: t("form.weekdays.friday.short"), full: t("form.weekdays.friday.full") },
      { key: 'saturday', short: t("form.weekdays.saturday.short"), full: t("form.weekdays.saturday.full") },
      { key: 'sunday', short: t("form.weekdays.sunday.short"), full: t("form.weekdays.sunday.full") }
    ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showEditModal ? t("editCourse") : t("createCourse")}
      showHeader={true}
      className="max-w-4xl w-full mx-4"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pb-40">
        {/* Course Title with Draft Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="title" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-[#22A60D]/10 rounded flex items-center justify-center">
                <FileText className="w-3 h-3 text-[#22A60D]" />
              </div>
              <span>{t("form.titleRequired")}</span>
            </Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="draft" className="text-sm font-medium cursor-pointer text-orange-600 flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-500" />
                {t("form.draftMode")}
              </Label>
              <Slider
                checked={!!formData.draft}
                onChange={() => setFormData(prev => ({ ...prev, draft: !prev.draft }))}
                className="mr-2"
                color="orange"
              />
            </div>
          </div>
          <Input
            id="title"
            value={formData.title ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={t("form.titlePlaceholder")}
            className="h-12 border-gray-300 focus:border-[#22A60D] focus:ring-[#22A60D]/20 rounded-lg transition-all duration-200"
            required
          />
          {!!formData.enrolled_count && formData.enrolled_count > 0 && (
            <span className="ml-2 text-xs text-red-500 font-semibold" title={t("form.draftDisabledWithEnrollments")}>{t("form.draftDisabledWithEnrollments")}</span>
          )}
        </div>

          
          {/* Course Subtitle */}
          <div className="space-y-3">
            <Label htmlFor="subtitle" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue">S</span>
              </div>
              <span>{t("form.subtitleOptional")}</span>
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle ?? ""}
              onChange={(e) => setFormData(prev => ({...prev, subtitle: e.target.value}))}
              placeholder={t("form.subtitlePlaceholder")}
              className="h-12 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
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
            rows={10}
            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg transition-all duration-200 resize-none font-mono text-sm"
            required
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("form.markdownSupported")}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label htmlFor="image" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
              <Upload className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
            <span>{!showEditModal ? t("form.imageRequired") : t("form.imageOptional")}</span>
          </Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-1 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/5 max-w-xs mx-auto">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">
                      {selectedFile.name}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image')?.click()}
                      className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200 text-xs px-2 py-1"
                    >
                      {t("form.chooseImageText")}
                    </Button>
                    <p className="text-[10px] text-gray-500 mt-1">{t("form.imageRecommendation")}</p>
                  </div>
                </div>
              )}
            </div>
            
            {previewUrl && previewUrl !== 'undefined' && previewUrl !== 'null' && (
              <div className="mt-3 relative w-48 h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mx-auto">
                <Image
                  loader={imageLoader}
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="128px"
                  onError={() => {
                    
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
              value={formData.price ?? ""}
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
              value={formData.max_attendants ?? ""}
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
              <span>{t("form.locationOptional")}</span>
            </Label>
            <Input
              id="location"
              value={formData.location ?? ""}
              onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
              placeholder={t("form.locationPlaceholder")}
              className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
            />
          </div>

          {/* Professional Scheduling Section */}
        <div className="space-y-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue rounded flex items-center justify-center">
              <span className="text-sm font-bold text-white">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("form.scheduleSettings")}
            </h3>
          </div>
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.startDateRequired")}
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date ?? ""}
                onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.endDateRequired")}
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date ?? ""}
                onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
          </div>
          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.startTimeRequired")}
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time ?? ""}
                onChange={(e) => setFormData(prev => ({...prev, start_time: e.target.value}))}
                className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.endTimeRequired")}
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time ?? ""}
                onChange={(e) => setFormData(prev => ({...prev, end_time: e.target.value}))}
                className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                required
              />
            </div>
          </div>
          {/* Periodicity */}
          <div className="space-y-2">
            <Label htmlFor="periodicity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("form.periodicityRequired")}
            </Label>
            <Dropdown
              options={periodicityOptions}
              value={formData.periodicity ?? ""}
              onChange={(value) => setFormData(prev => ({...prev, periodicity: value as Course['periodicity']}))}
              minWidth="100%"
              theme="orange"
              placeholder={t("form.periodicity.once")}
            />
          </div>
          {/* Weekdays Selection (for weekly/biweekly patterns) */}
          {(formData.periodicity === 'weekly' || formData.periodicity === 'biweekly') && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.weekdaysOptional")}
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day, idx) => (
                  <label key={day.key} className="flex flex-col items-center space-y-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.weekdays ?? []).includes(idx)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({...prev, weekdays: [...(prev.weekdays ?? []), idx]}));
                        } else {
                          setFormData(prev => ({...prev, weekdays: (prev.weekdays ?? []).filter((d: number) => d !== idx)}));
                        }
                      }}
                      className="rounded border-gray-300 text-blue focus:ring-blue/20"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400" title={day.full}>
                      {day.short}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Monthly Pattern Settings */}
          {formData.periodicity === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="week_of_month" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.weekOfMonthOptional")}
              </Label>
              <Dropdown
                options={weekOfMonthOptions}
                value={formData.week_of_month?.toString() || ''}
                onChange={(value) => setFormData(prev => ({...prev, week_of_month: value ? parseInt(value) : null}))}
                placeholder={t("form.weekOfMonth.any")}
                theme="orange"
                width="100%"
              />
            </div>
          )}
          {/* Custom Interval */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.intervalOptional")}
              </Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="52"
                value={formData.periodicity === 'once' ? 1 : formData.interval ?? ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setFormData(prev => ({
                    ...prev,
                    interval: prev.periodicity === 'once' ? 1 : val
                  }));
                }}
                placeholder={t("form.intervalPlaceholder")}
                className="h-11 border-gray-300 focus:border-blue focus:ring-blue/20 rounded-lg transition-all duration-200"
                disabled={formData.periodicity === 'once'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form.timezoneOptional")}
              </Label>
              <Dropdown
                options={timezoneOptions}
                value={formData.timezone ?? ""}
                onChange={(value) => setFormData(prev => ({...prev, timezone: value}))}
                theme="orange"
                width="100%"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons (bottom bar) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-end space-x-3 pt-6 pb-6 px-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1924]">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            {t("form.cancel")}
          </Button>
          <Button
            onClick={onSubmit}
            className="px-6 py-2 bg-[#22A60D] hover:bg-[#22A010] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <span>{showEditModal ? t("form.update") : t("form.create")}</span>
            {showEditModal ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CourseEditModal;
