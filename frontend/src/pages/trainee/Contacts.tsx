import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, AlertCircle, Phone, Users, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newContact, setNewContact] = useState({
    contactType: "LOCAL_ANCHOR",
    name: "",
    phone: "",
    relationship: ""
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
        priorityOrder: contacts.length + 1
      };
      const res = await api.post("/trainees/contacts", payload);
      setContacts(prev => [...prev, res.contact].sort((a, b) => a.priorityOrder - b.priorityOrder));
      setIsAdding(false);
      setNewContact({ contactType: "LOCAL_ANCHOR", name: "", phone: "", relationship: "" });
    } catch (err: any) {
      console.error(err);
      setError("Failed to add contact.");
    } finally {
      setIsSubmitting(false);
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

  if (error) {
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

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-6 md:p-8 space-y-6 text-foreground">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

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

        {contacts.length === 0 ? (
          <div className="text-center py-12 bg-white border-4 border-border text-muted-foreground">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-black uppercase text-foreground mb-2">No Contacts Found</h2>
            <p className="max-w-md mx-auto font-bold">You haven't added any fallback contacts yet. Add a guardian or local anchor to ensure you stay connected.</p>
          </div>
        ) : (
          <div className="space-y-4 relative">
            {/* Visual hierarchy line */}
            <div className="absolute left-6 top-8 bottom-8 w-1 bg-border hidden sm:block" />

            {contacts.map((contact, idx) => (
              <Card key={contact.id || idx} className="bg-white border-4 border-border relative z-10 sm:ml-12 overflow-visible">
                {/* Node dot */}
                <div className="absolute -left-[3.25rem] top-6 w-4 h-4 rounded-none bg-primary border-4 border-border hidden sm:block" />
                
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted flex items-center justify-center shrink-0 border-4 border-border">
                      <span className="text-foreground font-black text-xl">{contact.priorityOrder}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-foreground">{contact.name}</h3>
                      <p className="text-sm font-bold text-muted-foreground flex items-center gap-2 mt-1 uppercase">
                        <Phone className="w-3.5 h-3.5" /> {contact.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end w-full sm:w-auto">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-primary text-white border-2 border-primary">
                      {contact.contactType.replace("_", " ")}
                    </span>
                    {contact.relationship && (
                      <span className="text-xs font-bold text-muted-foreground mt-2 uppercase">{contact.relationship}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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
              <h2 className="text-xl font-black uppercase text-foreground mb-4">Add Fallback Contact</h2>
              
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Contact Type</label>
                  <select
                    className="w-full bg-white border-4 border-border p-2 text-foreground font-bold focus:border-primary focus:outline-none"
                    value={newContact.contactType}
                    onChange={(e) => setNewContact({...newContact, contactType: e.target.value})}
                  >
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
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Phone</label>
                  <Input
                    required
                    placeholder="10-digit phone number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Relationship (Optional)</label>
                  <Input
                    placeholder="e.g. Father, Community Leader"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors">
                  {isSubmitting ? "Adding..." : "Add Contact"}
                </Button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
