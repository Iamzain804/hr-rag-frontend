import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Building2,
  Plus,
  Clock,
  Briefcase,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { LoadingSpinner } from "../LoadingSpinner";

export function DepartmentsView() {
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(["manage_org", "manage_departments"]);

  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Form Fields: Branch, Name, Roles & Responsibilities, Duty Timings
  const [branchId, setBranchId] = useState("");
  const [name, setName] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [dutyTimings, setDutyTimings] = useState("09:00 - 18:00 (Flexible)");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [dData, bData] = await Promise.all([
        api.getDepartments().catch(() => []),
        api.getBranches().catch(() => []),
      ]);
      setDepartments(dData || []);
      setBranches(bData || []);
      if (bData && bData.length > 0 && !branchId) {
        setBranchId(String(bData[0].id));
      }
    } catch (err) {
      setError(err.message || "Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setName("");
    setResponsibilities("");
    setDutyTimings("09:00 - 18:00 (Flexible)");
    if (branches.length > 0) {
      setBranchId(String(branches[0].id));
    }
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError("");
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!branchId) {
      setModalError("Please select a parent Branch for this department.");
      return;
    }
    if (!name.trim()) {
      setModalError("Department Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createDepartment({
        branch_id: parseInt(branchId, 10),
        name: name.trim(),
        responsibilities: responsibilities.trim() || null,
        duty_timings: dutyTimings.trim() || null,
      });

      setSuccessMsg(`Department "${name.trim()}" registered successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.message || "Failed to create department.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (deptId, deptName) => {
    if (!window.confirm(`Are you sure you want to delete department "${deptName}"?`)) {
      return;
    }
    try {
      await api.deleteDepartment(deptId);
      setSuccessMsg(`Department "${deptName}" deleted.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    } catch (err) {
      setError(err.message || "Failed to delete department.");
    }
  };

  const filteredDepartments =
    selectedBranchFilter === "all"
      ? departments
      : departments.filter((d) => String(d.branch_id) === String(selectedBranchFilter));

  const getBranchName = (bId) => {
    const found = branches.find((b) => b.id === bId);
    return found ? found.name : `Branch #${bId}`;
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
      {/* Header with Title and Add Department CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <FolderTree className="text-cherry dark:text-lime" size={26} /> Department Teams
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Functional teams, departmental roles, and operational schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            title="Refresh departments list"
            className="p-2 border border-border/80 bg-surface hover:bg-surface-hover rounded-xl text-text-secondary transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={branches.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 active:scale-95"
            >
              <Plus size={16} />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Branch Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 text-text-secondary font-bold uppercase tracking-wider mr-2">
          <Filter size={13} /> Filter Branch:
        </div>
        <button
          type="button"
          onClick={() => setSelectedBranchFilter("all")}
          className={`px-3.5 py-1.5 rounded-full border transition-all ${
            selectedBranchFilter === "all"
              ? "bg-bg text-text-primary border-cherry dark:border-lime font-bold shadow-xs"
              : "border-border/80 bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          All Branches ({departments.length})
        </button>
        {branches.map((b) => {
          const count = departments.filter((d) => d.branch_id === b.id).length;
          const isActive = selectedBranchFilter === String(b.id);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBranchFilter(String(b.id))}
              className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-bg text-text-primary border-cherry dark:border-lime font-bold shadow-xs"
                  : "border-border/80 bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              <Building2 size={12} className={isActive ? "text-cherry dark:text-lime" : ""} />
              <span>{b.name}</span>
              <span className="text-[10px] font-mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-3.5 border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Departments Cards Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading departments..." />
      ) : filteredDepartments.length === 0 ? (
        <div className="p-12 border border-border/80 bg-surface rounded-2xl text-center space-y-3">
          <FolderTree size={36} className="mx-auto text-text-secondary/40" />
          <h3 className="font-bold text-base text-text-primary">No departments found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {branches.length === 0
              ? "Please create a branch first before registering departments."
              : "No departments registered under the selected branch filter."}
          </p>
          {canManage && branches.length > 0 && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-btn-bg text-btn-text text-xs font-bold uppercase rounded-xl mt-2 shadow-sm"
            >
              <Plus size={14} /> Add First Department
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((d) => (
            <div
              key={d.id}
              className="p-6 border border-border/80 bg-surface rounded-2xl hover:border-cherry/50 dark:hover:border-lime/50 transition-all shadow-xs flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                      Dept #{d.id}
                    </span>
                    <h3 className="font-bold text-base text-text-primary mt-0.5">
                      {d.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 border border-border/80 bg-bg text-[10px] font-semibold text-cherry dark:text-lime rounded-full flex items-center gap-1">
                    <Building2 size={10} />
                    {getBranchName(d.branch_id)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-text-secondary pt-2 border-t border-border/50">
                  {d.responsibilities && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1 mb-1">
                        <Briefcase size={11} className="text-cherry dark:text-lime" />
                        Roles & Responsibilities:
                      </div>
                      <p className="text-[11px] text-text-secondary bg-bg p-3 rounded-xl border border-border/60 leading-relaxed font-sans">
                        {d.responsibilities}
                      </p>
                    </div>
                  )}

                  {d.duty_timings && (
                    <div className="flex items-center gap-2 text-[11px] pt-1">
                      <Clock size={12} className="shrink-0 text-text-secondary" />
                      <span>Timings: {d.duty_timings}</span>
                    </div>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="pt-3 border-t border-border/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteDepartment(d.id, d.name)}
                    className="p-1.5 px-2.5 text-text-secondary hover:text-cherry dark:hover:text-vibrantRed hover:bg-bg rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium"
                    title="Delete Department"
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

      {/* ================= ADD DEPARTMENT MODAL POP-UP ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-border/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <FolderTree size={18} className="text-cherry dark:text-lime" />
                Register New Department
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Assigned Branch <span className="text-vibrantRed">*</span>
                </label>
                <select
                  required
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full p-2.5 px-3 border border-border/80 bg-input-bg rounded-xl text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime cursor-pointer transition-all"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Department Name <span className="text-vibrantRed">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Software Engineering, HR, Legal, Marketing"
                  className="w-full p-2.5 px-3 border border-border/80 bg-input-bg rounded-xl text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Key Department Roles & Responsibilities <span className="text-text-secondary font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="e.g. Frontend Engineers, DevOps Specialists, QA Analysts - responsible for code reviews and sprint delivery"
                  className="w-full p-2.5 px-3 border border-border/80 bg-input-bg rounded-xl text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Duty Timings <span className="text-text-secondary font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={dutyTimings}
                  onChange={(e) => setDutyTimings(e.target.value)}
                  placeholder="e.g. 09:00 - 18:00 (Flexible)"
                  className="w-full p-2.5 px-3 border border-border/80 bg-input-bg rounded-xl text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium border border-border/80 bg-bg hover:bg-surface-hover rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-btn-bg text-btn-text hover:bg-btn-hover rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
