import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../services/api";
import "./Register.css";

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
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields (Full Name, Email, Password).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const { ok, status, data, raw } = await parseApiResponse(response);
      if (!ok) {
        alert(data?.message || data?.error || raw || `Registration failed with status ${status}`);
        return;
      }
      alert("Account created successfully! Please sign in.");
      navigate("/");
    } catch (e) {
      alert("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRegister();
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

        <div className="new-badge">✦ New Account</div>

        <h2 className="auth-heading">Create account</h2>
        <p className="auth-sub">Start posting jobs or applying for opportunities today</p>

        <div className="fg">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

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
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button className="btn-primary" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account..." : "Create Account →"}
        </button>

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