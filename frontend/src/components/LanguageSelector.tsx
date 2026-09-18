import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-md">
      <Globe className="w-4 h-4 text-slate-400" />
      <select
        value={i18n.resolvedLanguage || "en"}
        onChange={handleLanguageChange}
        className="bg-transparent text-slate-200 text-sm outline-none border-none cursor-pointer"
      >
        <option value="en" className="bg-slate-900 text-slate-200">English</option>
        <option value="hi" className="bg-slate-900 text-slate-200">हिंदी</option>
        <option value="mr" className="bg-slate-900 text-slate-200">मराठी</option>
      </select>
    </div>
  );
}
