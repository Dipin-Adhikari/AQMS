"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, ArrowLeft, Copy, Check, 
  MessageSquare, ExternalLink, Send 
} from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const email = "adhikari.dipin2@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMail = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      
      {/* Glass Card */}
      <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        
        {/* Header Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Get in Touch
        </h2>
        <p className="text-slate-500 mb-8 text-sm max-w-[80%]">
          Have a question about the Air Quality Monitoring System? We're here to help.
        </p>

        {/* Email Copy Box */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between mb-4 group hover:border-indigo-300 transition-colors">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 truncate max-w-[180px] sm:max-w-none">
              {email}
            </span>
          </div>
          
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600 transition-all relative"
            title="Copy Email"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Primary Action: Open Mail App */}
        <button
          onClick={handleOpenMail}
          className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3"
        >
          <Send className="w-4 h-4" />
          Open Mail App
        </button>

        {/* Secondary Action: Go Home */}
        <button
          onClick={() => router.push("/")}
          className="w-full py-3.5 px-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-slate-100 w-full">
           <p className="text-xs text-slate-400 font-medium">
             Response time: Usually within 24 hours
           </p>
        </div>

      </div>
    </div>
  );
}