import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const RAW_API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8080" : window.location.origin);
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

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

function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const { ok, status, data, raw } = await parseApiResponse(response);
    if (!ok) {
      alert(data?.message || data?.error || raw || `Register failed with status ${status}`);
      return;
    }
    alert("Account created successfully!");
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">💼</div>
          <span className="auth-logo-name">JobPortal</span>
          <span className="auth-logo-tag">Find · Post · Hire</span>
        </div>

        <div className="new-badge">✦ New Account</div>

        <h2 className="auth-heading">Create account</h2>
        <p className="auth-sub">Start posting and managing jobs today</p>

        <div className="fg">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="fg">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="fg">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a strong password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={handleRegister}>
          Create Account →
        </button>

        <p className="auth-terms">
          By registering you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

        <div className="auth-sep">or</div>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button className="btn-ghost" onClick={() => navigate("/")}>
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;