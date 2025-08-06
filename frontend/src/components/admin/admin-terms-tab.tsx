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
import { getApiEndpoint } from "@/lib/api-config";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Upload,
  FileText,
  Download,
  ChevronDown
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Dropdown } from "@/components/ui/dropdown";

interface Term {
  id: number;
  name: string;
  content: string;
  pdf_content: string | null;
  version: string;
  tag: string;
  created_at: string;
  updated_at: string;
}

const AdminTermsTab = () => {
  const t = useTranslations("admin.terms");
  const tAdmin = useTranslations("admin");

  // Helper function to get translated tag label
  const getTagLabel = (tagValue: string) => {
    // Provide a fallback if the translation key does not exist
    return t(`form.tagTypes.${tagValue}`, { default: tagValue || tAdmin("unknownTag") });
  };
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerms, setSelectedTerms] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availableTags, setAvailableTags] = useState<{value: string, label: string}[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    content: "",
    version: "",
    tag: ""
  });

  useEffect(() => {
    fetchTerms();
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/terms/available_tags/'), {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.available_tags || []);
      } else {
        console.log('No available tags');
      }
    } catch (error) {
      console.error('Error fetching available tags:', error);
    }
  };

  const fetchTerms = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiEndpoint('/api/terms/'), {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setTerms(Array.isArray(data) ? data : []);
      } else {
        setAlert({type: 'error', message: 'Failed to fetch terms'});
        setTerms([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setAlert({type: 'error', message: 'Network error while fetching terms'});
      setTerms([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      content: "",
      version: "",
      tag: ""
    });
    setSelectedFile(null);
    fetchAvailableTags(); // Refresh available tags
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (term: Term) => {
    setCurrentTerm(term);
    setFormData({
      name: term.name,
      content: term.content,
      version: term.version,
      tag: term.tag
    });
    setShowEditModal(true);
  };

  const handleDelete = (term: Term) => {
    setCurrentTerm(term);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedTerms.length === 0) {
      setAlert({type: 'warning', message: 'Please select terms to delete'});
      return;
    }
    setShowDeleteModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setAlert({type: 'error', message: t('messages.fileSizeLimit')});
        return;
      }
      
      if (file.type !== 'application/pdf') {
        setAlert({type: 'error', message: t('messages.pdfFileOnly')});
        return;
      }

      setSelectedFile(file);
    }
  };

  const submitTerm = async (isEdit: boolean) => {
    try {
      // Basic validation
      if (!formData.name.trim()) {
        setAlert({type: 'error', message: t('messages.validation.nameRequired')});
        return;
      }
      if (!formData.content.trim()) {
        setAlert({type: 'error', message: t('messages.validation.contentRequired')});
        return;
      }
      if (!formData.version.trim()) {
        setAlert({type: 'error', message: t('messages.validation.versionRequired')});
        return;
      }

      const token = localStorage.getItem('authToken');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('version', formData.version);
      formDataToSend.append('tag', formData.tag);
      
      if (selectedFile) {
        formDataToSend.append('pdf_content', selectedFile);
      }

      const url = isEdit 
        ? getApiEndpoint(`/api/terms/${currentTerm?.id}/`)
        : getApiEndpoint('/api/terms/');
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const termName = formData.name;
        const successMessage = isEdit 
          ? t('messages.updateSuccess', { name: termName })
          : t('messages.createSuccess', { name: termName });
        
        setAlert({type: 'success', message: successMessage});
        
        if (isEdit) {
          setAlert({type: 'info', message: t('messages.version.updateWarning')});
        }
        
        fetchTerms();
        fetchAvailableTags(); // Refresh available tags
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        
        // Handle specific validation errors
        if (errorData.tag && errorData.tag.includes('already exists')) {
          setAlert({type: 'error', message: t('messages.validation.tagDuplicate')});
        } else if (errorData.content && errorData.content.includes('extension')) {
          setAlert({type: 'error', message: t('messages.validation.fileExtension')});
        } else if (errorData.non_field_errors && errorData.non_field_errors.includes('provided')) {
          setAlert({type: 'error', message: t('messages.validation.fileMissing')});
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

      if (selectedTerms.length > 0) {
        // Bulk delete
        const deletePromises = selectedTerms.map(id =>
          fetch(getApiEndpoint(`/api/terms/${id}/`), {
            method: 'DELETE',
            headers: {
              'Authorization': `Token ${token}`,
            },
          })
        );

        const results = await Promise.all(deletePromises);
        const failedCount = results.filter(r => !r.ok).length;
        
        if (failedCount === 0) {
          setAlert({type: 'success', message: `${selectedTerms.length} ${t('messages.bulkDeleteSuccess')}`});
        } else {
          setAlert({type: 'warning', message: `${selectedTerms.length - failedCount} ${t('messages.bulkDeleteSuccess')}, ${failedCount} failed`});
        }
        
        setSelectedTerms([]);
      } else if (currentTerm) {
        // Single delete
        const response = await fetch(getApiEndpoint(`/api/terms/${currentTerm.id}/`), {
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

      fetchTerms();
      fetchAvailableTags(); // Refresh available tags
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete error:', error);
      setAlert({type: 'error', message: t('messages.networkError')});
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadPDF = async (term: Term) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(getApiEndpoint(`/api/terms/${term.id}/download/`), {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${term.name}_v${term.version}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setAlert({type: 'error', message: t('messages.downloadError')});
      }
    } catch (error) {
      console.error('Download error:', error);
      setAlert({type: 'error', message: t('messages.networkError')});
    }
  };

  const toggleTermSelection = (id: number) => {
    setSelectedTerms(prev =>
      prev.includes(id)
        ? prev.filter(termId => termId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filteredTerms = (terms || []).filter(term =>
      term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedTerms.length === filteredTerms.length) {
      setSelectedTerms([]);
    } else {
      setSelectedTerms(filteredTerms.map(term => term.id));
    }
  };

  const filteredTerms = (terms || []).filter(term =>
    term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.tag.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedTerms.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected ({selectedTerms.length})</span>
            </Button>
          )}
          <Button
            onClick={handleCreate}
            disabled={availableTags.length === 0}
            className="bg-[#22A60D] hover:bg-[#22A010] text-white flex items-center space-x-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={availableTags.length === 0 ? t("form.allTagsUsedTitle") : ""}
          >
            <Plus className="h-4 w-4" />
            <span>{availableTags.length === 0 ? t("form.allTagsUsedButton") : "Add Term"}</span>
          </Button>
        </div>
      </div>

      {/* Terms List */}
      {filteredTerms.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No terms found matching your search.' : 'No terms available.'}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              checked={selectedTerms.length === filteredTerms.length && filteredTerms.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Select All ({filteredTerms.length} terms)
            </span>
          </div>

          {filteredTerms.map((term) => (
            <Card key={term.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedTerms.includes(term.id)}
                    onChange={() => toggleTermSelection(term.id)}
                    className="mt-1 rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
                  />
                  
                  {/* Term Icon */}
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {term.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            v{term.version}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {getTagLabel(term.tag)}
                          </span>
                          {term.pdf_content && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              PDF Available
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {term.content.length > 200 ? `${term.content.substring(0, 200)}...` : term.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{tAdmin("labels.created")}: {new Date(term.created_at).toLocaleDateString()}</span>
                          <span>{tAdmin("labels.updated")}: {new Date(term.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {term.pdf_content && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPDF(term)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(term)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(term)}
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

      {/* Create/Edit Term Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        title={showEditModal ? t("editTerm") : t("createTerm")}
        showHeader={true}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Term Name */}
          <div className="space-y-3">
            <Label htmlFor="name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-[#22A60D]/10 rounded flex items-center justify-center">
                <FileText className="w-3 h-3 text-[#22A60D]" />
              </div>
              <span>{t("form.name")} *</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              placeholder={t("form.namePlaceholder")}
              className="h-12 border-gray-300 focus:border-[#22A60D] focus:ring-[#22A60D]/20 rounded-lg transition-all duration-200"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <Label htmlFor="content" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <Edit className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>{t("form.content")} *</span>
            </Label>
            <div className="relative">
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({...prev, content: e.target.value}))}
                placeholder={t("form.contentPlaceholder")}
                rows={8}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200 resize-none"
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                Markdown supported
              </div>
            </div>
          </div>

          {/* Version and Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="version" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">V</span>
                </div>
                <span>{t("form.version")} *</span>
              </Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({...prev, version: e.target.value}))}
                placeholder={t("form.versionPlaceholder")}
                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="tag" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">#</span>
                </div>
                <span>{t("form.tag")} *</span>
              </Label>
              {showEditModal && currentTerm ? (
                // Show current tag when editing (read-only)
                <div className="h-12 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {getTagLabel(currentTerm.tag)}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Cannot be changed)</span>
                </div>
              ) : (
                // Modern custom dropdown when creating new
                <Dropdown
                  options={availableTags}
                  value={formData.tag || ''}
                  onChange={(value) => setFormData(prev => ({...prev, tag: value}))}
                  placeholder={availableTags.length === 0 ? t("form.noAvailableTags") : t("form.selectTag")}
                  disabled={availableTags.length === 0}
                  theme="orange"
                  width="100%"
                  renderTrigger={({ isOpen, selectedOption, onClick, disabled }) => (
                    <button
                      type="button"
                      onClick={onClick}
                      disabled={disabled}
                      className="h-12 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-left flex items-center justify-between focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed hover:border-orange-400"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {selectedOption?.label || (availableTags.length === 0 ? t("form.noAvailableTags") : t("form.selectTag"))}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                />
              )}
              {availableTags.length === 0 && !showEditModal && (
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">!</span>
                  </div>
                  <span>{t("form.allTagsUsed")}</span>
                </p>
              )}
            </div>
          </div>

          {/* PDF Upload */}
          <div className="space-y-3">
            <Label htmlFor="pdf" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                <Upload className="w-3 h-3 text-red-600 dark:text-red-400" />
              </div>
              <span>{t("form.pdfVersion")}</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-all duration-200 hover:border-[#22A60D] hover:bg-[#22A60D]/5">
              <input
                type="file"
                id="pdf"
                accept=".pdf"
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
                      <ModalCloseButton
                        onClick={() => setSelectedFile(null)}
                        variant="light"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      />
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
                        onClick={() => document.getElementById('pdf')?.click()}
                        className="border-[#22A60D] text-[#22A60D] hover:bg-[#22A60D] hover:text-white transition-all duration-200"
                      >
                        {t("form.choosePdf")}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
                    </div>
                  </div>
                )}
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
              onClick={() => submitTerm(showEditModal)}
              className="px-6 py-2 bg-[#22A60D] hover:bg-[#22A010] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
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
          selectedTerms.length > 0
            ? t("confirmDelete.multiple", { count: selectedTerms.length })
            : t("confirmDelete.single", { name: currentTerm?.name ?? "" })
        }
        confirmText={t("confirmDelete.delete")}
        cancelText={t("confirmDelete.cancel")}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminTermsTab;
