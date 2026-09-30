const IDENTITY_BASE_URL = "http://localhost:8001/api/v1";
const NOTIFICATION_BASE_URL = "http://localhost:8002/api/v1";
const INGESTION_BASE_URL = "http://localhost:8003/api/v1";
const RAG_CHAT_BASE_URL = "http://localhost:8004/api/v1";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}, baseUrl = IDENTITY_BASE_URL) {
  const token = localStorage.getItem("access_token");
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && (data.detail || data.message)) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / backend unavailable error
    throw new ApiError(
      `Unable to connect to backend server (${baseUrl}). Please verify the service is running.`,
      0,
      null
    );
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refreshToken: (refreshToken) =>
    request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  changePassword: (currentPassword, newPassword) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),

  // Identity & Context (Single source of truth)
  getMyContext: () => request("/identity/me/context"),

  // RBAC
  getRoles: () => request("/roles"),
  getPermissions: () => request("/permissions"),

  // Organization & Branches
  getCompanies: () => request("/companies"),
  getBranches: () => request("/branches"),
  createBranch: (payload) =>
    request("/branches", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteBranch: (branchId) =>
    request(`/branches/${branchId}`, {
      method: "DELETE",
    }),

  // Departments
  getDepartments: () => request("/departments"),
  createDepartment: (payload) =>
    request("/departments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteDepartment: (departmentId) =>
    request(`/departments/${departmentId}`, {
      method: "DELETE",
    }),

  // Users
  getUsers: () => request("/users"),
  createUser: (payload) =>
    request("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteUser: (userId) =>
    request(`/users/${userId}`, {
      method: "DELETE",
    }),

  // Notifications (Port 8002)
  sendTempPasswordEmail: (payload) =>
    request(
      "/notify/send-temp-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      NOTIFICATION_BASE_URL
    ),

  // Document Ingestion (Port 8003)
  getIngestedDocuments: () =>
    request("/ingestion/documents", { method: "GET" }, INGESTION_BASE_URL),

  uploadDocumentFile: (formData) =>
    request(
      "/ingestion/upload",
      {
        method: "POST",
        body: formData,
      },
      INGESTION_BASE_URL
    ),

  ingestTextContent: (payload) =>
    request(
      "/ingestion/text",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      INGESTION_BASE_URL
    ),

  // RAG Chat & History (Port 8004)
  getConversations: () =>
    request("/chat/conversations", { method: "GET" }, RAG_CHAT_BASE_URL),

  createConversation: (title) =>
    request(
      "/chat/conversations",
      {
        method: "POST",
        body: JSON.stringify({ title }),
      },
      RAG_CHAT_BASE_URL
    ),

  getConversation: (conversationId) =>
    request(
      `/chat/conversations/${conversationId}`,
      { method: "GET" },
      RAG_CHAT_BASE_URL
    ),

  deleteConversation: (conversationId) =>
    request(
      `/chat/conversations/${conversationId}`,
      { method: "DELETE" },
      RAG_CHAT_BASE_URL
    ),
};
