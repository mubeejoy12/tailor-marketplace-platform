"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import {
  Mail, Phone, MapPin, Calendar, Edit3, X,
  CheckCircle, AlertCircle, Loader2, Shield,
} from "lucide-react";
import { getUserProfile, updateUserProfile, UserProfile } from "@/services/userService";
import { getUser } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

function Avatar({ fullName, email, size = "lg" }: { fullName: string; email: string; size?: "sm" | "lg" }) {
  const ini = fullName
    ? fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();
  const cls = size === "lg"
    ? "w-20 h-20 text-2xl"
    : "w-10 h-10 text-sm";
  return (
    <div className={`${cls} rounded-full bg-[#0F766E] flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {ini}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F3F4F6] last:border-0">
      <Icon className="w-4 h-4 text-[#9CA3AF] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-[#9CA3AF]">{label}</p>
        <p className="text-sm font-medium text-[#111111] mt-0.5">{value || <span className="text-[#D1D5DB] italic">Not set</span>}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [saveError,setSaveError]= useState("");

  // Form state
  const [fullName, setFullName]   = useState("");
  const [phone,    setPhone]      = useState("");
  const [location, setLocation]   = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) { setError("Please log in."); setLoading(false); return; }
    getUserProfile(user.id)
      .then((p) => {
        setProfile(p);
        setFullName(p.fullName ?? "");
        setPhone(p.phone ?? "");
        setLocation(p.location ?? "");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!profile || !fullName.trim()) return;
    setSaving(true);
    setSaveError("");
    setSuccess(false);
    try {
      const updated = await updateUserProfile(profile.id, {
        fullName: fullName.trim(),
        phone:    phone.trim()    || undefined,
        location: location.trim() || undefined,
      });
      setProfile(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setSaveError("");
    setFullName(profile?.fullName ?? "");
    setPhone(profile?.phone ?? "");
    setLocation(profile?.location ?? "");
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <AccountSidebar />

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">

            {loading && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
                <p className="text-sm text-[#6B7280]">Loading profile…</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && profile && (
              <>
                {/* Success banner */}
                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-800">Profile updated successfully.</p>
                  </div>
                )}

                {/* Hero card */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar fullName={profile.fullName ?? ""} email={profile.email} />
                      <div>
                        <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {profile.fullName || "No name set"}
                        </h1>
                        <p className="text-sm text-[#6B7280] mt-0.5">{profile.email}</p>
                        <span className="inline-block mt-2 text-xs font-semibold text-[#0F766E] bg-[#CCFBF1] px-2.5 py-0.5 rounded-full capitalize">
                          {profile.role?.toLowerCase() ?? "customer"}
                        </span>
                      </div>
                    </div>
                    {!editing && (
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Edit form */}
                {editing && (
                  <div className="bg-white rounded-2xl border border-[#0F766E]/30 p-6 space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                        Edit Profile
                      </h2>
                      <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111111] transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <InputField
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                    <InputField
                      label="Phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                    />
                    <InputField
                      label="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Lagos, Nigeria"
                    />
                    {saveError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-700">{saveError}</p>
                      </div>
                    )}
                    <div className="flex gap-3 pt-1">
                      <Button variant="primary" size="md" onClick={handleSave} disabled={saving || !fullName.trim()}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                      </Button>
                      <Button variant="ghost" size="md" onClick={handleCancel}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Contact info */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm font-semibold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Contact Information
                  </h2>
                  <InfoRow icon={Mail}     label="Email"    value={profile.email} />
                  <InfoRow icon={Phone}    label="Phone"    value={profile.phone} />
                  <InfoRow icon={MapPin}   label="Location" value={profile.location} />
                </div>

                {/* Account info */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm font-semibold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Account Details
                  </h2>
                  <InfoRow icon={Shield}   label="Account Type" value={profile.role} />
                  <InfoRow icon={Calendar} label="Member Since"  value={memberSince} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
