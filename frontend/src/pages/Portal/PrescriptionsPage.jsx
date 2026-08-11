import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  QrCode,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import PortalLayout from "../../components/PortalLayout";
import EmptyState from "../../components/EmptyState";
import { assets } from "../../assets/assets";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// A prescription item may still be in the pre-structured shape (just
// medicine/dosage) if it was written before structured prescriptions
// existed — fall back to those so nothing renders blank.
const medName = (item) => item.medicineName || item.medicine || "";
const medDose = (item) => item.dose || item.dosage || "";

// Doctor names are sometimes stored with a "Dr." prefix already baked in
// and sometimes without — prepend it only when it's missing so the PDF
// never renders "Dr. Dr. <name>".
const formatDoctorTitle = (name) => {
  const trimmed = (name || "").trim();
  return /^dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
};

const calcAge = (dob) => {
  if (!dob || dob === "Not Selected") return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const diff = Date.now() - birth.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return age > 0 ? `${age} yrs` : "";
};

const formatAddress = (address) => {
  if (!address) return "";
  const { line1, line2, city, state, pincode } = address;
  return [line1, line2, city, state, pincode].filter(Boolean).join(", ");
};

// Fetches a same-origin bundled image (the CuraLink logo) and converts it to
// a data URL so jsPDF's addImage() can embed it — addImage needs base64/
// dataURL bytes, not a bare <img> src path.
const loadImageAsDataUrl = (url) =>
  new Promise((resolve, reject) => {
    fetch(url)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result);
            reader.readAsDataURL(blob);
          })
      )
      .then(resolve)
      .catch(reject);
  });

const CURALINK_BLUE = [37, 99, 235];
const CURALINK_TEAL = [20, 184, 166];
const SLATE_900 = [15, 23, 42];
const SLATE_500 = [100, 116, 139];
const SLATE_border = [226, 232, 240];

const drawAccentBar = (doc, x, y, width, height = 2.2) => {
  const steps = 60;
  const stepWidth = width / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(CURALINK_BLUE[0] + (CURALINK_TEAL[0] - CURALINK_BLUE[0]) * t);
    const g = Math.round(CURALINK_BLUE[1] + (CURALINK_TEAL[1] - CURALINK_BLUE[1]) * t);
    const b = Math.round(CURALINK_BLUE[2] + (CURALINK_TEAL[2] - CURALINK_BLUE[2]) * t);
    doc.setFillColor(r, g, b);
    doc.rect(x + i * stepWidth, y, stepWidth + 0.5, height, "F");
  }
};

// Builds the professional, print-friendly CuraLink prescription PDF. Fetches
// the record's secure QR (server-generated, encodes only a verification
// link — never raw medical data) just before rendering.
const downloadPrescriptionPdf = async ({ record, userData, backendUrl, token }) => {
  let qr = null;
  try {
    const { data } = await axios.get(
      `${backendUrl}/api/medical-records/appointment/${record.appointmentId}/qr`,
      { headers: { token } }
    );
    if (data.success) qr = data;
  } catch (error) {
    console.error(error);
  }

  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageAsDataUrl(assets.logo);
  } catch (error) {
    console.error(error);
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  let y = 18;

  // ---------- Header ----------
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", marginX, y - 6, 14, 14);
    } catch (error) {
      console.error(error);
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...SLATE_900);
  doc.text("CuraLink", marginX + (logoDataUrl ? 18 : 0), y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...CURALINK_TEAL);
  doc.text("Secure Digital Healthcare Platform", marginX + (logoDataUrl ? 18 : 0), y + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_900);
  doc.text("DIGITAL PRESCRIPTION", pageWidth - marginX, y - 3, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_500);
  doc.text(`Prescription ID: ${qr?.prescriptionId || "—"}`, pageWidth - marginX, y + 1.5, { align: "right" });
  doc.text(`Status: ${(qr?.status || "active").toUpperCase()}`, pageWidth - marginX, y + 6, { align: "right" });
  doc.text(`Issued: ${formatDateTime(record.finalizedAt || record.createdAt)}`, pageWidth - marginX, y + 10.5, { align: "right" });

  y += 15;
  drawAccentBar(doc, marginX, y, contentWidth);
  y += 8;

  // ---------- Hospital / Doctor / Patient info blocks ----------
  const infoBlock = (title, lines) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_500);
    doc.text(title.toUpperCase(), marginX, y);
    y += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE_900);
    lines.filter(Boolean).forEach((line) => {
      const wrapped = doc.splitTextToSize(line, contentWidth);
      doc.text(wrapped, marginX, y);
      y += wrapped.length * 4.6;
    });
    y += 2;
  };

  if (record.hospitalId?.name) {
    infoBlock("Hospital", [
      record.hospitalId.name,
      formatAddress(record.hospitalId.address),
      [record.hospitalId.phone, record.hospitalId.email, record.hospitalId.website].filter(Boolean).join("  ·  "),
    ]);
  }

  infoBlock("Doctor", [
    `${formatDoctorTitle(record.doctorId?.name || "-")}${record.doctorId?.degree ? `, ${record.doctorId.degree}` : ""}`,
    record.doctorId?.speciality || "",
    record.doctorId?.licenseNumber ? `License No. ${record.doctorId.licenseNumber}` : "",
  ]);

  const age = calcAge(userData?.dob);
  infoBlock("Patient", [
    userData?.name || "-",
    [age, userData?.gender && userData.gender !== "Not Selected" ? userData.gender : "", userData?.bloodGroup]
      .filter(Boolean)
      .join("  ·  "),
  ]);

  // ---------- Diagnosis / Clinical Notes ----------
  if (record.diagnosis) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_900);
    doc.text("DIAGNOSIS", marginX, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(record.diagnosis, contentWidth);
    doc.text(lines, marginX, y);
    y += lines.length * 4.8 + 4;
  }

  if (record.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CLINICAL NOTES", marginX, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(record.notes, contentWidth);
    doc.text(lines, marginX, y);
    y += lines.length * 4.8 + 4;
  }

  // ---------- Medications table ----------
  const medications = record.prescription || [];
  if (medications.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...SLATE_900);
    doc.text(`MEDICATIONS (${medications.length})`, marginX, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX },
      head: [["Medicine", "Strength", "Dose", "Frequency", "Timing", "Duration", "Route", "Qty"]],
      body: medications.map((item) => [
        medName(item),
        item.strength || "-",
        medDose(item) || "-",
        item.frequency || "-",
        item.timing && item.timing !== "Anytime" ? item.timing : "-",
        item.duration || "-",
        item.route || "-",
        item.quantity || "-",
      ]),
      styles: { fontSize: 8, cellPadding: 2.4, textColor: SLATE_900, lineColor: SLATE_border, lineWidth: 0.2 },
      headStyles: { fillColor: CURALINK_BLUE, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    y = doc.lastAutoTable.finalY + 6;

    const instructions = medications
      .filter((item) => item.instructions?.trim())
      .map((item) => `${medName(item)}: ${item.instructions.trim()}`);
    if (instructions.length > 0) {
      if (y > 255) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("DOCTOR'S INSTRUCTIONS", marginX, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      instructions.forEach((text) => {
        const lines = doc.splitTextToSize(`•  ${text}`, contentWidth);
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(lines, marginX, y);
        y += lines.length * 4.6;
      });
      y += 4;
    }
  }

  // ---------- Issuance line (not a cryptographic signature — see below) ----------
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setDrawColor(...SLATE_border);
  doc.line(marginX, y, marginX + 70, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_500);
  doc.text(`Prescription finalized by ${formatDoctorTitle(record.doctorId?.name || "")}`, marginX, y);
  y += 4.5;
  doc.text("Digitally issued by CuraLink", marginX, y);
  y += 10;

  // ---------- QR verification ----------
  if (qr?.qrDataUrl) {
    if (y > 240) { doc.addPage(); y = 20; }
    const qrSize = 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_900);
    doc.text("VERIFY PRESCRIPTION", marginX, y + 6);
    try {
      doc.addImage(qr.qrDataUrl, "PNG", marginX, y + 9, qrSize, qrSize);
    } catch (error) {
      console.error(error);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_500);
    doc.text("Scan to verify this prescription is authentic.", marginX + qrSize + 6, y + 16);
    doc.text(`Prescription ID: ${qr.prescriptionId}`, marginX + qrSize + 6, y + 21);
  }

  // ---------- Footer on every page ----------
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...SLATE_border);
    doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_500);
    doc.text("CuraLink — Secure Digital Healthcare Platform · Confidential Medical Document", marginX, pageHeight - 9);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX, pageHeight - 9, { align: "right" });
  }

  doc.save(`${qr?.prescriptionId || "prescription"}-${(record.doctorId?.name || "doctor").replace(/\s+/g, "-")}.pdf`);
};

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

const PrescriptionDetail = ({ record, onBack, backendUrl, token, userData }) => {
  const [qr, setQr] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/medical-records/appointment/${record.appointmentId}/qr`,
          { headers: { token } }
        );
        if (!cancelled && data.success) setQr(data);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => { cancelled = true; };
  }, [backendUrl, token, record.appointmentId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPrescriptionPdf({ record, userData, backendUrl, token });
    } finally {
      setDownloading(false);
    }
  };

  const isRevoked = qr?.status === "revoked";

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost btn-sm mb-5 print:hidden">
        <ArrowLeft size={14} /> Back to Prescriptions
      </button>

      <div id="prescription-printable" className="card p-7">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-5 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-text-primary">Prescription</h2>
              {qr?.prescriptionId && (
                <span className={`badge ${isRevoked ? "badge-amber" : "badge-teal"} text-[10px]`}>
                  {qr.prescriptionId}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5"><Stethoscope size={13} className="text-secondary" /> {record.doctorId?.name}</span>
              {record.hospitalId?.name && (
                <span className="flex items-center gap-1.5"><Building2 size={13} className="text-secondary" /> {record.hospitalId.name}</span>
              )}
              <span className="flex items-center gap-1.5"><Calendar size={13} className="text-secondary" /> {formatDate(record.createdAt)}</span>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={handleDownload} disabled={downloading} className="btn btn-secondary btn-sm">
              <Download size={14} /> {downloading ? "Preparing…" : "Download PDF"}
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
          <div className="mb-5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Doctor's Notes</p>
            <p className="text-sm text-text-secondary leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">{record.notes}</p>
          </div>
        )}

        {qr && (
          <div className="mt-5 pt-5 border-t border-slate-100 print:hidden flex items-center gap-4 flex-wrap">
            {qr.qrDataUrl && (
              <img src={qr.qrDataUrl} alt="Verification QR code" className="w-20 h-20 rounded-lg border border-slate-100" />
            )}
            <div>
              <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                {isRevoked ? (
                  <><ShieldAlert size={14} className="text-warning" /> Revoked prescription</>
                ) : (
                  <><ShieldCheck size={14} className="text-success" /> Secure verification</>
                )}
              </p>
              <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                <QrCode size={12} /> Scan the QR or share the verify link with a pharmacy — it shows only enough to confirm authenticity.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bell size={13} /> Medication reminders and refill tracking are coming soon.
          </div>
        </div>
      </div>
    </div>
  );
};

const PrescriptionsPage = () => {
  const { backendUrl, token, userData } = useContext(AppContext);
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
        <PrescriptionDetail record={selected} onBack={() => setSearchParams({})} backendUrl={backendUrl} token={token} userData={userData} />
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
