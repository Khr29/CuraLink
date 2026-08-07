import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock, Monitor, Smartphone, LogOut, ShieldCheck } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import PortalLayout from "../../components/PortalLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
        <Input
          type="password"
          placeholder="Current password"
          value={form.currentPassword}
          onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="New password"
          value={form.newPassword}
          onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          required
        />
        <Button type="submit" disabled={saving} variant="brand-outline" size="sm" className="w-fit">
          {saving ? "Updating..." : "Update Password"}
        </Button>
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
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

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
        <Button
          onClick={() => setConfirmLogoutAll(true)}
          disabled={loggingOutAll}
          variant="brand-ghost"
          size="sm"
          className="border-danger/30 text-danger hover:bg-red-50"
        >
          <LogOut size={13} /> {loggingOutAll ? "Logging out..." : "Log Out All Devices"}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-16 rounded-xl" />
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
                    {session.isCurrent && <Badge variant="teal" className="text-[10px]">This device</Badge>}
                    {session.rememberMe && <Badge variant="slate" className="text-[10px]">Remembered</Badge>}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Signed in {new Date(session.createdAt).toLocaleString()} {session.ip ? `· ${session.ip}` : ""}
                  </p>
                </div>
                {!session.isCurrent && (
                  <Button
                    onClick={() => revokeSession(session._id)}
                    disabled={busyId === session._id}
                    variant="brand-ghost"
                    size="sm"
                    className="border-danger/30 text-danger hover:bg-red-50 flex-shrink-0"
                  >
                    {busyId === session._id ? "..." : "Revoke"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={confirmLogoutAll} onOpenChange={setConfirmLogoutAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of every device?</AlertDialogTitle>
            <AlertDialogDescription>
              This includes the device you're using right now — you'll need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="solid-destructive"
              onClick={() => {
                setConfirmLogoutAll(false);
                logoutAllSessions();
              }}
            >
              Log Out All Devices
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
