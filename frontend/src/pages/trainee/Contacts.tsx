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
    <div className="min-h-screen bg-muted p-4 sm:p-6 md:p-8 space-y-6 text-foreground">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 border-4 border-border gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-foreground">
              Reachability Graph
            </h1>
            <p className="text-muted-foreground font-bold mt-2 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4" /> Manage your emergency and fallback contacts.
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-secondary hover:border-secondary text-white font-bold uppercase tracking-wider border-2 border-primary transition-colors"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>

        {/* Stats bar */}
        {contacts.length > 0 && (
          <div className="grid grid-cols-3 bg-white border-4 border-border divide-x-4 divide-border">
            <div className="p-4 text-center">
              <p className="text-2xl font-black text-foreground">{contacts.length}</p>
              <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Total</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-black text-secondary">{activeContacts.length}</p>
              <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Active</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-black text-muted-foreground">{inactiveContacts.length}</p>
              <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Inactive</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {contacts.length === 0 ? (
          <div className="text-center py-12 bg-white border-4 border-border text-muted-foreground">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-black uppercase text-foreground mb-2">No Contacts Found</h2>
            <p className="max-w-md mx-auto font-bold">
              You haven't added any fallback contacts yet. Add a guardian or local anchor to ensure you stay connected.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeContacts.length > 0 && (
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-secondary" /> Active Cascade Chain
                </h2>
                <div className="space-y-4 relative">
                  <div className="absolute left-6 top-8 bottom-8 w-1 bg-border hidden sm:block" />
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
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground" /> Inactive Contacts
                </h2>
                <div className="space-y-4">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4">
            <div className="bg-white border-4 border-border w-full max-w-md p-6 relative">
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
              <h2 className="text-xl font-black uppercase text-foreground mb-1">Add Fallback Contact</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Added in cascade priority order
              </p>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Contact Type</label>
                  <select
                    className="w-full bg-white border-4 border-border p-2 text-foreground font-bold focus:border-primary focus:outline-none"
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
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Name</label>
                  <Input
                    required
                    placeholder="Full Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Phone</label>
                  <Input
                    required
                    placeholder="10-digit phone number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Relationship{" "}
                    <span className="text-muted-foreground font-bold normal-case">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. Father, Community Leader, Manager"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  />
                </div>

                <div className="bg-muted border-4 border-border p-3 text-xs font-bold text-muted-foreground">
                  <span className="text-foreground">Priority #{contacts.length + 1}</span> — This contact will be
                  attempted{" "}
                  {contacts.length === 0
                    ? "first"
                    : `after ${contacts.length} existing contact${contacts.length > 1 ? "s" : ""}`}{" "}
                  in the cascade.
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                    </>
                  ) : (
                    "Add Contact"
                  )}
                </Button>
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
  const typeColor = CONTACT_TYPE_COLORS[contact.contactType] || "bg-primary text-white border-primary";

  return (
    <Card
      className={`bg-white border-4 border-border relative z-10 sm:ml-12 overflow-visible transition-opacity ${
        contact.isActive ? "" : "opacity-60"
      }`}
    >
      {/* Timeline node dot */}
      <div
        className={`absolute -left-[3.25rem] top-6 w-4 h-4 rounded-none border-4 border-border hidden sm:block ${
          contact.isActive ? "bg-primary" : "bg-muted-foreground"
        }`}
      />

      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          {/* Left: number + info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-muted flex items-center justify-center shrink-0 border-4 border-border">
              <span className="text-foreground font-black text-xl">{contact.priorityOrder}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black uppercase text-foreground truncate">{contact.name}</h3>
              <p className="text-sm font-bold text-muted-foreground flex items-center gap-2 mt-1 uppercase">
                <Phone className="w-3.5 h-3.5 shrink-0" /> {contact.phone}
              </p>
              {contact.relationship && (
                <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">{contact.relationship}</p>
              )}

              {/* Meta: createdAt + lastVerifiedAt */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {contact.createdAt && (
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                    <Clock className="w-3 h-3" /> Added {formatDate(contact.createdAt)}
                  </span>
                )}
                {contact.lastVerifiedAt ? (
                  <span className="text-[11px] font-bold text-secondary flex items-center gap-1 uppercase">
                    <ShieldCheck className="w-3 h-3" /> Verified {formatDate(contact.lastVerifiedAt)}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                    <ShieldCheck className="w-3 h-3" /> Not yet verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: type badge + toggle */}
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${typeColor}`}>
              {CONTACT_TYPE_LABELS[contact.contactType] || contact.contactType.replace("_", " ")}
            </span>

            <button
              onClick={() => onToggle(contact)}
              disabled={isToggling}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider border-2 transition-colors ${
                contact.isActive
                  ? "bg-white text-destructive border-destructive hover:bg-destructive hover:text-white"
                  : "bg-white text-secondary border-secondary hover:bg-secondary hover:text-white"
              }`}
            >
              {isToggling ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : contact.isActive ? (
                <>
                  <XCircle className="w-3 h-3" /> Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" /> Activate
                </>
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
