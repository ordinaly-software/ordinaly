"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Alert from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { getApiEndpoint } from "@/lib/api-config";
import { Plus, Edit, Trash2, Search, Eye, Download } from "lucide-react";
import Dropdown from "@/components/ui/dropdown";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Term {
  id: number;
  name: string;
  tag: "terms" | "cookies" | "privacy" | "license";
  version: string;
  content: string;       // URL to .md
  pdf_content?: string;  // URL to .pdf
  created_at: string;
  updated_at: string;
}


const TAG_CHOICES = [
  { value: "terms", labelKey: "form.tagTypes.terms" },
  { value: "cookies", labelKey: "form.tagTypes.cookies" },
  { value: "privacy", labelKey: "form.tagTypes.privacy" },
  { value: "license", labelKey: "form.tagTypes.license" },
];

const AdminTermsTab = () => {
  const t = useTranslations("admin.terms");

  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error" | "warning" | "info"; message: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerms, setSelectedTerms] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);

    // For allowed tags
  const [availableTags, setAvailableTags] = useState<{ value: string; label: string }[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  async function fetchAvailableTags(token?: string): Promise<{ value: string; label: string }[]> {
    const res = await fetch(getApiEndpoint("/api/terms/available_tags/"), {
      headers: token ? { Authorization: `Token ${token}` } : {},
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.available_tags || [];
  }

  // Fetch allowed tags for dropdown
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const tags = await fetchAvailableTags(token || undefined);
      setAvailableTags(tags);
    } catch {
      setAvailableTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) fetchTags();
  }, [showModal]);


  // Modal form + preview
  const [formData, setFormData] = useState<{
    name: string;
    tag: Term["tag"];
    version: string;
    content: File | null;
    pdf_content: File | null;
  }>({
    name: "",
    tag: "terms",
    version: "",
    content: null,
    pdf_content: null,
  });

  const [previewMd, setPreviewMd] = useState<string>(""); // live markdown preview text
  const [activeTab, setActiveTab] = useState<"form" | "preview" | "pdf">("form");

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (showModal) fetchTags();
  }, [showModal]);

  const fetchTerms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(getApiEndpoint("/api/terms/"), {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch terms");
      const data = await res.json();
      setTerms(data);
    } catch {
      setAlert({ type: "error", message: t("messages.loadError") });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({ name: "", tag: "terms", version: "", content: null, pdf_content: null });
    setPreviewMd("");
    setActiveTab("form");
  };

  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
    setCurrentTerm(null);
    setActiveTab("form");
    setShowModal(true);
  };

  const loadExistingMarkdownToPreview = async (url: string | undefined) => {
    if (!url) {
      setPreviewMd("");
      return;
    }
    try {
      const res = await fetch(url, { headers: token ? { Authorization: `Token ${token}` } : {} });
      if (!res.ok) throw new Error();
      const text = await res.text();
      setPreviewMd(text);
    } catch {
      // As a fallback just show info; keep preview empty
      setPreviewMd("");
      setAlert({ type: "info", message: t("messages.previewFetchInfo") });
    }
  };

  const handleEdit = (term: Term) => {
    setIsEditing(true);
    setCurrentTerm(term);
    setFormData({
      name: term.name,
      tag: term.tag,
      version: term.version,
      content: null,       // user can replace; if not, backend keeps old file
      pdf_content: null,   // optional replace
    });
    setActiveTab("form"); // always default to form
    setShowModal(true);
    // Load current .md to preview
    loadExistingMarkdownToPreview(term.content);
  };

  const handleDelete = (term: Term) => {
    setCurrentTerm(term);
    setSelectedTerms([]);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedTerms.length === 0) {
      setAlert({ type: "warning", message: t("messages.selectToDelete") });
      return;
    }
    setCurrentTerm(null);
    setShowDeleteModal(true);
  };

  const onPickMdFile = async (file: File | null) => {
    setFormData(prev => ({ ...prev, content: file }));
    if (!file) {
      // If editing, restore existing preview from server; otherwise clear
      if (isEditing) await loadExistingMarkdownToPreview(currentTerm?.content);
      else setPreviewMd("");
      return;
    }
    // Ensure .md
    const extOk = /\.md$/i.test(file.name);
    if (!extOk) {
      setAlert({ type: "error", message: t("messages.validation.mdOnly") });
      return;
    }
    // read text -> preview
    const text = await file.text();
    setPreviewMd(text);
  };

  const onPickPdfFile = (file: File | null) => {
    setFormData(prev => ({ ...prev, pdf_content: file }));
    if (file && !/\.pdf$/i.test(file.name)) {
      setAlert({ type: "error", message: t("messages.validation.pdfOnly") });
    }
  };

  const filteredTerms = useMemo(() => {
    const key = searchTerm.trim().toLowerCase();
    if (!key) return terms;
    return terms.filter(t =>
      t.name.toLowerCase().includes(key) ||
      t.tag.toLowerCase().includes(key) ||
      t.version.toLowerCase().includes(key)
    );
  }, [terms, searchTerm]);

  const toggleSelection = (id: number) => {
    setSelectedTerms(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const selectAll = () => {
    if (selectedTerms.length === filteredTerms.length) setSelectedTerms([]);
    else setSelectedTerms(filteredTerms.map(t => t.id));
  };

  // Uniqueness: only one term per tag (except when editing the same record)
  const duplicateTag =
    terms.some(t => t.tag === formData.tag && (!isEditing || t.id !== currentTerm?.id));

  const submitTerm = async () => {
    // validations
    if (!formData.name.trim()) {
      setAlert({ type: "error", message: t("messages.validation.nameRequired") });
      return;
    }
    if (!formData.version.trim()) {
      setAlert({ type: "error", message: t("messages.validation.versionRequired") });
      return;
    }
    if (duplicateTag) {
      setAlert({ type: "error", message: t("messages.validation.tagUnique") });
      return;
    }
    // for CREATE we require a .md file; for EDIT we allow keeping existing if none chosen
    if (!isEditing && !formData.content) {
      setAlert({ type: "error", message: t("messages.validation.contentRequired") });
      return;
    }

    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("tag", formData.tag);
      body.append("version", formData.version);
      if (formData.content) body.append("content", formData.content); // only append if new file chosen
      if (formData.pdf_content) body.append("pdf_content", formData.pdf_content);

      const url = isEditing
        ? getApiEndpoint(`/api/terms/${currentTerm?.id}/`)
        : getApiEndpoint("/api/terms/");
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Token ${token}` } : {},
        body,
      });

      if (!res.ok) {
        // Try to read error details
        let detail = "";
        try {
          const err = await res.json();
          detail =
            err?.detail ||
            Object.values(err || {}).flat().join(" ") ||
            "";
        } catch {}
        setAlert({
          type: "error",
          message: detail || t(isEditing ? "messages.updateError" : "messages.createError"),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t(isEditing ? "messages.updateSuccess" : "messages.createSuccess"),
      });
      setShowModal(false);
      resetForm();
      fetchTerms();
    } catch {
      setAlert({ type: "error", message: t("messages.networkError") });
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (selectedTerms.length > 0) {
        const results = await Promise.all(
          selectedTerms.map(id =>
            fetch(getApiEndpoint(`/api/terms/${id}/`), {
              method: "DELETE",
              headers: token ? { Authorization: `Token ${token}` } : {},
            })
          )
        );
        const failed = results.filter(r => !r.ok).length;
        if (failed === 0) {
          setAlert({ type: "success", message: t("messages.bulkDeleteSuccess") });
        } else {
          setAlert({
            type: "warning",
            message: `${selectedTerms.length - failed} ${t("messages.bulkDeletePartial")}, ${failed} ${t("messages.failed")}`,
          });
        }
        setSelectedTerms([]);
      } else if (currentTerm) {
        const res = await fetch(getApiEndpoint(`/api/terms/${currentTerm.id}/`), {
          method: "DELETE",
          headers: token ? { Authorization: `Token ${token}` } : {},
        });
        if (res.ok) setAlert({ type: "success", message: t("messages.deleteSuccess") });
        else setAlert({ type: "error", message: t("messages.deleteError") });
      }
      fetchTerms();
      setShowDeleteModal(false);
    } catch {
      setAlert({ type: "error", message: t("messages.networkError") });
    } finally {
      setIsDeleting(false);
    }
  };

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          {filteredTerms.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={selectAll}
            >
              {selectedTerms.length === filteredTerms.length
                ? t("unselectAll")
                : t("selectAll", { count: filteredTerms.length })}
            </Button>
          )}
          {selectedTerms.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("deleteSelected")} ({selectedTerms.length})</span>
            </Button>
          )}
          <Button onClick={handleCreate} className="bg-[#22A60D] hover:bg-[#22A010] text-white">
            <Plus className="h-4 w-4" />
            <span>{t("addTerm")}</span>
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22A60D]" />
        </div>
      ) : filteredTerms.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm ? t("noResults") : t("noTerms")}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTerms.map((term) => (
            <Card
              key={term.id}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedTerms.includes(term.id)}
                    onChange={() => toggleSelection(term.id)}
                    className="mt-1 rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {term.name}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            {t(`form.tagTypes.${term.tag}`)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            v{term.version}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t("labels.created")}: {new Date(term.created_at).toLocaleDateString()} • {t("labels.updated")}: {new Date(term.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => term.pdf_content ? window.open(term.pdf_content, "_blank") : undefined}
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          title={t("downloadPdf") || "Download PDF"}
                          disabled={!term.pdf_content}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(term)}
                          className="text-[#46B1C9] hover:bg-[#46B1C9] hover:bg-opacity-10"
                          title={t("edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(term)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title={t("delete")}
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

      {/* Create/Edit Modal with Markdown Preview */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditing ? t("editTerm") : t("createTerm")}
        showHeader={true}
        className="max-w-4xl w-full mx-4"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pb-20">
          {/* Tabs */}
          <div className="sticky top-0 z-30 bg-white dark:bg-[#1A1924] flex items-center gap-2 border-b border-gray-200 dark:border-gray-700" style={{ minHeight: 56 }}>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "form"
                  ? "border-b-2 border-[#22A60D] text-[#22A60D]"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("form")}
            >
              {t("tabs.form")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "preview"
                  ? "border-b-2 border-[#46B1C9] text-[#46B1C9]"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("preview")}
            >
              {t("tabs.preview")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "pdf"
                  ? "border-b-2 border-[#B146C9] text-[#B146C9]"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setActiveTab("pdf")}
            >
              {t("tabs.pdf") || "PDF"}
            </button>
          </div>

          {activeTab === "form" && (
            <div className="space-y-6">
              {/* ...existing form code... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t("form.name")} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t("form.namePlaceholder")}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t("form.version")} *</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t("form.tag")} *</Label>
                  <div className="relative">
                    <Dropdown
                      options={
                        (isEditing
                          ? TAG_CHOICES.filter(tag => tag.value === formData.tag || availableTags.some(a => a.value === tag.value))
                          : availableTags.length > 0
                            ? TAG_CHOICES.filter(tag => availableTags.some(a => a.value === tag.value))
                            : TAG_CHOICES
                        ).map(tag => ({
                          value: tag.value,
                          label: t(tag.labelKey)
                        }))
                      }
                      value={formData.tag}
                      onChange={val => setFormData(prev => ({ ...prev, tag: val as Term["tag"] }))}
                      placeholder={t("form.tagPlaceholder")}
                      disabled={tagsLoading || (availableTags.length === 0 && !isEditing)}
                      theme="default"
                      className="w-full"
                    />
                  </div>
                  {availableTags.length === 0 && !isEditing && (
                    <div className="text-xs text-gray-500 mt-1">{t("form.noTagsLeft") || "All document types are already in use."}</div>
                  )}
                  {duplicateTag && (
                    <div className="text-xs text-red-600">
                      {t("messages.validation.tagUnique")}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t("form.pdfContent")}</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => onPickPdfFile(e.target.files?.[0] || null)}
                      className="h-11 pr-32"
                    />
                    {(isEditing && currentTerm?.pdf_content && !formData.pdf_content) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm border border-green-200">{t("pdfAvailable")}</span>
                    )}
                    {formData.pdf_content && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded shadow-sm border border-blue-200">{formData.pdf_content.name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t("form.contentMd")} {isEditing ? "" : "*"}</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".md"
                    onChange={(e) => onPickMdFile(e.target.files?.[0] || null)}
                    className="h-11 pr-32"
                  />
                  {(isEditing && currentTerm?.content && !formData.content) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm border border-green-200">{t("mdAvailable") || "Archivo subido"}</span>
                  )}
                  {formData.content && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded shadow-sm border border-blue-200">{formData.content.name}</span>
                  )}
                </div>
                <div className="text-xs flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab("preview")}
                  >
                    {t("actions.viewPreview")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab("pdf")}
                  >
                    {t("actions.viewPdf") || "View PDF"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "preview" && (
            <div className="prose prose-base max-w-none dark:prose-invert border-gray-200 dark:border-gray-700 pr-4">
              <div className="font-semibold mb-2">{t("preview.markdown") || "Markdown Preview"}</div>
              {previewMd ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewMd}</ReactMarkdown>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  {isEditing
                    ? t("preview.noFileEdit")
                    : t("preview.noFileCreate")}
                </div>
              )}
            </div>
          )}
          {activeTab === "pdf" && (
            <div className="flex flex-col items-center justify-center">
              <div className="font-semibold mb-2">{t("preview.pdf") || "PDF Preview"}</div>
              {/* Show PDF preview if a new file is picked, else show currentTerm.pdf_content if editing */}
              {formData.pdf_content ? (
                <object
                  data={URL.createObjectURL(formData.pdf_content)}
                  type="application/pdf"
                  className="w-full h-96 border rounded-lg shadow"
                >
                  <p>{t("preview.noPdf") || "No PDF available for preview."}</p>
                </object>
              ) : isEditing && currentTerm?.pdf_content ? (
                <object
                  data={currentTerm.pdf_content}
                  type="application/pdf"
                  className="w-full h-96 border rounded-lg shadow"
                >
                  <p>{t("preview.noPdf") || "No PDF available for preview."}</p>
                </object>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  {t("preview.noPdf") || "No PDF available for preview."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer actions */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-3 pt-6 pb-6 px-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1924]">
          <Button
            variant="ghost"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            className="px-6 py-2"
          >
            {t("form.cancel")}
          </Button>
          <Button
            onClick={submitTerm}
            disabled={duplicateTag || (!isEditing && !formData.content)}
            className="px-6 py-2 bg-[#22A60D] hover:bg-[#22A010] text-white"
          >
            {isEditing ? t("form.update") : t("form.create")}
          </Button>
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
