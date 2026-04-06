import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const currentUserId   = Number(localStorage.getItem("userId"));
  const currentUserName = localStorage.getItem("userName") || "User";
  const currentEmail    = localStorage.getItem("userEmail") || "";

  const [title, setTitle]           = useState("");
  const [company, setCompany]       = useState("");
  const [location, setLocation]     = useState("");
  const [description, setDescription] = useState("");
  const [jobs, setJobs]             = useState([]);
  const [editId, setEditId]         = useState(null);

  // ── Apply modal state ──────────────────────────────────────────────────────
  const [applyJob, setApplyJob]       = useState(null);   // job being applied to
  const [applyMessage, setApplyMessage] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

  // ── Applicants panel state (for job owners) ────────────────────────────────
  const [viewApplicantsJob, setViewApplicantsJob] = useState(null);
  const [applicants, setApplicants]               = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  
  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchJobs = () => {
    fetch("http://localhost:8080/api/jobs")
      .then((r) => r.json())
      .then((data) => setJobs(data));
  };

  useEffect(() => {
    if (!currentUserId) { navigate("/"); return; }
    fetchJobs();
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(""); setCompany(""); setLocation(""); setDescription(""); setEditId(null);
  };

  const handleEdit = (job) => {
    setTitle(job.title); setCompany(job.company);
    setLocation(job.location); setDescription(job.description || "");
    setEditId(job.id);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/jobs/${id}?userId=${currentUserId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Delete failed: " + (err.error || `Server error ${res.status}`));
        return;
      }
      fetchJobs();
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  // ── Create / Update ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const job = { title, company, location, description };
    if (editId) {
      const res = await fetch(
        `http://localhost:8080/api/jobs/${editId}?userId=${currentUserId}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(job) }
      );
      if (res.status === 403) { alert("Not authorised to edit this job."); resetForm(); return; }
    } else {
      await fetch("http://localhost:8080/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...job, userId: currentUserId }),
      });
    }
    resetForm(); fetchJobs();
  };

  // ── Apply flow ─────────────────────────────────────────────────────────────
  const openApplyModal = (job) => {
    setApplyJob(job);
    setApplyMessage("");
  };

  const handleApplySubmit = async () => {
  if (!applyJob) return;

  if (!resumeFile) {
    alert("Please upload resume PDF");
    return;
  }

  setApplyLoading(true);

  try {
    const formData = new FormData();
    formData.append("jobId", applyJob.id);
    formData.append("applicantId", currentUserId);
    formData.append("applicantName", currentUserName);
    formData.append("applicantEmail", currentEmail);
    formData.append("message", applyMessage);
    formData.append("resume", resumeFile);

    const res = await fetch("http://localhost:8080/api/applications", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.status === 409) {
      alert("You have already applied for this job!");
    } else if (res.ok) {
      alert(`Successfully applied for "${applyJob.title}" 🎉`);
      setApplyJob(null);
      setResumeFile(null);
    } else {
      alert("Application failed: " + (data.error || "Unknown error"));
    }

  } catch (e) {
    alert("Network error: " + e.message);
  } finally {
    setApplyLoading(false);
  }
};

  // ── View applicants (job owner) ────────────────────────────────────────────
  const handleViewApplicants = async (job) => {
    setViewApplicantsJob(job);
    setApplicantsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/applications/job/${job.id}`);
      const data = await res.json();
      setApplicants(data);
    } catch (e) {
      alert("Failed to load applicants: " + e.message);
    } finally {
      setApplicantsLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const myJobs = jobs.filter((j) => j.userId === currentUserId);
  const otherJobs = jobs.filter((j) => j.userId !== currentUserId);

  return (
    <div className="dash">

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-icon">💼</div>
          <span className="topbar-name">JobPortal</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-label">👋 {currentUserName}</span>
          <button className="btn-logout" onClick={handleLogout}>⎋ Logout</button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="dash-body">

        {/* ── Sidebar form ── */}
        <aside>
          <div className="form-panel">
            <div className="fp-header">
              <span className="fp-title">{editId ? "Edit Job" : "Post a Job"}</span>
              <span className={`fp-badge ${editId ? "editing" : "new"}`}>
                {editId ? "Editing" : "New"}
              </span>
            </div>
            <div className="fg">
              <label>Job Title</label>
              <input placeholder="e.g. Frontend Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="fg">
              <label>Company</label>
              <input placeholder="e.g. Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="fg">
              <label>Location</label>
              <input placeholder="e.g. Hyderabad, Remote" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="fg">
              <label>Description</label>
              <textarea placeholder="Enter job description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            {editId ? (
              <>
                <button className="btn-update" onClick={handleSubmit}>✎ Update Job</button>
                <button className="btn-cancel" onClick={resetForm}>Cancel</button>
              </>
            ) : (
              <button className="btn-add" onClick={handleSubmit}>+ Post Job</button>
            )}
          </div>
        </aside>

        {/* ── Jobs section ── */}
        <section className="jobs-panel">

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon blue">📋</div>
              <div>
                <div className="stat-val">{jobs.length}</div>
                <div className="stat-lbl">Total Postings</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon teal">🙋</div>
              <div>
                <div className="stat-val">{myJobs.length}</div>
                <div className="stat-lbl">My Postings</div>
              </div>
            </div>
          </div>

          <div className="jobs-header">
            <h2 className="jobs-title">All Job Listings</h2>
            <span className="jobs-count">{jobs.length} jobs</span>
          </div>

         <div className="jobs-grid">
  {jobs.length === 0 ? (
    <div className="jobs-empty">
      <div className="jobs-empty-icon">📭</div>
      <p className="jobs-empty-text">No job postings yet.<br />Use the form to add the first listing.</p>
    </div>
  ) : (
    otherJobs.map((job) => {
      const isOwner = job.userId === null || job.userId === currentUserId;
      return (
        <div className={`job-card ${isOwner ? "job-card--owned" : ""}`} key={job.id}>
          {isOwner && <span className="owner-badge">✦ Your Posting</span>}
          <div className="job-card-title">{job.title}</div>
          <div className="job-card-meta">
            <div className="meta-row"><span>🏢</span><span>{job.company}</span></div>
            <div className="meta-row"><span>📍</span><span>{job.location}</span></div>
            {job.description && (
              <div className="meta-row"><span>📝</span><span>{job.description}</span></div>
            )}
          </div>
          <div className="job-actions">
            {isOwner ? (
              <>
                <button className="btn-edit" onClick={() => handleEdit(job)}>✎ Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(job.id)}>🗑 Delete</button>
                <button className="btn-applicants" onClick={() => handleViewApplicants(job)}>
                  👥 Applicants
                </button>
              </>
            ) : (
              <button className="btn-apply" onClick={() => openApplyModal(job)}>
                🚀 Apply
              </button>
            )}
          </div>
        </div>
      );
    })
  )}
</div>
</section>

{/* ✅ ADDED: MY JOB POSTINGS SECTION */}
<div className="jobs-header" style={{ marginTop: "30px" }}>
  <h2 className="jobs-title">My Job Postings</h2>
</div>

<div className="jobs-grid">
  {myJobs.length === 0 ? (
    <div className="jobs-empty">
      <div className="jobs-empty-icon">📭</div>
      <p className="jobs-empty-text">No jobs posted by you</p>
    </div>
  ) : (
    myJobs.map((job) => (
      <div className="job-card job-card--owned" key={job.id}>
        <span className="owner-badge">✦ Your Posting</span>

        <div className="job-card-title">{job.title}</div>

        <div className="job-card-meta">
          <div className="meta-row"><span>🏢</span><span>{job.company}</span></div>
          <div className="meta-row"><span>📍</span><span>{job.location}</span></div>
          {job.description && (
            <div className="meta-row"><span>📝</span><span>{job.description}</span></div>
          )}
        </div>

        <div className="job-actions">
          <button className="btn-edit" onClick={() => handleEdit(job)}>✎ Edit</button>
          <button className="btn-delete" onClick={() => handleDelete(job.id)}>🗑 Delete</button>
          <button className="btn-applicants" onClick={() => handleViewApplicants(job)}>
            👥 Applicants
          </button>
        </div>
      </div>
    ))
  )}
</div>

</div>
{/* ══ APPLY MODAL ══════════════════════════════════════════════════════ */}
{applyJob && (
  <div className="modal-overlay" onClick={() => setApplyJob(null)}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div>
          <div className="modal-title">Apply for {applyJob.title}</div>
          <div className="modal-sub">{applyJob.company} · {applyJob.location}</div>
        </div>
        <button className="modal-close" onClick={() => setApplyJob(null)}>✕</button>
      </div>

      {/* Read-only applicant info pulled from localStorage */}
      <div className="modal-info-row">
        <div className="modal-info-item">
          <span className="modal-info-label">Your Name</span>
          <span className="modal-info-value">{currentUserName}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Your Email</span>
          <span className="modal-info-value">{currentEmail || "Not set — update your profile"}</span>
        </div>
      </div>

      <div className="fg" style={{ marginTop: "16px" }}>
        <label>Cover Note <span style={{ color: "#3a4060", fontWeight: 400 }}>(optional)</span></label>
        <textarea
          placeholder="Write a short message to the recruiter..."
          value={applyMessage}
          onChange={(e) => setApplyMessage(e.target.value)}
          style={{ minHeight: "100px" }}
        />
      </div>

      <div className="fg" style={{ marginTop: "10px" }}>
        <label>Upload Resume (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResumeFile(e.target.files[0])}
        />
      </div>

      <div className="modal-actions">
        <button className="btn-cancel" onClick={() => setApplyJob(null)}>Cancel</button>
        <button className="btn-add" onClick={handleApplySubmit} disabled={applyLoading}>
          {applyLoading ? "Submitting…" : "🚀 Submit Application"}
        </button>
      </div>
    </div>
  </div>
)}

{/* ══ APPLICANTS MODAL (owner view) ════════════════════════════════════ */}
{viewApplicantsJob && (
  <div className="modal-overlay" onClick={() => setViewApplicantsJob(null)}>
    <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div>
          <div className="modal-title">Applicants — {viewApplicantsJob.title}</div>
          <div className="modal-sub">{viewApplicantsJob.company} · {viewApplicantsJob.location}</div>
        </div>
        <button className="modal-close" onClick={() => setViewApplicantsJob(null)}>✕</button>
      </div>

      {applicantsLoading ? (
        <div className="applicants-empty">Loading applicants…</div>
      ) : applicants.length === 0 ? (
        <div className="applicants-empty">
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📭</div>
          No one has applied yet.
        </div>
      ) : (
        <div className="applicants-list">
          {applicants.map((a, i) => (
            <div className="applicant-card" key={a.id}>
              <div className="applicant-avatar">{a.applicantName?.charAt(0).toUpperCase()}</div>
              <div className="applicant-info">
                <div className="applicant-name">{a.applicantName}</div>

                <div className="applicant-email">
                  <a href={`mailto:${a.applicantEmail}`}>{a.applicantEmail}</a>
                </div>

                {/* ✅ NEW: VIEW RESUME */}
                <div style={{ marginTop: "5px" }}>
                  <a
                    href={`http://localhost:8080/${a.resumePath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📄 View Resume
                  </a>
                </div>

                {a.message && (
                  <div className="applicant-message">"{a.message}"</div>
                )}

                <div className="applicant-time">
                  Applied: {new Date(a.appliedAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

</div>
);
}

export default Dashboard;