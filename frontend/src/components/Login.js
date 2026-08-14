import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../services/api";
import "./Login.css";

async function parseApiResponse(response) {
  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data, raw };
}

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const { ok, status, data, raw } = await parseApiResponse(response);

      if (!ok) {
        const message = data?.message || data?.error || raw || `Login failed with status ${status}`;
        alert(message);
        return;
      }

      if (data?.message === "Login Successful") {
        localStorage.setItem("userId",    data.userId);
        localStorage.setItem("userName",  data.name);
        localStorage.setItem("userEmail", email.trim());
        navigate("/dashboard");
      } else {
        alert(data?.message || "Login failed");
      }
    } catch (e) {
      alert("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💼</div>
          <span className="auth-logo-name">JobPortal</span>
          <span className="auth-logo-tag">Find · Post · Hire</span>
        </div>
        <h2 className="auth-heading">Welcome back</h2>
        <p className="auth-sub">Sign in to manage your job listings and applications</p>
        <div className="fg">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="fg">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>
        <div className="auth-sep">or</div>
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <button className="btn-ghost" onClick={() => navigate("/register")}>Create one</button>
        </div>
      </div>
    </div>
  );
}

export default Login;