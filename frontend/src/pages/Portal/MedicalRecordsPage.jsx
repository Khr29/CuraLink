import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { FileText, Lock, Stethoscope, Building2, Pill, Paperclip, X, ArrowRight } from "lucide-react";
import PortalLayout from "../../components/PortalLayout";
import EmptyState from "../../components/EmptyState";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "";

const InfoBlock = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm text-text-secondary leading-relaxed">
      {value || <span className="text-slate-400">Not recorded</span>}
    </p>
  </div>
);

// Full-record detail — read-only for patients (they can view every field
// but never edit; only the doctor who created it can via the doctor portal).
const RecordDetailModal = ({ record, onClose }) => {
  const navigate = useNavigate();
  if (!record) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-100 shadow-card-lg w-full max-w-lg max-h-[85vh] overflow-y-auto p-7 relative"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X size={16} className="text-text-muted" />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <span className="w-11 h-11 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0">
            <FileText size={19} className="text-primary" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Medical Record</h3>
            <p className="text-xs text-text-muted">{formatDate(record.createdAt)}</p>
          </div>
        </div>

        {record.status === "finalized" ? (
          <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold">
            <Lock size={13} /> Finalized on {formatDate(record.finalizedAt)} — this record is locked
          </div>
        ) : (
          <div className="mt-4 badge badge-slate w-fit">Draft</div>
        )}

        <div className="flex items-center gap-4 mt-5 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Stethoscope size={14} className="text-secondary" />
            <span className="text-sm font-semibold text-text-primary">{record.doctorId?.name}</span>
          </div>
          {record.hospitalId?.name && (
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-secondary" />
              <span className="text-sm text-text-secondary">{record.hospitalId.name}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-5">
          <InfoBlock label="Diagnosis" value={record.diagnosis} />
          <InfoBlock label="Doctor's Notes" value={record.notes} />

          {record.prescription?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pill size={12} /> Prescription
              </p>
              {record.status === "finalized" ? (
                <button
                  onClick={() => navigate(`/prescriptions?record=${record._id}`)}
                  className="w-full flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100 hover:border-primary/40 transition-colors text-left"
                >
                  <span className="text-sm text-text-secondary">
                    {record.prescription.length} medicine{record.prescription.length !== 1 ? "s" : ""} prescribed
                  </span>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1 flex-shrink-0">
                    View full prescription <ArrowRight size={12} />
                  </span>
                </button>
              ) : (
                <p className="text-xs text-text-muted bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100">
                  {record.prescription.length} medicine{record.prescription.length !== 1 ? "s" : ""} drafted — available on the Prescriptions page once finalized.
                </p>
              )}
            </div>
          )}

          {record.attachments?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip size={12} /> Attachments
              </p>
              <div className="flex flex-wrap gap-2">
                {record.attachments.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                    {a.fileName || `File ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          {record.versions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Amendment History ({record.versions.length})
              </p>
              <p className="text-xs text-text-muted">
                This record has been updated {record.versions.length} time{record.versions.length !== 1 ? "s" : ""} since it was finalized. Previous versions are preserved for your doctor's and hospital's audit trail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MedicalRecordsPage = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/medical-records/mine`, { headers: { token } });
        if (data.success) setRecords(data.records);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, token]);

  return (
    <PortalLayout>
      <div className="mb-7">
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Medical Records</h1>
        <p className="text-text-muted mt-1">Your diagnoses, prescriptions and doctor's notes — view only.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="profile-section animate-pulse h-24" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="profile-section">
          <EmptyState icon={FileText} title="No Medical Records Yet" subtitle="Records from your completed appointments will appear here once your doctor finalizes them." />
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Timeline connector */}
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

          <div className="flex flex-col gap-5">
            {records.map((record) => (
              <div key={record._id} className="relative">
                <span
                  className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full border-2 border-white"
                  style={{ background: record.status === "finalized" ? "#14B8A6" : "#CBD5E1" }}
                />
                <button
                  onClick={() => setSelected(record)}
                  className="card w-full text-left p-5"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-text-primary">{record.doctorId?.name}</span>
                        <span className={`badge text-[10px] ${record.status === "finalized" ? "badge-green" : "badge-slate"}`}>
                          {record.status === "finalized" ? "Finalized" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">
                        {record.doctorId?.speciality}
                        {record.hospitalId?.name ? ` · ${record.hospitalId.name}` : ""} · {formatDate(record.createdAt)}
                      </p>
                    </div>
                    {record.prescription?.length > 0 && (
                      <span className="badge badge-teal text-[10px]">
                        <Pill size={10} /> {record.prescription.length} medicine{record.prescription.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-3 line-clamp-2">
                    {record.diagnosis || "No diagnosis recorded yet."}
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <RecordDetailModal record={selected} onClose={() => setSelected(null)} />
    </PortalLayout>
  );
};

export default MedicalRecordsPage;
