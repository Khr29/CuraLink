import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import jsPDF from "jspdf";
import {
  Pill,
  Stethoscope,
  Building2,
  Calendar,
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Bell,
} from "lucide-react";
import PortalLayout from "../../components/PortalLayout";
import EmptyState from "../../components/EmptyState";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

// A prescription item may still be in the pre-structured shape (just
// medicine/dosage) if it was written before structured prescriptions
// existed — fall back to those so nothing renders blank.
const medName = (item) => item.medicineName || item.medicine || "";
const medDose = (item) => item.dose || item.dosage || "";

const MedicationCard = ({ item, index }) => (
  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
      <p className="text-sm font-bold text-text-primary">
        {index + 1}. {medName(item)}{item.strength ? ` — ${item.strength}` : ""}
      </p>
      {item.form && <span className="badge badge-slate text-[10px]">{item.form}</span>}
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mb-2">
      {medDose(item) && <span><strong className="text-text-primary">Dose:</strong> {medDose(item)}</span>}
      {item.frequency && <span><strong className="text-text-primary">Frequency:</strong> {item.frequency}</span>}
      {item.route && <span><strong className="text-text-primary">Route:</strong> {item.route}</span>}
      {item.timing && item.timing !== "Anytime" && <span><strong className="text-text-primary">Timing:</strong> {item.timing}</span>}
      {item.duration && <span><strong className="text-text-primary">Duration:</strong> {item.duration}</span>}
      {item.quantity && <span><strong className="text-text-primary">Quantity:</strong> {item.quantity}</span>}
    </div>
    {item.instructions && (
      <p className="text-xs text-text-muted bg-white rounded-lg px-3 py-2 border border-slate-100">{item.instructions}</p>
    )}
  </div>
);

const downloadPrescriptionPdf = (record) => {
  const doc = new jsPDF();
  const marginX = 16;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CuraLink — Prescription", marginX, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Doctor: ${record.doctorId?.name || "-"}`, marginX, y); y += 6;
  if (record.hospitalId?.name) { doc.text(`Hospital: ${record.hospitalId.name}`, marginX, y); y += 6; }
  doc.text(`Date: ${formatDate(record.createdAt)}`, marginX, y); y += 6;
  if (record.diagnosis) {
    const diagLines = doc.splitTextToSize(`Diagnosis: ${record.diagnosis}`, 180);
    doc.text(diagLines, marginX, y);
    y += diagLines.length * 6;
  }
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Medications", marginX, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  (record.prescription || []).forEach((item, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${medName(item)}${item.strength ? ` — ${item.strength}` : ""}`, marginX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const details = [medDose(item), item.frequency, item.route, item.timing !== "Anytime" ? item.timing : "", item.duration ? `for ${item.duration}` : ""]
      .filter(Boolean).join(", ");
    if (details) {
      const lines = doc.splitTextToSize(details, 174);
      doc.text(lines, marginX + 6, y);
      y += lines.length * 5.5;
    }
    if (item.instructions) {
      const lines = doc.splitTextToSize(`Note: ${item.instructions}`, 174);
      doc.text(lines, marginX + 6, y);
      y += lines.length * 5.5;
    }
    y += 4;
  });

  if (record.notes) {
    if (y > 260) { doc.addPage(); y = 20; }
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Doctor's Notes", marginX, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(record.notes, 180), marginX, y);
  }

  doc.save(`prescription-${(record.doctorId?.name || "doctor").replace(/\s+/g, "-")}-${formatDate(record.createdAt)}.pdf`);
};

const PrescriptionDetail = ({ record, onBack }) => (
  <div>
    <button onClick={onBack} className="btn btn-ghost btn-sm mb-5 print:hidden">
      <ArrowLeft size={14} /> Back to Prescriptions
    </button>

    <div id="prescription-printable" className="card p-7">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-1">Prescription</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5"><Stethoscope size={13} className="text-secondary" /> {record.doctorId?.name}</span>
            {record.hospitalId?.name && (
              <span className="flex items-center gap-1.5"><Building2 size={13} className="text-secondary" /> {record.hospitalId.name}</span>
            )}
            <span className="flex items-center gap-1.5"><Calendar size={13} className="text-secondary" /> {formatDate(record.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={() => downloadPrescriptionPdf(record)} className="btn btn-secondary btn-sm">
            <Download size={14} /> Download PDF
          </button>
          <button onClick={() => window.print()} className="btn btn-ghost btn-sm">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {record.diagnosis && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Diagnosis</p>
          <p className="text-sm text-text-secondary">{record.diagnosis}</p>
        </div>
      )}

      <div className="mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Pill size={12} /> Medications ({record.prescription?.length || 0})
        </p>
        <div className="flex flex-col gap-3">
          {(record.prescription || []).map((item, i) => <MedicationCard key={i} item={item} index={i} />)}
        </div>
      </div>

      {record.notes && (
        <div className="mb-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Doctor's Notes</p>
          <p className="text-sm text-text-secondary leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">{record.notes}</p>
        </div>
      )}

      {/* Future-ready: medication reminders / refill tracking will surface
          per medication once that feature exists — left as a visual stub
          rather than wired-up logic. */}
      <div className="mt-5 pt-5 border-t border-slate-100 print:hidden">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Bell size={13} /> Medication reminders and refill tracking are coming soon.
        </div>
      </div>
    </div>
  </div>
);

const PrescriptionsPage = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/medical-records/mine`, {
          headers: { token },
          params: { status: "finalized", hasPrescription: "true" },
        });
        if (data.success) setRecords(data.records);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, token]);

  const selectedId = searchParams.get("record");
  const selected = useMemo(() => records.find((r) => r._id === selectedId) || null, [records, selectedId]);

  if (selected) {
    return (
      <PortalLayout>
        <PrescriptionDetail record={selected} onBack={() => setSearchParams({})} />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="mb-7">
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Prescriptions</h1>
        <p className="text-text-muted mt-1">Every prescription your doctors have issued you, in one place.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => <div key={i} className="profile-section animate-pulse h-24" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="profile-section">
          <EmptyState icon={Pill} title="No Prescriptions Yet" subtitle="Prescriptions your doctor finalizes will appear here." />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map((record) => (
            <button
              key={record._id}
              onClick={() => setSearchParams({ record: record._id })}
              className="card w-full text-left p-5"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-text-primary">{record.doctorId?.name}</span>
                    <span className="badge badge-teal text-[10px]">
                      <Pill size={10} /> {record.prescription.length} medicine{record.prescription.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    {record.doctorId?.speciality}
                    {record.hospitalId?.name ? ` · ${record.hospitalId.name}` : ""} · {formatDate(record.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-3 line-clamp-2">{record.diagnosis || "No diagnosis recorded."}</p>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1.5">
                <FileText size={11} /> {record.prescription.map(medName).filter(Boolean).slice(0, 3).join(", ")}
                {record.prescription.length > 3 ? "…" : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </PortalLayout>
  );
};

export default PrescriptionsPage;
