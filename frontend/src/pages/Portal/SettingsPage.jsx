import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock, Monitor, Smartphone, LogOut, ShieldCheck } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import PortalLayout from "../../components/PortalLayout";

const deviceLabel = (userAgent = "") => {
  if (/mobile/i.test(userAgent)) return { label: "Mobile device", Icon: Smartphone };
  return { label: "Desktop / Browser", Icon: Monitor };
};

const ChangePasswordCard = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/change-password`, form, {
        headers: { token },
      });
      if (data.success) {
        toast.success(data.message);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        localStorage.removeItem("token");
        setToken(false);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-section">
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
        <Lock size={15} className="text-primary" /> Change Password
      </h3>
      <form onSubmit={submit} className="flex flex-col gap-3 max-w-sm">
        <input
          type="password"
          className="input text-sm"
          placeholder="Current password"
          value={form.currentPassword}
          onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
          required
        />
        <input
          type="password"
          className="input text-sm"
          placeholder="New password"
          value={form.newPassword}
          onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
          required
        />
        <input
          type="password"
          className="input text-sm"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          required
        />
        <button type="submit" disabled={saving} className="btn btn-secondary btn-sm w-fit">
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

const SessionsCard = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/sessions`, { headers: { token } });
      if (data.success) setSessions(data.sessions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    if (token) fetchSessions();
  }, [token, fetchSessions]);

  const revokeSession = async (sessionId) => {
    setBusyId(sessionId);
    try {
      const { data } = await axios.delete(`${backendUrl}/api/user/sessions/${sessionId}`, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        fetchSessions();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  const logoutAllSessions = async () => {
    if (!window.confirm("Log out of every device, including this one?")) return;
    setLoggingOutAll(true);
    try {
      await axios.post(`${backendUrl}/api/user/logout-all`, {}, { headers: { token } });
      toast.success("Logged out of all sessions");
      localStorage.removeItem("token");
      setToken(false);
      navigate("/login");
    } catch (error) {
      toast.error("Something went wrong");
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={15} className="text-primary" /> Active Sessions
        </h3>
        <button onClick={logoutAllSessions} disabled={loggingOutAll} className="btn btn-ghost btn-sm border-danger/30 text-danger hover:bg-red-50">
          <LogOut size={13} /> {loggingOutAll ? "Logging out..." : "Log Out All Devices"}
        </button>
      </div>

      {loading ? (
        <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
      ) : sessions.length === 0 ? (
        <p className="text-sm text-text-muted">No active sessions found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => {
            const { label, Icon } = deviceLabel(session.userAgent);
            return (
              <div key={session._id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-text-muted" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    {label}
                    {session.isCurrent && <span className="badge badge-teal text-[10px]">This device</span>}
                    {session.rememberMe && <span className="badge badge-slate text-[10px]">Remembered</span>}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Signed in {new Date(session.createdAt).toLocaleString()} {session.ip ? `· ${session.ip}` : ""}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => revokeSession(session._id)}
                    disabled={busyId === session._id}
                    className="btn btn-ghost btn-sm border-danger/30 text-danger hover:bg-red-50 flex-shrink-0"
                  >
                    {busyId === session._id ? "..." : "Revoke"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => (
  <PortalLayout>
    <div className="mb-6">
      <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Settings</h1>
      <p className="text-text-muted mt-1">Manage your password and where you're signed in.</p>
    </div>

    <div className="flex flex-col gap-6 max-w-2xl">
      <ChangePasswordCard />
      <SessionsCard />
    </div>
  </PortalLayout>
);

export default SettingsPage;
