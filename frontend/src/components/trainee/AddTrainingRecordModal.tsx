import { useState, useCallback } from "react";
import { api } from "../../lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Upload, CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft, FileText } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  programName: string;
  providerName: string;
  providerType: "government" | "private" | "ngo" | "";
  sector: string;
  startDate: string;
  endDate: string;
  status: "completed" | "in_progress" | "dropped" | "";
  skills: string[];
  certificationName: string;
  certificationIssuedDate: string;
  noCertificate: boolean;
}

interface CloudinaryFile {
  publicId: string;
  url: string;
  fileName: string;
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = ["Training Details", "Certificate", "Review & Submit"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8 mt-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-full transition-all ${
                  isDone
                    ? "bg-[#22c55e] text-white shadow-(--shadow-btn-accent)"
                    : isActive
                    ? "bg-[#ff4757] text-white shadow-(--shadow-btn-accent)"
                    : "bg-chassis text-text-muted shadow-(--shadow-recessed)"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                  isActive ? "text-[#ff4757]" : isDone ? "text-[#22c55e]" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`w-12 h-1 mx-2 mb-5 rounded-full ${
                  isDone ? "bg-[#22c55e]" : "bg-[#e2e8f0]"
                }`}
                style={{ boxShadow: isDone ? "0 0 8px rgba(34, 197, 94, 0.4)" : "inset 0 1px 2px rgba(0,0,0,0.1)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Skill Chips Input ────────────────────────────────────────────────────────

function SkillInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  const removeSkill = (skill: string) => onChange(skills.filter((s) => s !== skill));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder='Type a skill and press Enter (e.g. "React")'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          className="flex-1 indus-input"
        />
        <Button type="button" variant="secondary" onClick={addSkill} className="px-6">
          ADD
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 bg-[#f0f2f5] text-text font-bold uppercase tracking-wider text-xs px-3 py-1.5 rounded-md shadow-sm border border-[#e2e8f0]"
            >
              <span className="indus-led-green w-1.5 h-1.5"></span>
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-[#ff4757] transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function AddTrainingRecordModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState<FormData>({
    programName: "",
    providerName: "",
    providerType: "",
    sector: "",
    startDate: "",
    endDate: "",
    status: "",
    skills: [],
    certificationName: "",
    certificationIssuedDate: "",
    noCertificate: false,
  });

  const [certificate, setCertificate] = useState<CloudinaryFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const patch = (updates: Partial<FormData>) => setForm((f) => ({ ...f, ...updates }));

  const handleClose = () => {
    setStep(1);
    setSubmitError("");
    setToast("");
    setCertificate(null);
    setForm({
      programName: "", providerName: "", providerType: "", sector: "",
      startDate: "", endDate: "", status: "", skills: [],
      certificationName: "", certificationIssuedDate: "", noCertificate: false,
    });
    onClose();
  };

  const step1Valid =
    form.programName.trim().length >= 2 &&
    form.providerName.trim().length >= 2 &&
    form.providerType !== "" &&
    form.sector !== "" &&
    form.startDate !== "" &&
    form.status !== "" &&
    form.skills.length > 0;

  const handleNext = () => {
    if (step === 1) {
      setStep(form.status === "completed" ? 2 : 3);
    } else {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(form.status === "completed" ? 2 : 1);
    } else {
      setStep(1);
    }
  };

  const openUploadWidget = useCallback(() => {
    if (!window.cloudinary) {
      alert("Cloudinary widget is not loaded. Please refresh and try again.");
      return;
    }
    setIsUploading(true);
    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo",
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "skill_certificates",
        sources: ["local", "camera"],
        multiple: false,
        maxFileSize: 5000000,
        clientAllowedFormats: ["pdf", "jpg", "jpeg", "png"],
        cropping: false,
        folder: "skill-portal/certificates",
        resourceType: "auto",
      },
      (error, result) => {
        setIsUploading(false);
        if (error) {
          console.error("Cloudinary upload error:", error);
          return;
        }
        if (result.event === "success") {
          setCertificate({
            publicId: result.info.public_id,
            url: result.info.secure_url,
            fileName: result.info.original_filename + "." + result.info.format,
          });
        }
      }
    );
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/trainees/training-records", {
        programName: form.programName,
        providerName: form.providerName,
        providerType: form.providerType,
        sector: form.sector,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        status: form.status,
        skills: form.skills,
        certificateCloudinaryId: certificate?.publicId ?? null,
        certificateUrl: certificate?.url ?? null,
        certificationName: form.certificationName || null,
        certificationIssuedDate: form.certificationIssuedDate || null,
      });

      setToast("Training record added successfully!");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1200);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save training record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3436]/40 backdrop-blur-md px-4 font-sans">
      <div className="bg-[#f0f2f5] shadow-(--shadow-floating) rounded-2xl w-full max-w-xl relative overflow-hidden max-h-[90vh] flex flex-col border border-white/40">
        
        {/* Header */}
        <div className="p-8 pb-4 shrink-0 relative border-b border-[#d1d9e6]">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-text-muted hover:text-[#ff4757] bg-chassis hover:bg-white rounded-lg p-2 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="indus-led-green"></span>
            <span className="indus-label text-[#22c55e]">Training Module</span>
          </div>
          
          <h2 className="text-2xl font-bold text-text tracking-tight mb-2">Add Training Record</h2>
          <p className="text-sm font-medium text-text-muted">Record your training history and upload certificates.</p>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 pt-6">
          <StepIndicator current={step} total={3} />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-8 pb-8 pt-2">

          {/* ─── STEP 1: Training Details ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="indus-label text-text">Training / Course Name *</label>
                <Input
                  className="indus-input w-full"
                  placeholder="e.g. Full Stack Web Development"
                  value={form.programName}
                  onChange={(e) => patch({ programName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="indus-label text-text">Institution / Provider *</label>
                  <Input
                    className="indus-input w-full"
                    placeholder="e.g. Excel Skills Academy"
                    value={form.providerName}
                    onChange={(e) => patch({ providerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="indus-label text-text">Provider Type *</label>
                  <select
                    value={form.providerType}
                    onChange={(e) => patch({ providerType: e.target.value as any })}
                    className="indus-input w-full h-13 px-4"
                  >
                    <option value="">Select type</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="ngo">NGO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="indus-label text-text">Sector *</label>
                <select
                  value={form.sector}
                  onChange={(e) => patch({ sector: e.target.value })}
                  className="indus-input w-full h-13 px-4"
                >
                  <option value="">Select sector</option>
                  {["Manufacturing", "IT", "Construction", "Healthcare", "Retail", "Agriculture", "Other"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="indus-label text-text">Start Date *</label>
                  <Input
                    type="date"
                    className="indus-input w-full"
                    value={form.startDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => patch({ startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="indus-label text-text">End Date</label>
                  <Input
                    type="date"
                    className="indus-input w-full"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => patch({ endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="indus-label text-text">Status *</label>
                <div className="flex gap-3 bg-chassis p-2 rounded-xl shadow-(--shadow-recessed)">
                  {(["completed", "in_progress", "dropped"] as const).map((s) => {
                    const isSelected = form.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => patch({ status: s })}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? "bg-white text-text shadow-sm border border-[#e2e8f0]"
                            : "bg-transparent text-text-muted hover:bg-recessed"
                        }`}
                      >
                        {s === "completed" ? "Completed" : s === "in_progress" ? "In Progress" : "Dropped"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="indus-label text-text flex justify-between">
                  <span>Skills Learned *</span>
                  {form.status === "completed" && <span className="text-[#ff4757]">(min 1 required)</span>}
                </label>
                <SkillInput skills={form.skills} onChange={(s) => patch({ skills: s })} />
              </div>
            </div>
          )}

          {/* ─── STEP 2: Certificate Upload ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-text-muted leading-relaxed">
                Upload the certificate you received. The file goes directly from your browser to our secure storage — no data passes through our servers.
              </p>

              {certificate ? (
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="bg-chassis p-3 rounded-lg text-text">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">{certificate.fileName}</p>
                    <p className="indus-label text-[#22c55e] mt-1">Uploaded successfully</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCertificate(null)}
                    className="text-text-muted hover:text-[#ff4757] p-2 bg-white rounded-md shadow-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : !form.noCertificate ? (
                <button
                  type="button"
                  onClick={openUploadWidget}
                  disabled={isUploading}
                  className="w-full bg-[#f8fafc] border-2 border-dashed border-shadow-dark hover:border-[#3b82f6] hover:bg-[#ebf5ff] rounded-xl p-10 flex flex-col items-center gap-3 text-text-muted hover:text-[#3b82f6] transition-colors focus-visible:ring-2 focus-visible:ring-[#3b82f6] outline-none group shadow-sm"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
                  )}
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {isUploading ? "Opening upload widget..." : "Upload Certificate (PDF or Image)"}
                  </span>
                  <span className="indus-label opacity-70">PDF, JPG, PNG · Max 5MB</span>
                </button>
              ) : null}

              <label className="flex items-center gap-3 cursor-pointer group bg-chassis p-4 rounded-xl shadow-(--shadow-recessed)">
                <input
                  type="checkbox"
                  checked={form.noCertificate}
                  onChange={(e) => {
                    patch({ noCertificate: e.target.checked });
                    if (e.target.checked) setCertificate(null);
                  }}
                  className="w-5 h-5 rounded border-shadow-dark text-[#ff4757] focus:ring-[#ff4757] transition-all bg-white"
                />
                <span className="text-sm font-bold text-text group-hover:text-[#ff4757] transition-colors uppercase tracking-wider">
                  I don't have a certificate
                </span>
              </label>

              <div className="border-t border-[#d1d9e6] pt-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="indus-led-green"></span>
                  <p className="indus-label text-text-muted">Optional Details</p>
                </div>
                
                <div className="space-y-2">
                  <label className="indus-label text-text">Certification Name</label>
                  <Input
                    className="indus-input w-full"
                    placeholder="e.g. FSWD Level 1"
                    value={form.certificationName}
                    onChange={(e) => patch({ certificationName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="indus-label text-text">Certification Issued Date</label>
                  <Input
                    className="indus-input w-full"
                    type="date"
                    value={form.certificationIssuedDate}
                    onChange={(e) => patch({ certificationIssuedDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Review & Submit ─── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-chassis rounded-xl p-6 shadow-(--shadow-recessed) space-y-4">
                <Row label="Course" value={form.programName} />
                <Row label="Provider" value={`${form.providerName} (${form.providerType})`} />
                <Row label="Sector" value={form.sector} />
                <Row label="Period" value={`${form.startDate}${form.endDate ? ` → ${form.endDate}` : ""}`} />
                <Row
                  label="Status"
                  value={form.status === "completed" ? "✅ Completed" : form.status === "in_progress" ? "🔄 In Progress" : "❌ Dropped"}
                />
                <div className="pt-4 border-t border-shadow-dark">
                  <p className="indus-label text-text-muted mb-2">Skills Learned</p>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((s) => (
                      <span key={s} className="bg-white text-text font-bold text-xs px-2.5 py-1 rounded shadow-sm border border-[#e2e8f0]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-shadow-dark">
                  <Row
                    label="Certificate"
                    value={
                      certificate
                        ? `📎 ${certificate.fileName}`
                        : form.noCertificate
                          ? "Not provided"
                          : "Not uploaded"
                    }
                  />
                  {form.certificationName && <div className="mt-2"><Row label="Cert Name" value={form.certificationName} /></div>}
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-3 bg-white border border-[#ff4757] rounded-lg p-4 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-[#ff4757] shrink-0" />
                  <p className="text-sm font-bold text-[#ff4757]">{submitError}</p>
                </div>
              )}

              {toast && (
                <div className="flex items-center gap-3 bg-white border border-[#22c55e] rounded-lg p-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                  <p className="text-sm font-bold text-[#22c55e]">{toast}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-[#d1d9e6] bg-chassis shrink-0 flex gap-4 rounded-b-2xl">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              variant="default"
              onClick={handleNext}
              disabled={step === 1 && !step1Valid}
              className="flex-1"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Submit Record"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="indus-label text-text-muted shrink-0">{label}</span>
      <span className="text-sm font-bold text-text text-right">{value}</span>
    </div>
  );
}
