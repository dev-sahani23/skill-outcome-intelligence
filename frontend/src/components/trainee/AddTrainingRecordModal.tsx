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
                className={`w-8 h-8 flex items-center justify-center text-sm font-black transition-all ${isDone
                    ? "bg-secondary text-white border-4 border-secondary"
                    : isActive
                      ? "bg-primary text-white border-4 border-primary"
                      : "bg-white text-muted-foreground border-4 border-border"
                  }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap mt-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`w-12 h-1 mx-1 mb-4 ${isDone ? "bg-secondary" : "bg-border"}`} />
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
          className="flex-1 focus-visible:ring-secondary focus-visible:border-secondary"
        />
        <Button type="button" onClick={addSkill} className="bg-foreground hover:bg-accent hover:text-black text-white border-2 border-foreground hover:border-accent transition-colors px-3 font-bold uppercase tracking-wider">
          Add
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 bg-white text-primary font-bold uppercase tracking-wider border-4 border-primary text-xs px-2.5 py-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-blue-700 transition-colors ml-0.5"
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

  const totalSteps = form.status === "completed" ? 3 : 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-white border-4 border-border w-full max-w-xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-0 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-red-50 p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-black uppercase tracking-wider text-foreground mb-1">Add Training Record</h2>
          <p className="text-sm font-bold text-muted-foreground mb-4">Record your training history and upload certificates.</p>
          <StepIndicator current={step} total={3} />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-2">

          {/* ─── STEP 1: Training Details ─── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold uppercase tracking-wider text-foreground">Training / Course Name *</label>
                <Input
                  placeholder="e.g. Full Stack Web Development"
                  value={form.programName}
                  onChange={(e) => patch({ programName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Institution / Provider *</label>
                  <Input
                    placeholder="e.g. Excel Skills Academy"
                    value={form.providerName}
                    onChange={(e) => patch({ providerName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Provider Type *</label>
                  <select
                    value={form.providerType}
                    onChange={(e) => patch({ providerType: e.target.value as any })}
                    className="w-full h-12 border-4 border-border bg-white px-3 text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-accent/50 outline-none transition-all"
                  >
                    <option value="">Select type</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="ngo">NGO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold uppercase tracking-wider text-foreground">Sector *</label>
                <select
                  value={form.sector}
                  onChange={(e) => patch({ sector: e.target.value })}
                  className="w-full h-12 border-4 border-border bg-white px-3 text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-accent/50 outline-none transition-all"
                >
                  <option value="">Select sector</option>
                  {["Manufacturing", "IT", "Construction", "Healthcare", "Retail", "Agriculture", "Other"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Start Date *</label>
                  <Input
                    type="date"
                    value={form.startDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => patch({ startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => patch({ endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-foreground">Status *</label>
                <div className="flex gap-3">
                  {(["completed", "in_progress", "dropped"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => patch({ status: s })}
                      className={`flex-1 py-2.5 border-4 text-sm font-bold uppercase tracking-wider transition-all ${form.status === s
                          ? s === "completed"
                            ? "bg-secondary border-secondary text-white"
                            : s === "in_progress"
                              ? "bg-primary border-primary text-white"
                              : "bg-destructive border-destructive text-white"
                          : "bg-white border-border text-muted-foreground hover:bg-secondary/10 hover:text-secondary hover:border-secondary"
                        }`}
                    >
                      {s === "completed" ? "Completed" : s === "in_progress" ? "In Progress" : "Dropped Out"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Skills Learned *
                  {form.status === "completed" && <span className="text-destructive ml-1">(min 1 required)</span>}
                </label>
                <SkillInput skills={form.skills} onChange={(s) => patch({ skills: s })} />
              </div>
            </div>
          )}

          {/* ─── STEP 2: Certificate Upload (completed only) ─── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm font-bold text-muted-foreground">
                Upload the certificate you received. The file goes directly from your browser to our secure storage — no data passes through our servers.
              </p>

              {certificate ? (
                <div className="bg-white border-4 border-secondary p-4 flex items-center gap-3">
                  <div className="bg-secondary p-2 text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase text-foreground truncate">{certificate.fileName}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-0.5">Uploaded successfully</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCertificate(null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : !form.noCertificate ? (
                <button
                  type="button"
                  onClick={openUploadWidget}
                  disabled={isUploading}
                  className="w-full bg-muted border-4 border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary p-8 flex flex-col items-center gap-3 text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none group"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider">
                    {isUploading ? "Opening upload widget..." : "Upload Certificate (PDF or Image)"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">PDF, JPG, PNG · Max 5MB</span>
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
                  className="w-4 h-4 border-2 border-foreground accent-primary"
                />
                <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                  I don't have a certificate (enrollment will still be recorded)
                </span>
              </label>

              <div className="border-t-4 border-border pt-4 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Optional Details</p>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Certification Name</label>
                  <Input
                    placeholder="e.g. FSWD Level 1"
                    value={form.certificationName}
                    onChange={(e) => patch({ certificationName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Certification Issued Date</label>
                  <Input
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
            <div className="space-y-4">
              <div className="bg-muted border-4 border-border p-4 space-y-3">
                <Row label="Course" value={form.programName} />
                <Row label="Provider" value={`${form.providerName} (${form.providerType})`} />
                <Row label="Sector" value={form.sector} />
                <Row label="Period" value={`${form.startDate}${form.endDate ? ` → ${form.endDate}` : ""}`} />
                <Row
                  label="Status"
                  value={form.status === "completed" ? "✅ Completed" : form.status === "in_progress" ? "🔄 In Progress" : "❌ Dropped Out"}
                />
                <div className="pt-2 border-t-4 border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map((s) => (
                      <span key={s} className="bg-white text-primary font-bold uppercase tracking-wider border-4 border-primary text-xs px-2 py-0.5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t-4 border-border">
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
                <div className="flex items-center gap-2 bg-red-50 border-4 border-destructive text-destructive font-bold text-sm p-3 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {toast && (
                <div className="flex items-center gap-2 bg-emerald-50 border-4 border-secondary text-secondary font-bold text-sm p-3 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {toast}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t-4 border-border flex-shrink-0 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              onClick={handleBack}
              className="bg-white hover:bg-accent text-foreground hover:text-black border-4 border-border hover:border-accent flex-1 font-bold uppercase tracking-wider transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !step1Valid}
              className={`flex-1 font-bold uppercase tracking-wider border-2 transition-colors ${step === 1 && !step1Valid
                  ? "bg-muted text-muted-foreground cursor-not-allowed border-muted-foreground"
                  : "bg-primary border-primary hover:bg-secondary hover:border-secondary text-white"
                }`}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-secondary hover:border-secondary text-white font-bold uppercase tracking-wider border-2 border-primary transition-colors"
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
              className="bg-white hover:bg-accent text-foreground hover:text-black border-4 border-border hover:border-accent font-bold uppercase tracking-wider transition-colors"
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
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className="text-sm font-black text-foreground uppercase text-right">{value}</span>
    </div>
  );
}
