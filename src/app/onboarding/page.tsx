"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, UploadCloud, CheckCircle2, Heart } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock save and redirect
    setTimeout(() => {
      window.location.href = "/app";
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo href="#" />
          <div className="text-sm font-medium text-[var(--muted)]">
            Step {step} of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-[var(--border)]">
        <div 
          className="h-full bg-[var(--primary)] transition-all duration-500 ease-in-out" 
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-[var(--border)] shadow-[0_24px_70px_var(--hero-shadow)] overflow-hidden">
          
          <div className="p-6 sm:p-10 lg:p-12">
            
            {/* Step 1: Profile Setup */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h1 className="font-editorial-title text-3xl font-normal text-[var(--foreground)] tracking-tight">Tell us about yourself</h1>
                  <p className="mt-2 text-[var(--muted)]">Let's start with your demographic and educational details.</p>
                </div>
                
                <form onSubmit={handleNext} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Gender</label>
                      <select required className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Date of Birth</label>
                      <input type="date" required className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Education</label>
                      <input type="text" required placeholder="e.g. Master's in Computer Science" className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Profession</label>
                      <input type="text" required placeholder="e.g. Software Engineer" className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Family Details</label>
                      <textarea required rows={3} placeholder="Tell us a bit about your family background..." className="w-full rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button type="submit" className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Partner Preferences */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h1 className="font-editorial-title text-3xl font-normal text-[var(--foreground)] tracking-tight">Partner Preferences</h1>
                  <p className="mt-2 text-[var(--muted)]">What are you looking for in your ideal match?</p>
                </div>
                
                <form onSubmit={handleNext} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Age Range</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Min" required className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                        <span className="text-[var(--muted)]">to</span>
                        <input type="number" placeholder="Max" required className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Religion / Community</label>
                      <input type="text" required placeholder="e.g. Hindu, Any" className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Preferred Education</label>
                      <input type="text" required placeholder="e.g. Bachelors or above" className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Preferred Location</label>
                      <input type="text" required placeholder="e.g. Bangalore, Mumbai" className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10" />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <button type="button" onClick={handleBack} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Service Categories */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h1 className="font-editorial-title text-3xl font-normal text-[var(--foreground)] tracking-tight">Service Categories</h1>
                  <p className="mt-2 text-[var(--muted)]">What kind of connections are you seeking on Let's CHAT .Com?</p>
                </div>
                
                <form onSubmit={handleNext} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'friendship', label: 'Chat for Friendship', desc: 'Social interaction and making new friends.' },
                      { id: 'marriage', label: 'Chat for Marriage', desc: 'Marriage-oriented connections.' },
                      { id: 'living_together', label: 'Chat for Living Together', desc: 'Living-together relationships.' },
                      { id: 'malayalam_matrimony', label: 'Malayalam Matrimony', desc: 'Malayalam-speaking matrimonial connections.' },
                      { id: 'telugu_matrimony', label: 'Telugu Matrimony', desc: 'Telugu-speaking matrimonial connections.' }
                    ].map((cat) => (
                      <label 
                        key={cat.id}
                        className={cn(
                          "flex flex-col gap-1 p-4 border rounded-xl cursor-pointer transition-all",
                          selectedCategories.includes(cat.id) 
                            ? "border-[var(--primary)] bg-[var(--primary)]/5" 
                            : "border-[var(--border)] hover:border-[var(--primary)]/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCategories([...selectedCategories, cat.id]);
                              else setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                            }}
                          />
                          <span className="font-bold text-sm text-[var(--foreground)]">{cat.label}</span>
                        </div>
                        <p className="text-xs text-[var(--muted)] ml-7">{cat.desc}</p>
                      </label>
                    ))}
                  </div>

                  <div className="pt-6 flex justify-between">
                    <button type="button" onClick={handleBack} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" disabled={selectedCategories.length === 0} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all disabled:opacity-50">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 4: Primary Image Upload */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h1 className="font-editorial-title text-3xl font-normal text-[var(--foreground)] tracking-tight">Profile Picture</h1>
                  <p className="mt-2 text-[var(--muted)]">Upload a clear, recent photo. Profiles with photos get 10x more responses.</p>
                </div>
                
                <form onSubmit={handleNext} className="space-y-8">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface-muted)] p-12 text-center hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 transition-colors cursor-pointer">
                    <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-[var(--primary)]">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Click to upload your display picture</h3>
                    <p className="text-xs text-[var(--muted)] mt-2">JPEG, PNG, JPG up to 5MB.</p>
                    <button type="button" className="mt-6 text-xs font-semibold text-[var(--primary)] bg-white px-4 py-2 rounded-lg shadow-sm border border-[var(--border)]">Browse Files</button>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button type="button" onClick={handleBack} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 5: Album & Verification (Final) */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 text-center">
                  <div className="mx-auto h-16 w-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <h1 className="font-editorial-title text-3xl font-normal text-[var(--foreground)] tracking-tight">Create your Album</h1>
                  <p className="mt-2 text-[var(--muted)]">Add up to 5 supplementary photos to build your gallery.</p>
                </div>
                
                <form onSubmit={handleComplete} className="space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-muted)] flex items-center justify-center hover:bg-[var(--primary)]/5 cursor-pointer transition-colors text-[var(--muted)]">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                    ))}
                  </div>

                  <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-4 rounded-xl flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--primary-deep)]">System Check Ready</h4>
                      <p className="text-xs text-[var(--primary)] mt-1 opacity-90">Completing this step will instantly generate your Unique Matrimony ID and unlock all application features.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button type="button" onClick={handleBack} disabled={isLoading} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all disabled:opacity-50">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" disabled={isLoading} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all disabled:opacity-50">
                      {isLoading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /><span>Finalizing...</span></>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4" /><span>Complete Profile</span></>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
