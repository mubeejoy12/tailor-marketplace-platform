"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import UploadField from "@/components/ui/UploadField";
import { ChevronRight, ChevronLeft, Check, Ruler } from "lucide-react";

const STEPS = ["Upper Body", "Lower Body", "Body Image", "Review"];

const UPPER_FIELDS = [
  { name: "chest", label: "Chest", hint: "Measure around the fullest part of your chest" },
  { name: "shoulder", label: "Shoulder Width", hint: "Measure across the back from shoulder to shoulder" },
  { name: "sleeve", label: "Sleeve Length", hint: "From shoulder point to wrist" },
  { name: "neck", label: "Neck", hint: "Around the base of your neck" },
];

const LOWER_FIELDS = [
  { name: "waist", label: "Waist", hint: "Around your natural waistline" },
  { name: "hip", label: "Hip", hint: "Around the fullest part of your hips" },
  { name: "trouserLength", label: "Trouser Length", hint: "From waist to ankle" },
  { name: "inseam", label: "Inseam", hint: "From crotch to ankle" },
];

export default function MeasurementWizard() {
  const [step, setStep] = useState(0);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const update = (key: string, val: string) =>
    setMeasurements((prev) => ({ ...prev, [key]: val }));

  const allUpper = UPPER_FIELDS.every((f) => measurements[f.name]);
  const allLower = LOWER_FIELDS.every((f) => measurements[f.name]);

  const canProceed = () => {
    if (step === 0) return allUpper;
    if (step === 1) return allLower;
    return true;
  };

  if (completed) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#0F766E]" />
            </div>
            <h2 className="text-2xl font-bold text-[#111111] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Measurements Saved!</h2>
            <p className="text-sm text-[#6B7280] mb-8">Your body measurements have been securely saved to your profile. You can now use them when placing orders.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="md" onClick={() => { setCompleted(false); setStep(0); setMeasurements({}); }}>
                Add New Set
              </Button>
              <Button variant="primary" size="md">
                Browse Tailors
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>Body Measurements</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">Step {step + 1} of {STEPS.length}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#0F766E] bg-[#CCFBF1] px-3 py-1.5 rounded-full">
              <Ruler className="w-3.5 h-3.5" /> {STEPS[step]}
            </div>
          </div>

          {/* Step progress */}
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#E5E7EB]">
                <div
                  className="h-full bg-[#0F766E] rounded-full transition-all duration-500"
                  style={{ width: i <= step ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
          {step === 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Upper Body</h2>
              <p className="text-sm text-[#6B7280] mb-6">Enter measurements in centimetres (cm)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {UPPER_FIELDS.map((f) => (
                  <InputField
                    key={f.name}
                    label={f.label}
                    hint={f.hint}
                    type="number"
                    placeholder="e.g. 96"
                    value={measurements[f.name] ?? ""}
                    onChange={(e) => update(f.name, e.target.value)}
                    required
                  />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-base font-semibold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Lower Body</h2>
              <p className="text-sm text-[#6B7280] mb-6">Enter measurements in centimetres (cm)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {LOWER_FIELDS.map((f) => (
                  <InputField
                    key={f.name}
                    label={f.label}
                    hint={f.hint}
                    type="number"
                    placeholder="e.g. 80"
                    value={measurements[f.name] ?? ""}
                    onChange={(e) => update(f.name, e.target.value)}
                    required
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-base font-semibold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Body Reference Image</h2>
              <p className="text-sm text-[#6B7280] mb-6">Optional — helps your tailor visualise your body shape for a better fit</p>
              <UploadField
                label="Upload Reference Photo"
                hint="A full-body photo in fitted clothing works best. This is kept private and only shared with your selected tailor."
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-base font-semibold text-[#111111] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Review Your Measurements</h2>
              <p className="text-sm text-[#6B7280] mb-6">Confirm everything looks correct before saving</p>
              <div className="grid grid-cols-2 gap-3">
                {[...UPPER_FIELDS, ...LOWER_FIELDS].map((f) => (
                  <div key={f.name} className="bg-[#FAFAF8] rounded-xl p-4 border border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] mb-1">{f.label}</p>
                    <p className="text-sm font-semibold text-[#111111]">
                      {measurements[f.name] ? `${measurements[f.name]} cm` : <span className="text-[#9CA3AF] font-normal">Not entered</span>}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-[#CCFBF1]/40 rounded-xl border border-[#0F766E]/20">
                <p className="text-xs text-[#0F766E] font-medium">Your measurements are encrypted and stored securely. Only shared with tailors you choose to work with.</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCompleted(true)}
              className="flex items-center gap-1"
            >
              Save Measurements <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
