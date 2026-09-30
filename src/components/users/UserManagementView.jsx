import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Building2,
  FolderTree,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Copy,
  Check,
  Search,
  Trash2,
  Send,
  MoreVertical,
  Edit2,
  Power,
  UserCheck,
  UserX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { LoadingSpinner } from "../LoadingSpinner";

export function UserManagementView() {
  const { user: currentUser, hasAnyPermission } = useAuth();
  const canManageUsers = hasAnyPermission(["manage_users"]);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 3-dot Menu State
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const menuRef = useRef(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [createdUserData, setCreatedUserData] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Add Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [sendNotificationEmail, setSendNotificationEmail] = useState(true);

  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
  const [editBranchId, setEditBranchId] = useState("");
  const [editDeptId, setEditDeptId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editModalError, setEditModalError] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  // Close 3-dot action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const [uData, rData, bData, dData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getRoles().catch(() => []),
        api.getBranches().catch(() => []),
        api.getDepartments().catch(() => []),
      ]);
      setUsers(uData || []);
      setRoles(rData || []);
      setBranches(bData || []);
      setDepartments(dData || []);

      // Set default role for Add form
      if (rData && rData.length > 0 && !roleId) {
        const empRole = rData.find((r) => r.name?.toLowerCase().includes("employee")) || rData[0];
        setRoleId(String(empRole.id));
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load user directory.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ADD USER HANDLERS ---
  const handleOpenAddModal = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setBranchId("");
    setDeptId("");
    setModalError("");
    setCreatedUserData(null);
    setCopiedPassword(false);
    setSendNotificationEmail(true);

    if (roles.length > 0) {
      const empRole = roles.find((r) => r.name?.toLowerCase().includes("employee")) || roles[0];
      setRoleId(String(empRole.id));
    }
    setIsAddModalOpen(true);
    setOpenActionMenuId(null);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setCreatedUserData(null);
    setModalError("");
  };

  const handleCopyPassword = (pwd) => {
    navigator.clipboard.writeText(pwd);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!firstName.trim() || !email.trim() || !roleId) {
      setModalError("Please fill in First Name, Email, and select a Role.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        email: email.trim().toLowerCase(),
        role_id: parseInt(roleId, 10),
        branch_id: branchId ? parseInt(branchId, 10) : null,
        department_id: deptId ? parseInt(deptId, 10) : null,
      };

      const newUser = await api.createUser(payload);

      let emailDispatched = false;
      if (sendNotificationEmail && newUser.temporary_password) {
        try {
          await api.sendTempPasswordEmail({
            email: newUser.email,
            first_name: newUser.first_name,
            temp_password: newUser.temporary_password,
            app_url: window.location.origin,
          });
          emailDispatched = true;
        } catch {
          emailDispatched = false;
        }
      }

      setCreatedUserData({
        ...newUser,
        emailDispatched,
      });

      loadAllData();
      setSuccessMsg(`User '${newUser.email}' created successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setModalError(err.message || "Failed to create user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EDIT USER HANDLERS ---
  const handleOpenEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditFirstName(userToEdit.first_name || "");
    setEditLastName(userToEdit.last_name || "");
    setEditRoleId(String(userToEdit.role_id || ""));
    setEditBranchId(userToEdit.branch_id ? String(userToEdit.branch_id) : "");
    setEditDeptId(userToEdit.department_id ? String(userToEdit.department_id) : "");
    setEditIsActive(Boolean(userToEdit.is_active));
    setEditModalError("");
    setIsEditModalOpen(true);
    setOpenActionMenuId(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditModalError("");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditModalError("");

    if (!editFirstName.trim() || !editRoleId) {
      setEditModalError("First name and role are required.");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim() || null,
        role_id: parseInt(editRoleId, 10),
        branch_id: editBranchId ? parseInt(editBranchId, 10) : null,
        department_id: editDeptId ? parseInt(editDeptId, 10) : null,
        is_active: editIsActive,
      };

      await api.updateUser(editingUser.id, payload);
      setSuccessMsg(`User '${editingUser.email}' updated successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      handleCloseEditModal();
      loadAllData();
    } catch (err) {
      setEditModalError(err.message || "Failed to update user account.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- STATUS TOGGLE & DELETE HANDLERS ---
  const handleToggleStatus = async (userItem) => {
    setOpenActionMenuId(null);
    const newStatus = !userItem.is_active;
    const actionLabel = newStatus ? "activate" : "deactivate";

    try {
      await api.updateUser(userItem.id, { is_active: newStatus });
      setSuccessMsg(`User '${userItem.email}' is now ${newStatus ? "Active" : "Inactive"}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message || `Failed to ${actionLabel} user.`);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    setOpenActionMenuId(null);
    if (!window.confirm(`Are you sure you want to deactivate and remove user account '${userEmail}'?`)) {
      return;
    }

    try {
      await api.deleteUser(userId);
      setSuccessMsg(`User '${userEmail}' deactivated successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to deactivate user.");
    }
  };

  // Filter users by search query
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    const emailStr = (u.email || "").toLowerCase();
    const roleStr = (u.role_name || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return fullName.includes(q) || emailStr.includes(q) || roleStr.includes(q);
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Users className="text-cherry dark:text-lime" size={26} /> User Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage company employees, assign roles, configure permissions, and update accounts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadAllData}
            title="Reload user list"
            className="p-2 border border-border bg-surface hover:bg-surface-hover rounded-sm text-text-secondary transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {canManageUsers && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <UserPlus size={16} />
              <span>Add User</span>
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

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-3 py-2 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
          />
        </div>

        <div className="text-xs text-text-secondary">
          Showing <span className="font-bold text-text-primary">{filteredUsers.length}</span> of {users.length} active users
        </div>
      </div>

      {/* User Directory Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 border border-border bg-surface rounded-sm text-center space-y-3">
          <Users size={36} className="mx-auto text-text-secondary/50" />
          <div className="text-sm font-bold text-text-primary">No Users Found</div>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {searchQuery
              ? "No user accounts match your search filter."
              : "No user accounts exist in the directory. Click 'Add User' to register your first team member."}
          </p>
        </div>
      ) : (
        <div className="border border-border bg-surface rounded-sm overflow-visible shadow-xs">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="border-b border-border bg-bg uppercase tracking-wider text-text-secondary font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Status</th>
                {canManageUsers && <th className="p-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => {
                const userBranch = branches.find((b) => b.id === u.branch_id);
                const userDept = departments.find((d) => d.id === u.department_id);
                const isActionMenuOpen = openActionMenuId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-bg/50 transition-colors">
                    <td className="p-3.5 font-semibold text-text-primary flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cherry/10 dark:bg-lime/10 border border-cherry/30 dark:border-lime/30 text-cherry dark:text-lime font-bold flex items-center justify-center text-xs shrink-0">
                        {(u.first_name?.[0] || "U").toUpperCase()}
                      </div>
                      <span>
                        {u.first_name} {u.last_name || ""}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-text-secondary">{u.email}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-border bg-bg rounded-sm text-cherry dark:text-lime font-semibold text-[11px]">
                        <Shield size={11} /> {u.role_name || `Role #${u.role_id}`}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {userBranch ? (
                        <span className="inline-flex items-center gap-1 text-text-primary">
                          <Building2 size={12} className="text-text-secondary" /> {userBranch.name}
                        </span>
                      ) : (
                        <span className="text-text-secondary italic">Company-Wide</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {userDept ? (
                        <span className="inline-flex items-center gap-1 text-text-primary">
                          <FolderTree size={12} className="text-text-secondary" /> {userDept.name}
                        </span>
                      ) : (
                        <span className="text-text-secondary italic">General</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-sm text-[11px] font-semibold ${
                          u.is_active
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-bg text-text-secondary border-border"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.is_active ? "bg-emerald-500 animate-pulse" : "bg-text-secondary/50"
                          }`}
                        />
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* 3-DOT VERTICAL ACTION DROPDOWN */}
                    {canManageUsers && (
                      <td className="p-3.5 text-right relative">
                        <div className="inline-block text-left" ref={isActionMenuOpen ? menuRef : null}>
                          <button
                            type="button"
                            onClick={() => setOpenActionMenuId(isActionMenuOpen ? null : u.id)}
                            title="Manage User Actions"
                            className={`p-1.5 rounded-sm border transition-colors ${
                              isActionMenuOpen
                                ? "bg-surface border-cherry dark:border-lime text-cherry dark:text-lime"
                                : "border-border/60 hover:border-border bg-bg hover:bg-surface text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Floating Dropdown Menu */}
                          {isActionMenuOpen && (
                            <div className="absolute right-3.5 top-11 z-50 w-44 bg-surface border border-border rounded-sm shadow-xl py-1 text-left animate-scaleIn select-none">
                              {/* Option 1: Edit User */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(u)}
                                className="w-full px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover flex items-center gap-2 transition-colors"
                              >
                                <Edit2 size={13} className="text-cherry dark:text-lime" />
                                <span>Edit Details</span>
                              </button>

                              {/* Option 2: Toggle Active / Inactive Status */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                className="w-full px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover flex items-center gap-2 transition-colors border-t border-border/40"
                              >
                                {u.is_active ? (
                                  <>
                                    <UserX size={13} className="text-amber-500" />
                                    <span>Set as Inactive</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={13} className="text-emerald-500" />
                                    <span>Set as Active</span>
                                  </>
                                )}
                              </button>

                              {/* Option 3: Delete / Deactivate User */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="w-full px-3 py-2 text-xs font-medium text-vibrantRed hover:bg-vibrantRed/10 flex items-center gap-2 transition-colors border-t border-border/40"
                              >
                                <Trash2 size={13} />
                                <span>Delete User</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= EDIT USER MODAL POPUP ================= */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="border border-border bg-surface rounded-sm w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-border bg-bg/50">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-cherry dark:text-lime" />
                <h3 className="font-bold text-sm text-text-primary">
                  Edit User: {editingUser.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="p-1 text-text-secondary hover:text-text-primary rounded-sm transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              {editModalError && (
                <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{editModalError}</span>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    First Name <span className="text-vibrantRed">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Assigned Role <span className="text-vibrantRed">*</span>
                </label>
                <select
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                  className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — ({r.description || `${r.permissions?.length || 0} permissions`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch & Dept */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Assigned Branch
                  </label>
                  <select
                    value={editBranchId}
                    onChange={(e) => setEditBranchId(e.target.value)}
                    className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                  >
                    <option value="">Company-Wide / Universal</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Assigned Department
                  </label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                  >
                    <option value="">General / All</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Status Toggle */}
              <div className="pt-2 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded-sm border-border text-cherry dark:text-lime focus:ring-0"
                  />
                  <span className="text-xs text-text-primary font-semibold">
                    Account is Active and Allowed to Login
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-border bg-surface hover:bg-surface-hover rounded-sm text-xs font-semibold text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-btn-text border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD USER MODAL POPUP ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="border border-border bg-surface rounded-sm w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between p-4 border-b border-border bg-bg/50">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-cherry dark:text-lime" />
                <h3 className="font-bold text-sm text-text-primary">
                  {createdUserData ? "User Account Created" : "Add New User"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseAddModal}
                className="p-1 text-text-secondary hover:text-text-primary rounded-sm transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {createdUserData ? (
                <div className="space-y-4">
                  <div className="p-4 border border-emerald-500/50 bg-emerald-500/10 rounded-sm space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 size={16} />
                      <span>Account Successfully Created</span>
                    </div>
                    <p className="text-xs text-text-primary">
                      User <strong>{createdUserData.email}</strong> is now registered as a{" "}
                      <strong>{createdUserData.role_name}</strong>.
                    </p>
                  </div>

                  <div className="p-4 border border-border bg-bg rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                        <KeyRound size={13} className="text-cherry dark:text-lime" /> Temporary Generated Password:
                      </label>
                      <button
                        type="button"
                        onClick={() => handleCopyPassword(createdUserData.temporary_password)}
                        className="flex items-center gap-1 px-2 py-1 border border-border hover:bg-surface rounded-sm text-[11px] font-semibold text-text-primary transition-colors"
                      >
                        {copiedPassword ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-2.5 border border-border bg-input-bg rounded-sm font-mono text-sm font-bold text-cherry dark:text-lime tracking-wider break-all select-all">
                      {createdUserData.temporary_password}
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      The user will be prompted to change this temporary password upon their first login.
                    </p>
                  </div>

                  <div className="p-3 border border-border bg-surface rounded-sm flex items-center gap-2.5 text-xs">
                    <Send size={15} className="text-cherry dark:text-lime shrink-0" />
                    <span className="text-text-secondary">
                      {createdUserData.emailDispatched ? (
                        <>Welcome email with login instructions was <strong>dispatched to {createdUserData.email}</strong>.</>
                      ) : (
                        <>Credentials ready. (Share the temporary password above with the employee).</>
                      )}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseAddModal}
                      className="px-6 py-2.5 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateUser} className="space-y-4">
                  {modalError && (
                    <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        First Name <span className="text-vibrantRed">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Khan"
                        className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1">
                      Email Address <span className="text-vibrantRed">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. sarah.khan@techcorp.com"
                        className="w-full pl-9 pr-3 py-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1">
                      Assign Role <span className="text-vibrantRed">*</span>
                    </label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — ({r.description || `${r.permissions?.length || 0} permissions`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Assigned Branch
                      </label>
                      <select
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                      >
                        <option value="">Company-Wide / Universal</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        Assigned Department
                      </label>
                      <select
                        value={deptId}
                        onChange={(e) => setDeptId(e.target.value)}
                        className="w-full p-2.5 border border-border bg-input-bg rounded-sm text-xs text-text-primary outline-none focus:border-cherry dark:focus:border-lime"
                      >
                        <option value="">General / All</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sendNotificationEmail}
                        onChange={(e) => setSendNotificationEmail(e.target.checked)}
                        className="rounded-sm border-border text-cherry dark:text-lime focus:ring-0"
                      />
                      <span className="text-xs text-text-secondary font-medium">
                        Dispatch temporary login credentials to user's email via SMTP notification
                      </span>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleCloseAddModal}
                      className="px-4 py-2 border border-border bg-surface hover:bg-surface-hover rounded-sm text-xs font-semibold text-text-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-btn-text border-t-transparent rounded-full animate-spin" />
                          <span>Creating User...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={15} />
                          <span>Create User</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
