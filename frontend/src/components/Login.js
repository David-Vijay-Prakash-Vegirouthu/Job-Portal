import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8080" : window.location.origin);

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
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const { ok, status, data, raw } = await parseApiResponse(response);

    if (!ok) {
      const message = data?.message || data?.error || raw || `Login failed with status ${status}`;
      alert(message);
      return;
    }

    if (data?.message === "Login Successful") {
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", email);
      navigate("/dashboard");
    } else {
      alert(data?.message || "Login failed");
    }

    if (data.message === "Login Successful") {
      localStorage.setItem("userId",    data.userId);
      localStorage.setItem("userName",  data.name);
      localStorage.setItem("userEmail", email);   // save email for apply modal
      navigate("/dashboard");
    } else {
      alert(data.message);
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
        <p className="auth-sub">Sign in to manage your job listings</p>
        <div className="fg">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="fg">
          <label>Password</label>
          <input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={handleLogin}>Sign In →</button>
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