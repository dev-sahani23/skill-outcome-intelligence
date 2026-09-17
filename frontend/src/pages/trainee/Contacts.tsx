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
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-lg">Loading contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg text-rose-400">{error}</p>
        <Button onClick={fetchContacts} variant="outline" className="border-slate-700 text-slate-300">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6 text-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Reachability Graph
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4" /> Manage your emergency and fallback contacts.
            </p>
          </div>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No Contacts Found</h2>
            <p className="max-w-md mx-auto">You haven't added any fallback contacts yet. Add a guardian or local anchor to ensure you stay connected.</p>
          </div>
        ) : (
          <div className="space-y-4 relative">
            {/* Visual hierarchy line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-800 hidden sm:block" />

            {contacts.map((contact, idx) => (
              <Card key={contact.id || idx} className="bg-slate-900 border-slate-800 relative z-10 sm:ml-12 overflow-visible">
                {/* Node dot */}
                <div className="absolute -left-12 top-6 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-950 hidden sm:block" />
                
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <span className="text-indigo-400 font-bold">{contact.priorityOrder}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">{contact.name}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                        <Phone className="w-3.5 h-3.5" /> {contact.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end w-full sm:w-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {contact.contactType.replace("_", " ")}
                    </span>
                    {contact.relationship && (
                      <span className="text-xs text-slate-500 mt-2">{contact.relationship}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Contact Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-white mb-4">Add Fallback Contact</h2>
              
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contact Type</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white"
                    value={newContact.contactType}
                    onChange={(e) => setNewContact({...newContact, contactType: e.target.value})}
                  >
                    <option value="GUARDIAN">Guardian / Family</option>
                    <option value="LOCAL_ANCHOR">Local Anchor / NGO</option>
                    <option value="EMPLOYER">Employer</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Name</label>
                  <Input
                    required
                    placeholder="Full Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone</label>
                  <Input
                    required
                    placeholder="10-digit phone number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Relationship (Optional)</label>
                  <Input
                    placeholder="e.g. Father, Community Leader"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
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
