import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, AlertCircle, Phone, Users, Plus, ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CONTACT_TYPE_LABELS: Record<string, string> = {
  SELF: "Self",
  GUARDIAN: "Guardian / Family",
  LOCAL_ANCHOR: "Local Anchor / NGO",
  EMPLOYER: "Employer",
};

const CONTACT_TYPE_COLORS: Record<string, string> = {
  SELF: "bg-secondary text-white border-secondary",
  GUARDIAN: "bg-primary text-white border-primary",
  LOCAL_ANCHOR: "bg-accent text-black border-accent",
  EMPLOYER: "bg-foreground text-white border-foreground",
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [newContact, setNewContact] = useState({
    contactType: "GUARDIAN",
    name: "",
    phone: "",
    relationship: "",
  });

  const fetchContacts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await api.get("/trainees/contacts");
      setContacts(data.contacts || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load contacts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newContact,
        priorityOrder: contacts.length + 1,
      };
      const res = await api.post("/trainees/contacts", payload);
      setContacts((prev) =>
        [...prev, res.contact].sort((a, b) => a.priorityOrder - b.priorityOrder)
      );
      setIsAdding(false);
      setNewContact({ contactType: "GUARDIAN", name: "", phone: "", relationship: "" });
    } catch (err: any) {
      console.error(err);
      setError("Failed to add contact.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (contact: any) => {
    setTogglingId(contact.id);
    try {
      const res = await api.patch(`/trainees/contacts/${contact.id}`, {
        isActive: !contact.isActive,
      });
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? res.contact : c)));
    } catch (err: any) {
      console.error(err);
      alert("Failed to update contact status.");
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-bold">Loading contacts...</p>
      </div>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-destructive font-bold">{error}</p>
        <Button onClick={fetchContacts} variant="outline" className="border-4 border-border text-foreground">
          Retry
        </Button>
      </div>
    );
  }

  const activeContacts = contacts.filter((c) => c.isActive);
  const inactiveContacts = contacts.filter((c) => !c.isActive);

  return (
    <div className="min-h-screen bg-[#e0e5ec] indus-schematic-bg p-6 md:p-8 space-y-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-[#4a5568] hover:text-[#ff4757] transition-colors text-sm font-bold uppercase tracking-wider bg-[#f0f2f5] px-3 py-1.5 rounded-lg shadow-[var(--shadow-floating)] border border-white/40 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center bg-[#f0f2f5] p-6 rounded-2xl shadow-[var(--shadow-floating)] border border-white/40 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="indus-led-green"></span>
              <span className="indus-label text-[#22c55e]">Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d3436] tracking-tight">
              Reachability Graph
            </h1>
            <p className="text-[#4a5568] font-medium mt-1 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4 text-[#3b82f6]" /> Manage your emergency and fallback contacts.
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>

        {/* Stats bar */}
        {contacts.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#f0f2f5] rounded-xl shadow-[var(--shadow-floating)] border border-white/40 text-center">
              <p className="text-3xl font-black text-[#2d3436]">{contacts.length}</p>
              <p className="indus-label text-[#4a5568] mt-1">Total</p>
            </div>
            <div className="p-4 bg-[#f0f2f5] rounded-xl shadow-[var(--shadow-floating)] border border-white/40 text-center">
              <p className="text-3xl font-black text-[#22c55e]">{activeContacts.length}</p>
              <p className="indus-label text-[#4a5568] mt-1">Active</p>
            </div>
            <div className="p-4 bg-[#f0f2f5] rounded-xl shadow-[var(--shadow-floating)] border border-white/40 text-center">
              <p className="text-3xl font-black text-[#4a5568]">{inactiveContacts.length}</p>
              <p className="indus-label text-[#4a5568] mt-1">Inactive</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {contacts.length === 0 ? (
          <div className="text-center py-16 bg-[#e0e5ec] rounded-2xl shadow-[var(--shadow-recessed)]">
            <div className="w-16 h-16 bg-white shadow-sm border border-[#e2e8f0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#4a5568]" />
            </div>
            <h2 className="text-xl font-bold text-[#2d3436] mb-2">No Contacts Found</h2>
            <p className="max-w-md mx-auto font-medium text-[#4a5568]">
              You haven't added any fallback contacts yet. Add a guardian or local anchor to ensure you stay connected.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {activeContacts.length > 0 && (
              <div>
                <h2 className="indus-label text-[#4a5568] mb-4 flex items-center gap-2">
                  <span className="indus-led-green"></span> Active Cascade Chain
                </h2>
                <div className="space-y-6 relative">
                  <div className="absolute left-6 top-8 bottom-8 w-1 bg-[#babecc] hidden sm:block shadow-inner" />
                  {activeContacts.map((contact, idx) => (
                    <ContactCard
                      key={contact.id || idx}
                      contact={contact}
                      isToggling={togglingId === contact.id}
                      onToggle={handleToggleActive}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveContacts.length > 0 && (
              <div className="pt-4">
                <h2 className="indus-label text-[#a0aec0] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a0aec0] shadow-sm"></span> Inactive Contacts
                </h2>
                <div className="space-y-6">
                  {inactiveContacts.map((contact, idx) => (
                    <ContactCard
                      key={contact.id || idx}
                      contact={contact}
                      isToggling={togglingId === contact.id}
                      onToggle={handleToggleActive}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Contact Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 font-sans">
            <div className="bg-[#f0f2f5] shadow-[var(--shadow-floating)] rounded-2xl w-full max-w-md relative overflow-hidden border border-white/40">
              
              <div className="p-6 border-b border-[#d1d9e6]">
                <button
                  onClick={() => setIsAdding(false)}
                  className="absolute top-6 right-6 text-[#4a5568] hover:text-[#ff4757] bg-[#e0e5ec] hover:bg-white rounded-lg p-2 shadow-sm transition-colors"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="indus-led-green"></span>
                  <span className="indus-label text-[#22c55e]">Contact Directory</span>
                </div>
                <h2 className="text-xl font-bold text-[#2d3436] tracking-tight mb-1">Add Fallback Contact</h2>
                <p className="text-sm font-medium text-[#4a5568]">
                  Added in cascade priority order
                </p>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="indus-label text-[#2d3436]">Contact Type</label>
                    <select
                      className="indus-input w-full h-12 px-4"
                      value={newContact.contactType}
                      onChange={(e) => setNewContact({ ...newContact, contactType: e.target.value })}
                    >
                      <option value="SELF">Self (My own number)</option>
                      <option value="GUARDIAN">Guardian / Family</option>
                      <option value="LOCAL_ANCHOR">Local Anchor / NGO</option>
                      <option value="EMPLOYER">Employer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="indus-label text-[#2d3436]">Name</label>
                    <Input
                      className="indus-input w-full"
                      placeholder="Full Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="indus-label text-[#2d3436]">Phone Number</label>
                    <Input
                      className="indus-input w-full"
                      placeholder="10-digit phone number"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="indus-label text-[#2d3436] flex gap-2 items-center">
                      Relationship <span className="text-xs text-[#a0aec0] normal-case">(optional)</span>
                    </label>
                    <Input
                      className="indus-input w-full"
                      placeholder="e.g. Father, Community Leader, Manager"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mx-6 mb-6 p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-sm text-sm font-medium text-[#4a5568]">
                  <span className="font-bold text-[#2d3436]">Priority #{contacts.length + 1}</span> — This contact will be
                  attempted{" "}
                  {contacts.length === 0
                    ? "first"
                    : `after ${contacts.length} existing contact${contacts.length > 1 ? "s" : ""}`}{" "}
                  in the cascade.
                </div>

                <div className="p-6 border-t border-[#d1d9e6] bg-[#e0e5ec] flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsAdding(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                    ) : (
                      "Add Contact"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard({
  contact,
  isToggling,
  onToggle,
}: {
  contact: any;
  isToggling: boolean;
  onToggle: (c: any) => void;
}) {
  const typeStyles: Record<string, string> = {
    SELF: "bg-white text-[#3b82f6] border-[#3b82f6]/30",
    GUARDIAN: "bg-white text-[#22c55e] border-[#22c55e]/30",
    LOCAL_ANCHOR: "bg-white text-[#f59e0b] border-[#f59e0b]/30",
    EMPLOYER: "bg-[#2d3436] text-white border-transparent",
  };
  const badgeStyle = typeStyles[contact.contactType] || typeStyles.SELF;

  return (
    <Card
      className={`bg-[#f0f2f5] border border-white/40 shadow-[var(--shadow-floating)] rounded-2xl relative z-10 sm:ml-12 overflow-visible transition-opacity ${
        contact.isActive ? "" : "opacity-70"
      }`}
    >
      {/* Timeline node dot */}
      <div
        className={`absolute -left-[3.25rem] top-8 w-5 h-5 rounded-full shadow-[var(--shadow-btn-accent)] hidden sm:block ${
          contact.isActive ? "bg-[#22c55e]" : "bg-[#a0aec0]"
        }`}
      />

      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
          {/* Left: number + info */}
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-[#e2e8f0] flex items-center justify-center shrink-0">
              <span className="text-[#2d3436] font-black text-xl">{contact.priorityOrder}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#2d3436] truncate">{contact.name}</h3>
              <p className="text-sm font-medium text-[#4a5568] flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 shrink-0 text-[#a0aec0]" /> {contact.phone}
              </p>
              {contact.relationship && (
                <p className="indus-label text-[#a0aec0] mt-1.5">{contact.relationship}</p>
              )}

              {/* Meta: createdAt + lastVerifiedAt */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                {contact.createdAt && (
                  <span className="text-xs font-bold text-[#4a5568] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#a0aec0]" /> Added {formatDate(contact.createdAt)}
                  </span>
                )}
                {contact.lastVerifiedAt ? (
                  <span className="text-xs font-bold text-[#22c55e] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" /> Verified {formatDate(contact.lastVerifiedAt)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#a0aec0] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#e2e8f0]" /> Not yet verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: type badge + toggle */}
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-md shadow-sm ${badgeStyle}`}>
              {CONTACT_TYPE_LABELS[contact.contactType] || contact.contactType.replace("_", " ")}
            </span>

            <Button
              variant={contact.isActive ? "secondary" : "default"}
              onClick={() => onToggle(contact)}
              disabled={isToggling}
              className="py-1 px-3 h-8 text-xs font-bold"
            >
              {isToggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : contact.isActive ? (
                <>
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Activate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
