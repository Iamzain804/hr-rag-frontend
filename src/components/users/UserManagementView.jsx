import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { LoadingSpinner } from "../LoadingSpinner";

export function UserManagementView() {
  const { hasAnyPermission } = useAuth();
  const canManageUsers = hasAnyPermission(["manage_users"]);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [createdUserData, setCreatedUserData] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [sendNotificationEmail, setSendNotificationEmail] = useState(true);

  useEffect(() => {
    loadAllData();
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

      // Set defaults for form if empty
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

  const handleOpenModal = () => {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

      // 1. Create user in identity service
      const newUser = await api.createUser(payload);

      // 2. Dispatch welcome email via notification service if requested
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
          // Notification service error shouldn't fail user creation, but flag it
          emailDispatched = false;
        }
      }

      setCreatedUserData({
        ...newUser,
        emailDispatched,
      });

      // Refresh directory in background
      loadAllData();
      setSuccessMsg(`User '${newUser.email}' created successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setModalError(err.message || "Failed to create user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to deactivate user account '${userEmail}'?`)) {
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

  // Filter users by search
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
            Manage company employees, assign roles, and configure branch/department access
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
              onClick={handleOpenModal}
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
        <div className="border border-border bg-surface rounded-sm overflow-x-auto shadow-xs">
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

                return (
                  <tr key={u.id} className="hover:bg-bg/50 transition-colors">
                    <td className="p-3.5 font-semibold text-text-primary flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cherry/10 dark:bg-lime/10 border border-cherry/30 dark:border-lime/30 text-cherry dark:text-lime font-bold flex items-center justify-center text-xs">
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
                        className={`px-2 py-0.5 border rounded-sm text-[10px] uppercase font-bold ${
                          u.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-bg text-text-secondary border-border"
                        }`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {canManageUsers && (
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          title="Deactivate User"
                          className="p-1.5 text-text-secondary hover:text-vibrantRed hover:bg-vibrantRed/10 rounded-sm transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= ADD USER MODAL POPUP ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="border border-border bg-surface rounded-sm w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-bg/50">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-cherry dark:text-lime" />
                <h3 className="font-bold text-sm text-text-primary">
                  {createdUserData ? "User Account Created" : "Add New User"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 text-text-secondary hover:text-text-primary rounded-sm transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* SUCCESS VIEW: Show credentials and notification dispatch */}
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

                  {/* Temporary Password Box */}
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

                  {/* Notification Status */}
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

                  {/* Done Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-2.5 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-sm font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM VIEW */
                <form onSubmit={handleCreateUser} className="space-y-4">
                  {modalError && (
                    <div className="p-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-sm text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  {/* Name Fields (Grid 2 cols) */}
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

                  {/* Email Address */}
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

                  {/* Role Assignment */}
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

                  {/* Branch & Department Assignment (Grid 2 cols) */}
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

                  {/* Email Notification Checkbox */}
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

                  {/* Modal Footer Buttons */}
                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleCloseModal}
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
