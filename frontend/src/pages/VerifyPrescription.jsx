import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, ShieldX, ShieldAlert, Stethoscope, Building2, Calendar, Hash } from "lucide-react";
import { AppContext } from "../context/AppContext";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";

// Public page — no login required. Deliberately renders only what the
// backend's public /api/medical-records/verify/:token endpoint returns:
// prescription ID, status, issue date, prescribing doctor + hospital. No
// diagnosis, medications, or patient information ever reaches this page —
// that's the whole point of the public/authorized-access split.
const VerifyPrescription = () => {
  const { backendUrl } = useContext(AppContext);
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, verification: null, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/medical-records/verify/${token}`);
        if (data.success) {
          setState({ loading: false, verification: data.verification, error: "" });
        } else {
          setState({ loading: false, verification: null, error: data.message || "Prescription not found" });
        }
      } catch (error) {
        setState({
          loading: false,
          verification: null,
          error: error.response?.data?.message || "Prescription not found or invalid",
        });
      }
    })();
  }, [backendUrl, token]);

  const { loading, verification, error } = state;
  const isRevoked = verification?.status === "revoked";

  return (
    <div className="flex justify-center py-14">
      <div className="w-full max-w-lg">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-text-primary">CuraLink</h1>
          <p className="text-text-muted text-sm mt-1">Prescription Verification</p>
        </div>

        <div className="card p-8">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              <p className="text-text-muted text-sm">Verifying…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <ShieldX size={44} className="text-danger" />
              <p className="text-lg font-bold text-text-primary">Not Verified</p>
              <p className="text-text-secondary text-sm">{error}</p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center text-center gap-2 mb-6 pb-6 border-b border-slate-100">
                {isRevoked ? (
                  <ShieldAlert size={44} className="text-warning" />
                ) : (
                  <ShieldCheck size={44} className="text-success" />
                )}
                <p className="text-lg font-bold text-text-primary">
                  {isRevoked ? "Prescription Revoked" : "Verified Prescription"}
                </p>
                <span className={`badge ${isRevoked ? "badge-amber" : "badge-green"} text-[11px]`}>
                  {verification.status?.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Hash size={15} className="text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">Prescription ID</p>
                    <p className="font-semibold text-text-primary">{verification.prescriptionId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={15} className="text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">Issued</p>
                    <p className="font-semibold text-text-primary">{formatDate(verification.issuedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stethoscope size={15} className="text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">Doctor</p>
                    <p className="font-semibold text-text-primary">
                      {verification.doctor?.name}
                      {verification.doctor?.speciality ? ` — ${verification.doctor.speciality}` : ""}
                    </p>
                  </div>
                </div>
                {verification.hospital && (
                  <div className="flex items-center gap-3">
                    <Building2 size={15} className="text-secondary shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">Hospital</p>
                      <p className="font-semibold text-text-primary">{verification.hospital}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-5">
          This page confirms authenticity only. Full prescription details are available to the patient and to
          authorized pharmacies.
        </p>
      </div>
    </div>
  );
};

export default VerifyPrescription;
