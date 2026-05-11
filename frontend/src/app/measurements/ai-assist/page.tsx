'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountSidebar from '@/components/AccountSidebar';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { Sparkles, AlertCircle, CheckCircle, ChevronRight, Loader2, Info } from 'lucide-react';
import { getAISuggestions, AIMeasurementResponse } from '@/services/aiMeasurementService';
import { saveMeasurement } from '@/services/measurementService';
import { getUser } from '@/lib/auth';

type BodyShape = 'SLIM' | 'REGULAR' | 'ATHLETIC' | 'PLUS';

const BODY_SHAPES: { value: BodyShape; label: string; desc: string }[] = [
  { value: 'SLIM',     label: 'Slim',     desc: 'Lean build, narrow frame' },
  { value: 'REGULAR',  label: 'Regular',  desc: 'Average proportions' },
  { value: 'ATHLETIC', label: 'Athletic', desc: 'Broad shoulders, defined muscles' },
  { value: 'PLUS',     label: 'Plus',     desc: 'Fuller figure, curves' },
];

const MEASUREMENT_FIELDS = [
  { key: 'chest',         label: 'Chest' },
  { key: 'waist',         label: 'Waist' },
  { key: 'hip',           label: 'Hip' },
  { key: 'sleeve',        label: 'Sleeve' },
  { key: 'neck',          label: 'Neck' },
  { key: 'shoulder',      label: 'Shoulder' },
  { key: 'trouserLength', label: 'Trouser Length' },
  { key: 'inseam',        label: 'Inseam' },
] as const;

type MeasurementKey = typeof MEASUREMENT_FIELDS[number]['key'];

export default function AIAssistPage() {
  const router = useRouter();

  const [step, setStep] = useState<'input' | 'result'>('input');
  const [height, setHeight]     = useState('');
  const [weight, setWeight]     = useState('');
  const [shape, setShape]       = useState<BodyShape>('REGULAR');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const [suggestion, setSuggestion] = useState<AIMeasurementResponse | null>(null);
  // Editable values — user can tweak before saving
  const [edited, setEdited] = useState<Record<MeasurementKey, string>>({
    chest: '', waist: '', hip: '', sleeve: '',
    neck: '', shoulder: '', trouserLength: '', inseam: '',
  });

  async function handleGetSuggestions() {
    setError('');
    const user = getUser();
    if (!user) { setError('Please log in to use AI assist.'); return; }

    const h = parseInt(height);
    const w = parseInt(weight);
    if (!h || h < 100 || h > 250) { setError('Height must be between 100–250 cm.'); return; }
    if (!w || w < 30 || w > 300)  { setError('Weight must be between 30–300 kg.'); return; }

    setLoading(true);
    try {
      const result = await getAISuggestions({
        userId: user.id,
        heightCm: h,
        weightKg: w,
        bodyShape: shape,
      });
      setSuggestion(result);
      // Pre-fill editable fields with suggestions
      const vals: Record<MeasurementKey, string> = {} as Record<MeasurementKey, string>;
      for (const f of MEASUREMENT_FIELDS) {
        vals[f.key] = String(result[f.key] ?? '');
      }
      setEdited(vals);
      setStep('result');
    } catch (e) {
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const user = getUser();
    if (!user || !suggestion) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { userId: user.id };
      for (const f of MEASUREMENT_FIELDS) {
        const v = parseFloat(edited[f.key]);
        if (!isNaN(v) && v > 0) payload[f.key] = v;
      }
      await saveMeasurement(payload as unknown as Parameters<typeof saveMeasurement>[0]);
      setSaved(true);
      setTimeout(() => router.push('/measurements'), 1500);
    } catch (e) {
      setError('Failed to save measurements.');
    } finally {
      setSaving(false);
    }
  }

  const confidencePct = suggestion ? Math.round(suggestion.confidenceScore * 100) : 0;
  const confidenceColor =
    confidencePct >= 80 ? 'text-green-600' :
    confidencePct >= 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-8 gap-6">
        <aside className="hidden md:block w-56 shrink-0">
          <AccountSidebar />
        </aside>

        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Measurement Assist</h1>
              <p className="text-sm text-gray-500">
                Enter your body stats and get instant measurement estimates
              </p>
            </div>
          </div>

          {step === 'input' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Height (cm)"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                  />
                  <InputField
                    label="Weight (kg)"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70"
                  />
                </div>

                {/* Body shape selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Shape
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {BODY_SHAPES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setShape(s.value)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          shape === s.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-medium text-sm ${shape === s.value ? 'text-purple-700' : 'text-gray-800'}`}>
                          {s.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  Estimates are derived from anthropometric formulas (±5 cm accuracy).
                  Always review and adjust before saving.
                </div>

                <Button
                  onClick={handleGetSuggestions}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysing…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Get AI Suggestions
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && suggestion && (
            <div className="space-y-5">
              {/* Confidence banner */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                </div>
                <div className="text-center shrink-0">
                  <div className={`text-2xl font-bold ${confidenceColor}`}>{confidencePct}%</div>
                  <div className="text-xs text-gray-400">Confidence</div>
                </div>
              </div>

              {/* Editable measurements grid */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">Suggested Measurements</h2>
                  <span className="text-xs text-gray-400">All values in cm — edit as needed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {MEASUREMENT_FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {f.label}
                      </label>
                      <input
                        type="number"
                        value={edited[f.key]}
                        onChange={(e) =>
                          setEdited((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        step="0.5"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Measurements saved! Redirecting…
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setStep('input'); setSuggestion(null); setSaved(false); setError(''); }}
                >
                  ← Try Again
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save Measurements'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/measurements')}
                >
                  Skip <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
