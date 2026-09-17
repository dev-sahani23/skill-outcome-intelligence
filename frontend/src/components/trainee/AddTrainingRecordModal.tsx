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
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-indigo-500 text-white ring-2 ring-indigo-400/40"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-[10px] whitespace-nowrap ${isActive ? "text-indigo-400" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`w-12 h-px mx-1 mb-4 ${isDone ? "bg-emerald-500" : "bg-slate-700"}`} />
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
    <div className="space-y-2">
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
          className="bg-slate-950 border-slate-700 text-white flex-1"
        />
        <Button type="button" onClick={addSkill} className="bg-slate-700 hover:bg-slate-600 text-white border-0 px-3">
          Add
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-full"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
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

  // Reset everything when closing
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

  // Step 1 validation gate
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
      // Skip step 2 if not completed
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

  // Cloudinary unsigned upload widget
  const openUploadWidget = useCallback(() => {
    if (!window.cloudinary) {
      alert("Cloudinary widget is not loaded. Please refresh and try again.");
      return;
    }
    setIsUploading(true);
    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo",
        uploadPreset: "skill_certificates",
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

  const totalSteps = form.status === "completed" ? 3 : 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-0 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white mb-1">Add Training Record</h2>
          <p className="text-sm text-slate-400 mb-4">Record your training history and upload certificates.</p>
          <StepIndicator current={step} total={3} />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-2">

          {/* ─── STEP 1: Training Details ─── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Training / Course Name *</label>
                <Input
                  placeholder="e.g. Full Stack Web Development"
                  value={form.programName}
                  onChange={(e) => patch({ programName: e.target.value })}
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Institution / Provider *</label>
                  <Input
                    placeholder="e.g. Excel Skills Academy"
                    value={form.providerName}
                    onChange={(e) => patch({ providerName: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Provider Type *</label>
                  <select
                    value={form.providerType}
                    onChange={(e) => patch({ providerType: e.target.value as any })}
                    className="w-full h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white"
                  >
                    <option value="">Select type</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="ngo">NGO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Sector *</label>
                <select
                  value={form.sector}
                  onChange={(e) => patch({ sector: e.target.value })}
                  className="w-full h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white"
                >
                  <option value="">Select sector</option>
                  {["Manufacturing", "IT", "Construction", "Healthcare", "Retail", "Agriculture", "Other"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Start Date *</label>
                  <Input
                    type="date"
                    value={form.startDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => patch({ startDate: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">End Date</label>
                  <Input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => patch({ endDate: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Status *</label>
                <div className="flex gap-3">
                  {(["completed", "in_progress", "dropped"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => patch({ status: s })}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        form.status === s
                          ? s === "completed"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : s === "in_progress"
                            ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                            : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                          : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      {s === "completed" ? "Completed" : s === "in_progress" ? "In Progress" : "Dropped Out"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Skills Learned *
                  {form.status === "completed" && <span className="text-rose-400 ml-1">(min 1 required)</span>}
                </label>
                <SkillInput skills={form.skills} onChange={(s) => patch({ skills: s })} />
              </div>
            </div>
          )}

          {/* ─── STEP 2: Certificate Upload (completed only) ─── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-slate-400">
                Upload the certificate you received. The file goes directly from your browser to our secure storage — no data passes through our servers.
              </p>

              {certificate ? (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-emerald-500/10 rounded-lg p-2">
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-400 truncate">{certificate.fileName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Uploaded successfully</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCertificate(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : !form.noCertificate ? (
                <button
                  type="button"
                  onClick={openUploadWidget}
                  disabled={isUploading}
                  className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center gap-3 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                  <span className="text-sm font-medium">
                    {isUploading ? "Opening upload widget..." : "Upload Certificate (PDF or Image)"}
                  </span>
                  <span className="text-xs text-slate-600">PDF, JPG, PNG · Max 5MB</span>
                </button>
              ) : null}

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.noCertificate}
                  onChange={(e) => {
                    patch({ noCertificate: e.target.checked });
                    if (e.target.checked) setCertificate(null);
                  }}
                  className="w-4 h-4 rounded border-slate-600 accent-indigo-500"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                  I don't have a certificate (enrollment will still be recorded)
                </span>
              </label>

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Optional Details</p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Certification Name</label>
                  <Input
                    placeholder="e.g. FSWD Level 1"
                    value={form.certificationName}
                    onChange={(e) => patch({ certificationName: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Certification Issued Date</label>
                  <Input
                    type="date"
                    value={form.certificationIssuedDate}
                    onChange={(e) => patch({ certificationIssuedDate: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Review & Submit ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <Row label="Course" value={form.programName} />
                <Row label="Provider" value={`${form.providerName} (${form.providerType})`} />
                <Row label="Sector" value={form.sector} />
                <Row label="Period" value={`${form.startDate}${form.endDate ? ` → ${form.endDate}` : ""}`} />
                <Row
                  label="Status"
                  value={form.status === "completed" ? "✅ Completed" : form.status === "in_progress" ? "🔄 In Progress" : "❌ Dropped Out"}
                />
                <div className="pt-1 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map((s) => (
                      <span key={s} className="bg-indigo-500/10 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800">
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
                  {form.certificationName && <Row label="Cert Name" value={form.certificationName} />}
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {toast && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {toast}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 pt-4 border-t border-slate-800 flex-shrink-0 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              onClick={handleBack}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !step1Valid}
              className={`flex-1 text-white ${
                step === 1 && !step1Valid
                  ? "bg-slate-700 cursor-not-allowed opacity-50"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Submit Record"
              )}
            </Button>
          )}

          {step === 3 && (
            <Button
              type="button"
              onClick={() => setStep(1)}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            >
              Edit
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
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-200 text-right">{value}</span>
    </div>
  );
}
