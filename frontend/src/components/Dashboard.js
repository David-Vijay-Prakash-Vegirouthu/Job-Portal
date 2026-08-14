import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../services/api";
import "./Dashboard.css";

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

function Dashboard() {
  const navigate = useNavigate();

  const currentUserId   = Number(localStorage.getItem("userId"));
  const currentUserName = localStorage.getItem("userName") || "User";
  const currentEmail    = localStorage.getItem("userEmail") || "";

  // ── Form State ─────────────────────────────────────────────────────────────
  const [title, setTitle]           = useState("");
  const [company, setCompany]       = useState("");
  const [location, setLocation]     = useState("");
  const [description, setDescription] = useState("");
  const [jobs, setJobs]             = useState([]);
  const [editId, setEditId]         = useState(null);

  // ── Search & Filter State ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]       = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeTab, setActiveTab]           = useState("all"); // 'all' | 'my-jobs' | 'my-applications'

  // ── User Applications State (Job Seeker View) ──────────────────────────────
  const [userApplications, setUserApplications]       = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // ── Apply Modal State ──────────────────────────────────────────────────────
  const [applyJob, setApplyJob]         = useState(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [resumeFile, setResumeFile]     = useState(null);

  // ── Applicants Panel State (Employer View) ─────────────────────────────────
  const [viewApplicantsJob, setViewApplicantsJob] = useState(null);
  const [applicants, setApplicants]               = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs`);
      const { ok, data, raw } = await parseApiResponse(response);
      if (!ok) {
        console.error("Failed to fetch jobs:", raw);
        return;
      }
      setJobs(data || []);
    } catch (e) {
      console.error("Network error fetching jobs:", e.message);
    }
  };

  const fetchUserApplications = async () => {
    if (!currentUserId) return;
    setApplicationsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/user/${currentUserId}`);
      const { ok, data } = await parseApiResponse(res);
      if (ok) {
        setUserApplications(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch user applications:", e.message);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) { navigate("/"); return; }
    fetchJobs();
    fetchUserApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ── Form Helpers ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(""); setCompany(""); setLocation(""); setDescription(""); setEditId(null);
  };

  const handleEdit = (job) => {
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setDescription(job.description || "");
    setEditId(job.id);
  };

  // ── Delete Job ─────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/jobs/${id}?userId=${currentUserId}`,
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

  // ── Create / Update Job ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim() || !company.trim() || !location.trim()) {
      alert("Please fill in Job Title, Company, and Location.");
      return;
    }
    const job = { title, company, location, description };
    try {
      if (editId) {
        const res = await fetch(
          `${API_BASE}/api/jobs/${editId}?userId=${currentUserId}`,
          { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(job) }
        );
        if (res.status === 403) { alert("Not authorised to edit this job."); resetForm(); return; }
      } else {
        await fetch(`${API_BASE}/api/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...job, userId: currentUserId }),
        });
      }
      resetForm();
      fetchJobs();
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  // ── Apply Flow ─────────────────────────────────────────────────────────────
  const openApplyModal = (job) => {
    setApplyJob(job);
    setApplyMessage("");
    setResumeFile(null);
  };

  const handleApplySubmit = async () => {
    if (!applyJob) return;

    if (!resumeFile) {
      alert("Please select your resume (PDF format required)");
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

      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        body: formData
      });

      const { ok, status, data, raw } = await parseApiResponse(res);

      if (status === 409) {
        alert("You have already applied for this job!");
      } else if (ok) {
        alert(`Successfully applied for "${applyJob.title}" 🎉`);
        setApplyJob(null);
        setResumeFile(null);
        fetchUserApplications();
      } else {
        alert("Application failed: " + (data?.error || raw || "Unknown error"));
      }

    } catch (e) {
      alert("Network error: " + e.message);
    } finally {
      setApplyLoading(false);
    }
  };

  // ── View Applicants (Employer View) ────────────────────────────────────────
  const handleViewApplicants = async (job) => {
    setViewApplicantsJob(job);
    setApplicantsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/job/${job.id}`);
      const { ok, data, raw } = await parseApiResponse(res);
      if (!ok) {
        alert(data?.message || data?.error || raw || "Failed to load applicants");
      } else {
        setApplicants(data || []);
      }
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

  // ── Computations for Jobs & Filtering ─────────────────────────────────────
  const myJobs = jobs.filter((j) => j.userId === currentUserId);
  
  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.description && j.description.toLowerCase().includes(q));

    const matchesLocation = !locationFilter ||
      j.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // Extract unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));

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

      {/* ── Body Grid ── */}
      <div className="dash-body">

        {/* ── Sidebar Form ── */}
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

        {/* ── Main Content Area ── */}
        <section className="jobs-panel">

          {/* Stat Cards */}
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
            <div className="stat-card">
              <div className="stat-icon blue" style={{ background: "rgba(125,150,255,0.15)", color: "#7d96ff" }}>📄</div>
              <div>
                <div className="stat-val">{userApplications.length}</div>
                <div className="stat-lbl">My Applications</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="dash-tabs">
            <button
              className={`dash-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Jobs <span className="tab-badge">{jobs.length}</span>
            </button>
            <button
              className={`dash-tab ${activeTab === "my-jobs" ? "active" : ""}`}
              onClick={() => setActiveTab("my-jobs")}
            >
              My Postings <span className="tab-badge">{myJobs.length}</span>
            </button>
            <button
              className={`dash-tab ${activeTab === "my-applications" ? "active" : ""}`}
              onClick={() => setActiveTab("my-applications")}
            >
              My Applications <span className="tab-badge">{userApplications.length}</span>
            </button>
          </div>

          {/* ══ TAB 1: ALL JOBS ════════════════════════════════════════════════ */}
          {activeTab === "all" && (
            <>
              {/* Search & Location Filter Bar */}
              <div className="search-filter-bar">
                <div className="search-input-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="filter-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {(searchQuery || locationFilter) && (
                  <button
                    className="btn-clear-filter"
                    onClick={() => { setSearchQuery(""); setLocationFilter(""); }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="jobs-header">
                <h2 className="jobs-title">Available Opportunities</h2>
                <span className="jobs-count">{filteredJobs.length} results</span>
              </div>

              <div className="jobs-grid">
                {filteredJobs.length === 0 ? (
                  <div className="jobs-empty">
                    <div className="jobs-empty-icon">🔍</div>
                    <p className="jobs-empty-text">No jobs found matching your criteria.<br />Try clearing filters or posting a new job.</p>
                  </div>
                ) : (
                  filteredJobs.map((job) => {
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
            </>
          )}

          {/* ══ TAB 2: MY POSTINGS ═════════════════════════════════════════════ */}
          {activeTab === "my-jobs" && (
            <>
              <div className="jobs-header">
                <h2 className="jobs-title">Jobs Posted By You</h2>
                <span className="jobs-count">{myJobs.length} postings</span>
              </div>

              <div className="jobs-grid">
                {myJobs.length === 0 ? (
                  <div className="jobs-empty">
                    <div className="jobs-empty-icon">📭</div>
                    <p className="jobs-empty-text">You haven't posted any jobs yet.<br />Use the form on the left to post a job.</p>
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
            </>
          )}

          {/* ══ TAB 3: MY APPLICATIONS ════════════════════════════════════════ */}
          {activeTab === "my-applications" && (
            <>
              <div className="jobs-header">
                <h2 className="jobs-title">My Submitted Applications</h2>
                <span className="jobs-count">{userApplications.length} applications</span>
              </div>

              {applicationsLoading ? (
                <div className="jobs-empty">Loading applications...</div>
              ) : userApplications.length === 0 ? (
                <div className="jobs-empty">
                  <div className="jobs-empty-icon">📄</div>
                  <p className="jobs-empty-text">You haven't applied for any jobs yet.<br />Browse "All Jobs" and click Apply!</p>
                </div>
              ) : (
                <div className="jobs-grid">
                  {userApplications.map((app) => {
                    const targetJob = jobs.find(j => j.id === app.jobId);
                    return (
                      <div className="job-card" key={app.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div className="job-card-title">{targetJob ? targetJob.title : `Job #${app.jobId}`}</div>
                          <span className="app-status-badge">Submitted</span>
                        </div>
                        <div className="job-card-meta" style={{ marginTop: "10px" }}>
                          {targetJob && <div className="meta-row"><span>🏢</span><span>{targetJob.company}</span></div>}
                          {targetJob && <div className="meta-row"><span>📍</span><span>{targetJob.location}</span></div>}
                          <div className="meta-row"><span>🕒</span><span>Applied: {new Date(app.appliedAt).toLocaleString()}</span></div>
                          {app.message && <div className="meta-row"><span>💬</span><span>"{app.message}"</span></div>}
                        </div>
                        <div className="job-actions" style={{ marginTop: "14px" }}>
                          <a
                            href={`${API_BASE}/uploads/${app.resumePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-applicants"
                            style={{ textDecoration: "none", textAlign: "center" }}
                          >
                            📄 View Uploaded Resume
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </section>
      </div>

      {/* ══ APPLY MODAL ════════════════════════════════════════════════════════ */}
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

            <div className="modal-info-row">
              <div className="modal-info-item">
                <span className="modal-info-label">Applicant Name</span>
                <span className="modal-info-value">{currentUserName}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Applicant Email</span>
                <span className="modal-info-value">{currentEmail || "Not set"}</span>
              </div>
            </div>

            <div className="fg" style={{ marginTop: "16px" }}>
              <label>Cover Note <span style={{ color: "#8892b0", fontWeight: 400 }}>(optional)</span></label>
              <textarea
                placeholder="Write a short message to the recruiter..."
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                style={{ minHeight: "100px" }}
              />
            </div>

            <div className="fg" style={{ marginTop: "10px" }}>
              <label>Upload Resume (PDF only)</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
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

      {/* ══ APPLICANTS MODAL (Employer View) ══════════════════════════════════ */}
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
                No one has applied for this position yet.
              </div>
            ) : (
              <div className="applicants-list">
                {applicants.map((a) => (
                  <div className="applicant-card" key={a.id}>
                    <div className="applicant-avatar">{a.applicantName?.charAt(0).toUpperCase()}</div>
                    <div className="applicant-info">
                      <div className="applicant-name">{a.applicantName}</div>
                      <div className="applicant-email">
                        <a href={`mailto:${a.applicantEmail}`}>{a.applicantEmail}</a>
                      </div>
                      <div style={{ marginTop: "5px" }}>
                        <a
                          href={`${API_BASE}/uploads/${a.resumePath}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#4f6ef7", textDecoration: "none", fontWeight: 600 }}
                        >
                          📄 View Resume PDF
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