"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-indigo-100 flex flex-col items-center mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-md">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Contact Us
          </h2>
        </div>
        <p className="text-gray-600 mb-4 text-center">
          For any questions, feedback, or support, reach out to our team at:
        </p>
        <a
          href="mailto:adhikari.dipin2@gmail.com"
          className="text-indigo-700 font-semibold underline hover:text-purple-600 transition text-lg mb-6"
        >
          adhikari.dipin2@gmail.com
        </a>
        {/* Back Home Button */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 mt-2 rounded-xl font-semibold shadow hover:scale-105 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
