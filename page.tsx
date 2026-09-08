"use client";

import { useState, useCallback } from "react";
import { Upload, Sparkles, CheckCircle2, Printer, CreditCard, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

type Step = "home" | "requirements" | "analyzing" | "designs" | "preview" | "payment" | "success";

interface TapeDesign {
  id: string;
  name: string;
  colors: { hex: string; name: string; percentage?: number }[];
  description: string;
  matchingScore: number;
  recommendedWidth: string;
  finish: string;
  patternType: string;
  previewSvg: string;
}

export default function HomePage() {
  const [step, setStep] = useState<Step>("home");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tapeWidth, setTapeWidth] = useState("1.5 inch");
  const [tapeStyle, setTapeStyle] = useState("AI recommended");
  const [tapeFinish, setTapeFinish] = useState("AI recommended");
  const [designs, setDesigns] = useState<TapeDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<TapeDesign | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG, WEBP allowed");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Max 8MB file size");
      return;
    }
    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setStep("requirements");
    };
    reader.readAsDataURL(file);
  }, []);

  const runAnalysis = async () => {
    if (!imageFile) return;
    setLoading(true);
    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("width", tapeWidth);
      formData.append("style", tapeStyle);
      formData.append("finish", tapeFinish);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setAnalysis(data);
      setDesigns(data.suggestedTapeDesigns || []);
      setStep("designs");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStep("requirements");
    } finally {
      setLoading(false);
    }
  };

  const confirmDesign = () => {
    if (!selectedDesign) return;
    setStep("preview");
  };

  const proceedToPayment = () => {
    setStep("payment");
  };

  const handleDemoPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadedImage: uploadedImage?.slice(0, 100) + "...", // truncated for demo
          selectedDesign,
          tapeWidth,
          finish: selectedDesign?.finish || tapeFinish,
          quantity: 1,
          price: 99,
        }),
      });

      if (!res.ok) throw new Error("Order creation failed");
      const data = await res.json();
      setOrderData(data);
      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-slate-900 text-[17px]">FlexTape AI</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">Mesocare Holistic Pvt Ltd</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Demo</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* HOME */}
        {step === "home" && (
          <div className="space-y-8">
            <div className="text-center space-y-3 pt-8">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Upload your flex design<br />
                <span className="text-red-600">AI creates matching tapes</span>
              </h1>
              <p className="text-slate-600 text-sm">
                Perfect edge & joint tapes for banners and flex printing. Professional results in minutes.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-red-300 rounded-xl p-10 cursor-pointer hover:bg-red-50 transition active:scale-[0.98]">
                <Upload className="w-10 h-10 text-red-500 mb-3" />
                <span className="font-semibold text-slate-800">Upload Flex Photo</span>
                <span className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP • Max 8MB</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleUpload} />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-xs text-slate-600 mt-1">Upload</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-xs text-slate-600 mt-1">AI Match</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-xs text-slate-600 mt-1">Print Ready</div>
              </div>
            </div>
          </div>
        )}

        {/* REQUIREMENTS */}
        {step === "requirements" && uploadedImage && (
          <div className="space-y-6">
            <button onClick={() => setStep("home")} className="flex items-center gap-1 text-sm text-slate-500">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
              <img src={uploadedImage} alt="Uploaded flex" className="w-full h-48 object-cover" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tape Width</label>
                <div className="grid grid-cols-3 gap-2">
                  {["1 inch", "1.5 inch", "2 inch", "3 inch", "Custom"].map((w) => (
                    <button
                      key={w}
                      onClick={() => setTapeWidth(w)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                        tapeWidth === w
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white text-slate-700 border-slate-200 hover:border-red-300"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tape Style</label>
                <select
                  value={tapeStyle}
                  onChange={(e) => setTapeStyle(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  {["AI recommended", "Plain color", "Color matching", "Border style", "Pattern", "Decorative", "Premium"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Finish</label>
                <select
                  value={tapeFinish}
                  onChange={(e) => setTapeFinish(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  {["AI recommended", "Matte", "Glossy", "Metallic look", "Transparent"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Analyze with AI
            </button>
          </div>
        )}

        {/* ANALYZING */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
              <Sparkles className="w-8 h-8 text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-800">Analyzing your design...</h2>
              <p className="text-sm text-slate-500 mt-1">Extracting colors • Finding matches • Generating options</p>
            </div>
          </div>
        )}

        {/* DESIGNS */}
        {step === "designs" && (
          <div className="space-y-5">
            <button onClick={() => setStep("requirements")} className="flex items-center gap-1 text-sm text-slate-500">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Suggested Designs</h2>
              <p className="text-sm text-slate-500">Based on your flex colors & style</p>
            </div>

            {analysis && (
              <div className="bg-white rounded-xl p-3 border border-slate-200 flex gap-2 overflow-x-auto">
                {analysis.dominantColors?.map((c: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[52px]">
                    <div className="w-10 h-10 rounded-full border border-slate-200" style={{ backgroundColor: c.hex }} />
                    <span className="text-[10px] text-slate-600">{c.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {designs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDesign(d)}
                  className={`w-full text-left bg-white rounded-xl border-2 p-4 transition ${
                    selectedDesign?.id === d.id ? "border-red-500 ring-2 ring-red-100" : "border-slate-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className="w-24 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100"
                      dangerouslySetInnerHTML={{ __html: d.previewSvg }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm">{d.name}</h3>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {d.matchingScore}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{d.description}</p>
                      <div className="flex gap-2 mt-1.5 text-[11px] text-slate-500">
                        <span>{d.recommendedWidth}</span>
                        <span>•</span>
                        <span>{d.finish}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={confirmDesign}
              disabled={!selectedDesign}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              Confirm Design <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PREVIEW */}
        {step === "preview" && selectedDesign && (
          <div className="space-y-5">
            <button onClick={() => setStep("designs")} className="flex items-center gap-1 text-sm text-slate-500">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h2 className="text-lg font-bold text-slate-900">Design Preview</h2>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
              <div className="rounded-lg overflow-hidden border border-slate-100">
                <div dangerouslySetInnerHTML={{ __html: selectedDesign.previewSvg.replace('width="300"', 'width="100%"').replace('height="60"', 'height="80"') }} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Name</span>
                  <p className="font-medium">{selectedDesign.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Match Score</span>
                  <p className="font-medium text-emerald-600">{selectedDesign.matchingScore}%</p>
                </div>
                <div>
                  <span className="text-slate-500">Width</span>
                  <p className="font-medium">{tapeWidth}</p>
                </div>
                <div>
                  <span className="text-slate-500">Finish</span>
                  <p className="font-medium">{selectedDesign.finish}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600">{selectedDesign.description}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              This is a simulated preview. Final print file will have exact dimensions & cutting guides.
            </div>

            <button
              onClick={proceedToPayment}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PAYMENT */}
        {step === "payment" && (
          <div className="space-y-5">
            <button onClick={() => setStep("preview")} className="flex items-center gap-1 text-sm text-slate-500">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h2 className="text-lg font-bold text-slate-900">Demo Payment</h2>

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-900">
              <strong>⚠️ DEMO ONLY</strong><br />
              No real money will be charged. This simulates the payment flow for the prototype.
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Custom Tape Design</span>
                <span className="font-medium">₹99</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Width</span>
                <span>{tapeWidth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Finish</span>
                <span>{selectedDesign?.finish}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-red-600">₹99</span>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleDemoPayment}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Pay ₹99 (Demo)
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && orderData && (
          <div className="space-y-6 text-center pt-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Order Created!</h2>
              <p className="text-sm text-slate-500 mt-1">Demo payment successful</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono font-medium">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID</span>
                <span className="font-mono text-xs">{orderData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-600 font-medium">PAID (DEMO)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Production</span>
                <span className="font-medium">{orderData.productionStatus}</span>
              </div>
            </div>

            {orderData.printFileUrl && (
              <a
                href={orderData.printFileUrl}
                target="_blank"
                className="block w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Download Print-Ready PDF
              </a>
            )}

            <button
              onClick={() => {
                setStep("home");
                setUploadedImage(null);
                setImageFile(null);
                setSelectedDesign(null);
                setDesigns([]);
                setOrderData(null);
              }}
              className="text-sm text-red-600 font-medium"
            >
              Create another design
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
