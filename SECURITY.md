# 🔒 Security Policy — HR RAG Assistant Frontend

## Supported Versions

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.0.x   | :white_check_mark: | Active Support |
| < 1.0   | :x:                | Unsupported |

---

## 🛡️ Frontend Security Practices

- **XSS Sanitization**: Real-time markdown and SSE streaming output are sanitized against Cross-Site Scripting (XSS).
- **Secure Token Lifecycle**: JWT tokens are validated with automatic session expiration checks.
- **Client Routing Guards**: Protected Route wrapper enforces client-side role authorization.
- **Continuous Audits**: Dependency auditing via Snyk and Trivy.

---

## 📢 Reporting a Vulnerability

Please report any frontend vulnerabilities or security issues via GitHub's **Private Vulnerability Reporting** feature on the repository:
- 🔗 **[Report a Security Vulnerability](https://github.com/Iamzain804/hr-rag-frontend/security/advisories/new)**

We appreciate your effort in practicing responsible disclosure.
