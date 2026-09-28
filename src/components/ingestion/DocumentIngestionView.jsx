import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  UploadCloud,
  FileCheck,
  Building2,
  FolderTree,
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  RefreshCw,
  X,
  Type,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { LoadingSpinner } from "../LoadingSpinner";

export function DocumentIngestionView() {
  const { hasPermission } = useAuth();
  const canUpload = hasPermission("upload_documents");

  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Ingestion Form State
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [scopeType, setScopeType] = useState("company-wide"); // "company-wide" | "branch" | "department"
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadMetadata();
    loadDocuments();
  }, []);

  const loadMetadata = async () => {
    try {
      const [bData, dData] = await Promise.all([
        api.getBranches().catch(() => []),
        api.getDepartments().catch(() => []),
      ]);
      setBranches(bData || []);
      setDepartments(dData || []);
      if (bData && bData.length > 0) setSelectedBranchId(String(bData[0].id));
      if (dData && dData.length > 0) setSelectedDeptId(String(dData[0].id));
    } catch {
      // Ignored
    }
  };

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docList = await api.getIngestedDocuments();
      setDocuments(docList || []);
    } catch {
      // Ignored
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleLoadSample = () => {
    setActiveTab("text");
    setTitle("TechCorp Global Employee Leave & Health Policy 2026");
    setScopeType("company-wide");
    setRawText(
      `TECHCORP GLOBAL EMPLOYEE HANDBOOK & BENEFITS (2026)

1. ANNUAL LEAVE & VACATION POLICY
All permanent full-time employees are entitled to 20 days of paid annual vacation leave per calendar year. Leave accrues at a rate of 1.67 days per completed month of service. Unused leave of up to 5 days can be carried forward into the next fiscal year.

2. SICK & MEDICAL LEAVE
Employees receive 10 days of paid sick leave annually. For absences exceeding 2 consecutive working days, a signed medical certificate from a licensed physician is mandatory upon return to office.

3. HEALTH & DENTAL INSURANCE
Comprehensive health insurance coverage is provided for the employee, their spouse, and up to two dependent children. Inpatient hospitalization is covered up to $50,000 annually with 100% emergency room coverage. Dental coverage includes 2 preventative checkups and 80% reimbursement for routine procedures.

4. MATERNITY & PATERNITY LEAVE
Female employees are entitled to 16 weeks of fully paid maternity leave. Male employees receive 4 weeks of fully paid paternity leave, usable within the first 6 months of the child's birth.

5. PROBATION & NOTICE PERIOD
Standard probation period for all new hires is 90 days. During probation, either party may terminate employment with 2 weeks of written notice. Post-probation, the standard notice period is 30 calendar days.`
    );
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLastResult(null);

    if (activeTab === "file" && !selectedFile) {
      setErrorMsg("Please choose or drag a PDF or TXT file to ingest.");
      return;
    }
    if (activeTab === "text" && !rawText.trim()) {
      setErrorMsg("Please enter text content to ingest.");
      return;
    }

    const branch_id = scopeType === "branch" && selectedBranchId ? parseInt(selectedBranchId, 10) : null;
    const department_id = scopeType === "department" && selectedDeptId ? parseInt(selectedDeptId, 10) : null;

    setIsSubmitting(true);
    try {
      let result;
      if (activeTab === "file") {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (title.trim()) formData.append("title", title.trim());
        if (branch_id) formData.append("branch_id", branch_id);
        if (department_id) formData.append("department_id", department_id);

        result = await api.uploadDocumentFile(formData);
      } else {
        result = await api.ingestTextContent({
          title: title.trim() || "Policy Document",
          content: rawText.trim(),
          branch_id,
          department_id,
        });
      }

      setLastResult(result);
      // Reset inputs
      setSelectedFile(null);
      setRawText("");
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadDocuments();
    } catch (err) {
      setErrorMsg(err.message || "Failed to ingest document into vector database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Database className="text-cherry dark:text-lime" size={26} /> Document Ingestion & Knowledge Base
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Embed corporate policies and handbook documents into ChromaDB Vector Store (Port 8003)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-cherry/40 dark:border-lime/40 bg-surface hover:bg-surface-hover rounded-sm text-xs font-semibold text-cherry dark:text-lime transition-colors"
          >
            <Sparkles size={14} />
            <span>Load Sample Policy</span>
          </button>
        </div>
      </div>

      {/* Main Ingestion Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload / Ingestion Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 border border-border bg-surface rounded-sm space-y-5 shadow-xs">
            {/* Mode Switcher */}
            <div className="flex items-center border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "file"
                    ? "border-cherry dark:border-lime text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <UploadCloud size={16} />
                <span>Upload PDF / Text File</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "text"
                    ? "border-cherry dark:border-lime text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Type size={16} />
                <span>Paste Raw Text / Policy</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleIngest} className="space-y-4">
              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Document Title <span className="text-vibrantRed">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Employee Handbook 2026, Leave Policy, IT Allowance"
                  className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime font-sans"
                />
              </div>

              {/* Mode A: File Upload Dropzone */}
              {activeTab === "file" && (
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Select Document (.pdf, .txt, .md) <span className="text-vibrantRed">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all ${
                      selectedFile
                        ? "border-cherry dark:border-lime bg-bg"
                        : "border-border hover:border-cherry/50 dark:hover:border-lime/50 bg-input-bg hover:bg-surface-hover"
                    }`}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileCheck size={32} className="mx-auto text-cherry dark:text-lime animate-bounce" />
                        <div className="font-bold text-xs text-text-primary">{selectedFile.name}</div>
                        <div className="text-[11px] text-text-secondary">
                          {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drop another file to replace
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud size={32} className="mx-auto text-text-secondary/60" />
                        <div className="text-xs font-semibold text-text-primary">
                          Click to browse or drag & drop document
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          Supports PDF, Plain Text (.txt), and Markdown (.md)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode B: Raw Text Input */}
              {activeTab === "text" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-primary">
                      Policy Document Content <span className="text-vibrantRed">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-text-secondary">
                      {rawText.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste full text of policy, clauses, handbooks, or SOPs here..."
                    className="w-full p-3 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Scope & Access Control Tagging */}
              <div className="pt-2 border-t border-border space-y-3">
                <label className="block text-xs font-bold text-text-primary">
                  Document Scope & Access Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScopeType("company-wide")}
                    className={`p-2.5 border rounded-sm text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      scopeType === "company-wide"
                        ? "border-cherry dark:border-lime bg-bg text-text-primary font-bold shadow-xs"
                        : "border-border bg-input-bg text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Globe size={14} className={scopeType === "company-wide" ? "text-cherry dark:text-lime" : ""} />
                    <span>Company-Wide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScopeType("branch")}
                    className={`p-2.5 border rounded-sm text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      scopeType === "branch"
                        ? "border-cherry dark:border-lime bg-bg text-text-primary font-bold shadow-xs"
                        : "border-border bg-input-bg text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Building2 size={14} className={scopeType === "branch" ? "text-cherry dark:text-lime" : ""} />
                    <span>Specific Branch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScopeType("department")}
                    className={`p-2.5 border rounded-sm text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      scopeType === "department"
                        ? "border-cherry dark:border-lime bg-bg text-text-primary font-bold shadow-xs"
                        : "border-border bg-input-bg text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <FolderTree size={14} className={scopeType === "department" ? "text-cherry dark:text-lime" : ""} />
                    <span>Specific Dept</span>
                  </button>
                </div>

                {/* Branch selector if specific branch selected */}
                {scopeType === "branch" && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Select Target Branch:
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.location})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Department selector if specific department selected */}
                {scopeType === "department" && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Select Target Department:
                    </label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (Dept #{d.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-btn-text border-t-transparent rounded-full animate-spin" />
                      <span>Embedding into ChromaDB...</span>
                    </>
                  ) : (
                    <>
                      <Layers size={16} />
                      <span>Ingest & Generate Embeddings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Ingestion Stats & Pipeline Metadata (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time Ingestion Result Card */}
          {lastResult && (
            <div className="p-5 border border-emerald-500/50 bg-emerald-500/10 rounded-sm space-y-3 animate-scaleIn">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 size={16} />
                <span>Document Ingested Successfully</span>
              </div>
              <div className="space-y-1 text-xs text-text-primary">
                <div className="font-bold text-sm">{lastResult.source_document}</div>
                <div className="text-text-secondary text-[11px] font-mono">
                  Chunks Created: <span className="font-bold text-text-primary">{lastResult.chunks_created}</span> &bull; Status: {lastResult.status}
                </div>
                {lastResult.content_hash && (
                  <div className="text-[10px] font-mono text-text-secondary truncate mt-1">
                    Hash: {lastResult.content_hash}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Microservice Architecture Summary Card */}
          <div className="p-5 border border-border bg-surface rounded-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Layers size={15} className="text-cherry dark:text-lime" />
              Ingestion Architecture
            </h3>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span>Vector Engine:</span>
                <span className="font-mono font-bold text-text-primary">ChromaDB (Embedded)</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span>Embedding Model:</span>
                <span className="font-mono text-[11px] text-text-primary">all-MiniLM-L6-v2</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span>Vector Dimensions:</span>
                <span className="font-mono font-bold text-text-primary">384-dim</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span>Chunk Size / Overlap:</span>
                <span className="font-mono text-[11px] text-text-primary">500 chars / 100 ovl</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Microservice Port:</span>
                <span className="font-mono font-bold text-cherry dark:text-lime">Port 8003</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registry Table: All Ingested Documents in Knowledge Base */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <FileText size={18} className="text-cherry dark:text-lime" />
            Knowledge Base Registry ({documents.length})
          </h2>
          <button
            type="button"
            onClick={loadDocuments}
            title="Reload documents"
            className="p-1.5 border border-border bg-surface hover:bg-surface-hover rounded-sm text-text-secondary"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {isLoadingDocs ? (
          <LoadingSpinner message="Querying vector database registry..." />
        ) : documents.length === 0 ? (
          <div className="p-8 border border-border bg-surface rounded-sm text-center text-xs text-text-secondary">
            No documents ingested yet. Upload a document or click "Load Sample Policy" above to index your first policy.
          </div>
        ) : (
          <div className="border border-border bg-surface rounded-sm overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-bg uppercase tracking-wider text-text-secondary font-bold">
                <tr>
                  <th className="p-3">Document Source</th>
                  <th className="p-3">Scope / Visibility</th>
                  <th className="p-3">Chunks</th>
                  <th className="p-3">Content Hash</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-bg/50 transition-colors">
                    <td className="p-3 font-semibold text-text-primary flex items-center gap-2">
                      <FileText size={14} className="text-cherry dark:text-lime shrink-0" />
                      <span>{doc.source_document || doc.title}</span>
                    </td>
                    <td className="p-3">
                      {doc.is_company_wide || (!doc.branch_id && !doc.department_id) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-bg rounded-sm text-[10px] font-semibold text-cherry dark:text-lime uppercase">
                          <Globe size={10} /> Universal (All)
                        </span>
                      ) : doc.branch_id ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-bg rounded-sm text-[10px] font-semibold text-text-primary">
                          <Building2 size={10} /> Branch #{doc.branch_id}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-bg rounded-sm text-[10px] font-semibold text-text-primary">
                          <FolderTree size={10} /> Dept #{doc.department_id}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      {doc.chunk_count || 1} chunks
                    </td>
                    <td className="p-3 font-mono text-[10px] text-text-secondary truncate max-w-xs">
                      {doc.content_hash ? doc.content_hash.slice(0, 16) + "..." : "indexed"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-sm text-[10px] uppercase font-bold">
                        Indexed in Vector DB
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
