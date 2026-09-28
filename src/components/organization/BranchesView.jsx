import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { LoadingSpinner } from "../LoadingSpinner";

export function BranchesView() {
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(["manage_org", "manage_branches"]);

  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Form Fields (Clean & focused: Name, Location, Address)
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [bData, cData] = await Promise.all([
        api.getBranches().catch(() => []),
        api.getCompanies().catch(() => []),
      ]);
      setBranches(bData || []);
      setCompanies(cData || []);
    } catch (err) {
      setError(err.message || "Failed to load branches.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setName("");
    setLocation("");
    setAddress("");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError("");
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setModalError("");

    // Required Field Validation
    if (!name.trim()) {
      setModalError("Branch Name is required.");
      return;
    }
    if (!location.trim()) {
      setModalError("Branch Location is required.");
      return;
    }

    const companyId = companies.length > 0 ? companies[0].id : 1;

    setIsSubmitting(true);
    try {
      await api.createBranch({
        company_id: companyId,
        name: name.trim(),
        location: location.trim(),
        address: address.trim() || null,
      });

      setSuccessMsg(`Branch "${name.trim()}" registered successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.message || "Failed to create branch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branchId, branchName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete branch "${branchName}"? All associated departments will also be affected.`
      )
    ) {
      return;
    }
    try {
      await api.deleteBranch(branchId);
      setSuccessMsg(`Branch "${branchName}" deleted.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setBranches((prev) => prev.filter((b) => b.id !== branchId));
    } catch (err) {
      setError(err.message || "Failed to delete branch.");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
      {/* Header with Title and Add Branch CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Building2 className="text-cherry dark:text-lime" size={26} /> Branch Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Operational physical sites, global offices, and geographical headquarters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Refresh branches list"
            className="p-2 border border-border bg-surface hover:bg-surface-hover rounded-sm text-text-secondary transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <Plus size={16} />
              <span>Add Branch</span>
            </button>
          )}
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-3 border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-sm text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Branches List Cards */}
      {isLoading ? (
        <LoadingSpinner message="Loading registered branches..." />
      ) : branches.length === 0 ? (
        <div className="p-12 border border-border bg-surface rounded-sm text-center space-y-3">
          <Building2 size={36} className="mx-auto text-text-secondary/40" />
          <h3 className="font-bold text-base text-text-primary">No branches registered</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Click the "Add Branch" button above to register your organization's first operational office location.
          </p>
          {canManage && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btn-bg text-btn-text text-xs font-semibold rounded-sm mt-2"
            >
              <Plus size={14} /> Add First Branch
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-5 border border-border bg-surface rounded-sm hover:border-cherry/50 dark:hover:border-lime/50 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-text-secondary uppercase">
                      Branch #{b.id}
                    </span>
                    <h3 className="font-bold text-base text-text-primary mt-0.5">
                      {b.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 border border-border bg-bg text-[10px] font-semibold text-cherry dark:text-lime rounded-sm">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-text-secondary pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-text-primary font-medium">
                    <MapPin size={13} className="text-cherry dark:text-lime shrink-0" />
                    <span>{b.location}</span>
                  </div>

                  {b.address && (
                    <div className="text-[11px] pl-5 text-text-secondary">
                      {b.address}
                    </div>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteBranch(b.id, b.name)}
                    className="p-1.5 text-text-secondary hover:text-cherry dark:hover:text-vibrantRed hover:bg-bg rounded-sm transition-colors text-xs flex items-center gap-1"
                    title="Delete Branch"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= ADD BRANCH MODAL POP-UP ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-border rounded-sm max-w-lg w-full p-6 space-y-4 shadow-xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Building2 size={18} className="text-cherry dark:text-lime" />
                Register New Branch Location
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-text-secondary hover:text-text-primary p-1"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBranch} className="space-y-4">
              {/* Branch Name Field */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Branch Name <span className="text-vibrantRed">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. London HQ, New York Tech Center, Lahore Branch"
                  className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                />
              </div>

              {/* Location Field */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Location (City, Country) <span className="text-vibrantRed">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London, United Kingdom or New York, USA"
                  className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Full Street Address <span className="text-text-secondary font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Bishopsgate, Level 14"
                  className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium border border-border bg-bg hover:bg-surface-hover rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
