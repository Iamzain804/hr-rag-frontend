import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Shield,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  MessageSquare,
  Building2,
  FolderTree,
  FileText,
  Users,
  Bell,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { LoadingSpinner } from "../LoadingSpinner";

// Permission categorization for intuitive UI display
const PERMISSION_METADATA = {
  chat_rag: {
    category: "HR Chatbot & RAG",
    icon: MessageSquare,
    label: "Access HR Assistant Chat",
    description: "Allows employees to interact with the contextual AI chatbot and query company documents.",
  },
  view_org: {
    category: "Organization & Structure",
    icon: Building2,
    label: "View Branches & Departments",
    description: "Allows viewing branch locations, working hours, and departmental hierarchies.",
  },
  manage_org: {
    category: "Organization & Structure",
    icon: FolderTree,
    label: "Manage Branches & Departments",
    description: "Allows creating, updating, and removing branch locations and departments.",
  },
  upload_documents: {
    category: "Documents & Knowledge Base",
    icon: FileText,
    label: "Upload Documents & Policies",
    description: "Allows uploading PDFs/text policies, chunking, and embedding into ChromaDB knowledge base.",
  },
  view_users: {
    category: "User Directory & Access",
    icon: Users,
    label: "View Employee Directory",
    description: "Allows viewing active company user accounts and assigned roles.",
  },
  manage_users: {
    category: "User Directory & Access",
    icon: Users,
    label: "Manage User Accounts",
    description: "Allows creating new users, assigning roles/branches, and deactivating accounts.",
  },
  manage_roles: {
    category: "RBAC & Security",
    icon: ShieldCheck,
    label: "Manage Roles & Permissions",
    description: "Allows creating custom roles and configuring granular privilege matrices.",
  },
  manage_permissions: {
    category: "RBAC & Security",
    icon: Lock,
    label: "Manage System Permissions",
    description: "Allows configuring system-level authorization policies and permission registry.",
  },
  manage_notifications: {
    category: "Notifications & Alerts",
    icon: Bell,
    label: "Dispatch Notifications",
    description: "Allows sending custom emails and onboarding credentials via Notification Service.",
  },
};

export function RolesManagementView() {
  const { hasAnyPermission } = useAuth();
  const canManageRoles = hasAnyPermission(["manage_roles"]);

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sub-page View: "list" | "form"
  const [currentView, setCurrentView] = useState("list");
  const [editingRole, setEditingRole] = useState(null);

  // Form State (Role Name + Permission IDs)
  const [roleName, setRoleName] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // 3-dot Dropdown State
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [rData, pData] = await Promise.all([
        api.getRoles().catch(() => []),
        api.getPermissions().catch(() => []),
      ]);
      setRoles(rData || []);
      setPermissions(pData || []);
    } catch (err) {
      setErrorMsg(err.message || "Failed to load roles and permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- VIEW SWITCHERS ---
  const handleOpenCreateForm = () => {
    setEditingRole(null);
    setRoleName("");
    setSelectedPermissionIds([]);
    setFormError("");
    setCurrentView("form");
    setOpenActionMenuId(null);
  };

  const handleOpenEditForm = (roleToEdit) => {
    setEditingRole(roleToEdit);
    setRoleName(roleToEdit.name || "");
    const permIds = roleToEdit.permissions ? roleToEdit.permissions.map((p) => p.id) : [];
    setSelectedPermissionIds(permIds);
    setFormError("");
    setCurrentView("form");
    setOpenActionMenuId(null);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingRole(null);
    setFormError("");
  };

  // --- PERMISSION TOGGLE HELPERS ---
  const handleTogglePermission = (permId) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissionIds(permissions.map((p) => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissionIds([]);
  };

  // --- SAVE / SUBMIT HANDLER ---
  const handleSaveRole = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation: Role Name is mandatory (*)
    if (!roleName.trim()) {
      setFormError("Role Name is required (*).");
      return;
    }

    // Validation: At least one permission must be selected (*)
    if (selectedPermissionIds.length === 0) {
      setFormError("Please select at least one permission for this role (*).");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRole) {
        // 1. Update role basic info
        await api.updateRole(editingRole.id, {
          name: roleName.trim(),
        });
        // 2. Update assigned permissions
        await api.assignRolePermissions(editingRole.id, selectedPermissionIds);
        setSuccessMsg(`Role '${roleName.trim()}' updated successfully.`);
      } else {
        // Create new role with permissions
        await api.createRole({
          name: roleName.trim(),
          description: `Custom role with ${selectedPermissionIds.length} permissions`,
          is_active: true,
          permission_ids: selectedPermissionIds,
        });
        setSuccessMsg(`Role '${roleName.trim()}' created successfully.`);
      }

      setTimeout(() => setSuccessMsg(""), 4000);
      handleBackToList();
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to save role. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE ROLE HANDLER ---
  const handleDeleteRole = async (roleId, rName) => {
    setOpenActionMenuId(null);
    if (rName === "Super Admin") {
      alert("Super Admin is a protected system role and cannot be deleted.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete role '${rName}'? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteRole(roleId);
      setSuccessMsg(`Role '${rName}' deleted successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete role.");
    }
  };

  // Group permissions by category for clear layout
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const meta = PERMISSION_METADATA[perm.name] || {
      category: "General System Privileges",
      icon: Shield,
      label: perm.name,
      description: perm.description || "System permission",
    };
    if (!acc[meta.category]) acc[meta.category] = [];
    acc[meta.category].push({ ...perm, meta });
    return acc;
  }, {});

  // =========================================================================
  // SUB-PAGE: CREATE / EDIT ROLE FORM VIEW (NO MODAL, FULL PAGE BREADCRUMBS)
  // =========================================================================
  if (currentView === "form") {
    const isEditing = Boolean(editingRole);

    return (
      <div className="space-y-6 w-full max-w-5xl mx-auto animate-fadeIn">
        {/* Breadcrumb Header Navigation */}
        <div className="border-b border-border pb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
            <button
              type="button"
              onClick={handleBackToList}
              className="hover:text-cherry dark:hover:text-lime transition-colors flex items-center gap-1"
            >
              <ShieldCheck size={14} />
              <span>Roles & Permissions</span>
            </button>
            <span>›</span>
            <span className="text-text-primary font-bold">
              {isEditing ? `Edit Role: ${editingRole.name}` : "Create New Role"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <ShieldCheck className="text-cherry dark:text-lime" size={26} />
              {isEditing ? `Edit Role: ${editingRole.name}` : "Create New Role"}
            </h1>

            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface hover:bg-surface-hover rounded-sm text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Roles</span>
            </button>
          </div>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveRole} className="space-y-6">
          {/* Card 1: Role Basic Information */}
          <div className="p-6 border border-border bg-surface rounded-sm space-y-4 shadow-xs">
            <div className="border-b border-border pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-text-primary">Role Name Details</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Define the unique identity of this role
                </p>
              </div>
              <span className="text-[11px] font-mono text-cherry dark:text-lime font-bold">
                * Mandatory Fields
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Role Name <span className="text-vibrantRed">*</span>
              </label>
              <input
                type="text"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Branch HR Coordinator, IT Support Lead, Senior Analyst"
                className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
              />
            </div>
          </div>

          {/* Card 2: Permissions Matrix Selection */}
          <div className="p-6 border border-border bg-surface rounded-sm space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Shield size={16} className="text-cherry dark:text-lime" />
                  Privileges & Permissions Matrix <span className="text-vibrantRed">*</span>
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Select which microservices and features users with this role can access (
                  <span className="font-bold text-text-primary">
                    {selectedPermissionIds.length} of {permissions.length} selected
                  </span>
                  )
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="px-2.5 py-1 border border-border bg-bg hover:bg-surface rounded-sm text-[11px] font-semibold text-text-primary transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllPermissions}
                  className="px-2.5 py-1 border border-border bg-bg hover:bg-surface rounded-sm text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Categorized Permissions Grid */}
            <div className="space-y-5">
              {Object.entries(groupedPermissions).map(([categoryName, permsList]) => (
                <div key={categoryName} className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {categoryName}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permsList.map((p) => {
                      const isSelected = selectedPermissionIds.includes(p.id);
                      const Icon = p.meta.icon || Shield;

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleTogglePermission(p.id)}
                          className={`p-3.5 border rounded-sm cursor-pointer transition-all flex items-start gap-3 select-none ${
                            isSelected
                              ? "border-cherry dark:border-lime bg-bg shadow-xs"
                              : "border-border bg-input-bg/60 hover:bg-input-bg hover:border-border"
                          }`}
                        >
                          <div className="pt-0.5 shrink-0">
                            {isSelected ? (
                              <CheckSquare size={17} className="text-cherry dark:text-lime" />
                            ) : (
                              <Square size={17} className="text-text-secondary" />
                            )}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold ${
                                  isSelected ? "text-text-primary" : "text-text-secondary"
                                }`}
                              >
                                {p.meta.label}
                              </span>
                              <code className="text-[10px] font-mono text-text-secondary px-1 py-0.5 border border-border bg-bg rounded-xs">
                                {p.name}
                              </code>
                            </div>
                            <p className="text-[11px] text-text-secondary leading-relaxed">
                              {p.meta.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="px-5 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-sm text-xs font-semibold text-text-secondary transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-btn-text border-t-transparent rounded-full animate-spin" />
                  <span>Saving Role...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>{isEditing ? "Save Changes" : "Save & Create Role"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // MAIN VIEW: ROLES LIST & MANAGEMENT
  // =========================================================================
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <ShieldCheck className="text-cherry dark:text-lime" size={26} /> Roles & Permissions (RBAC)
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure user roles and granular authorization privileges across microservices
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            title="Reload roles"
            className="p-2 border border-border bg-surface hover:bg-surface-hover rounded-sm text-text-secondary transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {canManageRoles && (
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <Plus size={16} />
              <span>Create New Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3 border border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 rounded-sm text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMsg && (
        <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Roles Grid Display */}
      {isLoading ? (
        <LoadingSpinner message="Loading RBAC configuration..." />
      ) : roles.length === 0 ? (
        <div className="p-12 border border-border bg-surface rounded-sm text-center space-y-3">
          <Shield size={36} className="mx-auto text-text-secondary/50" />
          <div className="text-sm font-bold text-text-primary">No Roles Configured</div>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Click 'Create New Role' to define your first access role.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((r) => {
            const isActionMenuOpen = openActionMenuId === r.id;
            const isSuperAdmin = r.name === "Super Admin";

            return (
              <div
                key={r.id}
                className="p-5 border border-border bg-surface rounded-sm hover:border-cherry/40 dark:hover:border-lime/40 transition-all shadow-2xs flex flex-col justify-between space-y-4 relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-bold text-text-primary text-base flex items-center gap-2">
                        <span>{r.name}</span>
                        {isSuperAdmin && (
                          <span className="px-1.5 py-0.5 border border-cherry/40 dark:border-lime/40 bg-bg text-[10px] font-bold text-cherry dark:text-lime uppercase rounded-xs">
                            System Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cherry dark:text-lime font-semibold mt-1">
                        {r.permissions?.length || 0} permissions assigned
                      </div>
                    </div>

                    {/* 3-DOT ACTION MENU */}
                    {canManageRoles && (
                      <div className="relative" ref={isActionMenuOpen ? menuRef : null}>
                        <button
                          type="button"
                          onClick={() => setOpenActionMenuId(isActionMenuOpen ? null : r.id)}
                          title="Manage Role"
                          className={`p-1.5 rounded-sm border transition-colors ${
                            isActionMenuOpen
                              ? "bg-surface border-cherry dark:border-lime text-cherry dark:text-lime"
                              : "border-border/60 hover:border-border bg-bg hover:bg-surface text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isActionMenuOpen && (
                          <div className="absolute right-0 top-9 z-50 w-36 bg-surface border border-border rounded-sm shadow-xl py-1 text-left animate-scaleIn select-none">
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(r)}
                              className="w-full px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={13} className="text-cherry dark:text-lime" />
                              <span>Edit Role</span>
                            </button>

                            {!isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRole(r.id, r.name)}
                                className="w-full px-3 py-2 text-xs font-medium text-vibrantRed hover:bg-vibrantRed/10 flex items-center gap-2 transition-colors border-t border-border/40"
                              >
                                <Trash2 size={13} />
                                <span>Delete Role</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Permission Badges */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Assigned Permissions:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions && r.permissions.length > 0 ? (
                      r.permissions.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-0.5 border border-border bg-bg text-[11px] font-mono rounded-sm text-cherry dark:text-lime font-medium"
                        >
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondary italic">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
