import React from 'react';

// Base Skeleton element
export function Skeleton({ className }) {
  return (
    <div className={`bg-[#EAE2D5]/45 animate-pulse rounded-lg ${className}`} />
  );
}

// 1. JobListingsSkeleton
export function JobListingsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page Header */}
      <div className="relative overflow-hidden mb-12 pb-8 border-b border-[#EAE2D5]">
        <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="relative space-y-4">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-96 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FCF9F3] border border-[#EAE2D5] p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-10 h-3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-full h-8" />
            </div>
          </div>
        </div>

        {/* Listings List */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center pb-3 border-b border-[#EAE2D5] mb-8">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-b border-[#EAE2D5] pb-8 pt-4 px-4 bg-white rounded-2xl p-4 shadow-3xs"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-grow">
                    <div className="flex flex-wrap items-center gap-3">
                      <Skeleton className="w-64 h-6" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="w-32 h-3.5" />
                      <Skeleton className="w-24 h-3.5" />
                    </div>
                    <div className="space-y-2 pt-1">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-5/6 h-3" />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <Skeleton className="w-12 h-5" />
                      <Skeleton className="w-16 h-5" />
                      <Skeleton className="w-14 h-5" />
                    </div>
                  </div>
                  <div className="self-stretch flex items-center justify-end">
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. JobDetailSkeleton
export function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 border-b border-[#EAE2D5] pb-3">
          <Skeleton className="w-48 h-4" />
        </div>

        {/* Job Header Area */}
        <div className="bg-[#FCF9F3] border border-[#EAE2D5] rounded-3xl p-8 sm:p-10 shadow-xs mb-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="w-32 h-6 rounded-full" />
              <Skeleton className="w-3/4 h-10" />
            </div>
            <div className="flex flex-wrap gap-4">
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-36 h-4" />
              <Skeleton className="w-24 h-4" />
            </div>
            <div className="pt-4 flex gap-4">
              <Skeleton className="w-48 h-10 rounded-xl" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Job Details Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-[#EAE2D5] rounded-3xl p-8 shadow-3xs">
              <div className="border-b border-[#EAE2D5] pb-2 mb-4">
                <Skeleton className="w-36 h-5" />
              </div>
              <div className="space-y-3">
                <Skeleton className="w-full h-3.5" />
                <Skeleton className="w-full h-3.5" />
                <Skeleton className="w-full h-3.5" />
                <Skeleton className="w-5/6 h-3.5" />
                <Skeleton className="w-4/5 h-3.5" />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-[#FCF9F3] border border-[#EAE2D5] rounded-3xl p-6 shadow-3xs">
              <div className="border-b border-[#EAE2D5] pb-2 mb-4">
                <Skeleton className="w-28 h-4" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="w-16 h-5" />
                <Skeleton className="w-12 h-5" />
                <Skeleton className="w-20 h-5" />
                <Skeleton className="w-14 h-5" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. ProfileSkeleton
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white border border-[#EAE2D5] rounded-[32px] overflow-hidden shadow-xs">
          {/* Banner */}
          <div className="h-40 bg-[#FCF9F3] relative border-b border-[#EAE2D5]" />

          <div className="px-8 pb-8 relative">
            {/* Overlapping Avatar */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 rounded-full bg-white p-1.5 border border-[#EAE2D5]">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-5 gap-3">
              <Skeleton className="w-24 h-9 rounded-xl" />
              <Skeleton className="w-28 h-9 rounded-xl" />
            </div>

            {/* Profile Info */}
            <div className="mt-4 flex flex-col md:flex-row gap-8 justify-between items-start">
              <div className="flex-1 space-y-3">
                <Skeleton className="w-64 h-8" />
                <Skeleton className="w-48 h-4" />
                <Skeleton className="w-36 h-4" />
              </div>
              <div className="flex flex-col gap-3 md:items-end min-w-[200px]">
                <Skeleton className="w-32 h-4" />
                <div className="flex gap-2">
                  <Skeleton className="w-16 h-6 rounded" />
                  <Skeleton className="w-16 h-6 rounded" />
                </div>
              </div>
            </div>

            {/* Bottom 3 Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#FCF9F3] border border-[#EAE2D5] rounded-[24px] p-6 h-28 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-full h-3" />
                  </div>
                  <Skeleton className="w-full h-8 rounded-lg mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. MySkillsSkeleton
export function MySkillsSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <div className="pb-8 border-b border-[#EAE2D5] mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-64 h-8" />
            <Skeleton className="w-96 h-4" />
          </div>
          <Skeleton className="w-40 h-10 rounded-xl" />
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#FCF9F3] border border-[#EAE2D5] p-6 rounded-2xl flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1.5 flex-grow">
                <Skeleton className="w-16 h-3" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side: Resume and Verification */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border border-[#EAE2D5] p-8 rounded-[32px] space-y-6">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-24 rounded-2xl" />
            </div>
            
            {/* Verification skeletons stacked vertically */}
            <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl min-h-[220px] space-y-4">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-full h-10" />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-16 h-6" />
              </div>
            </div>

            <div className="bg-white border border-[#EAE2D5] p-6 rounded-2xl min-h-[220px] space-y-4">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-full h-10" />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-16 h-6" />
              </div>
            </div>
          </div>

          {/* Right Side: Skills Manager */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-[#EAE2D5] p-8 rounded-[32px] space-y-6">
              <Skeleton className="w-48 h-5" />
              <div className="flex gap-4">
                <Skeleton className="flex-grow h-10" />
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
              <Skeleton className="w-full h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. MassHiringSkeleton
export function MassHiringSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 border-b border-[#EAE2D5] pb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="w-64 h-8" />
              <Skeleton className="w-96 h-4" />
            </div>
          </div>
        </div>

        {/* Colleges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#EAE2D5] rounded-2xl p-6 h-48 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-2/3 h-4" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-32 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 6. DashboardSkeleton
export function DashboardSkeleton({ type = 'employer' }) {
  return (
    <div className="flex flex-col bg-[#FDFBF7]" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Header Container */}
      <div className="border-b border-[#EAE2D5] px-6 lg:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <div className="flex gap-4">
              <Skeleton className="w-32 h-3" />
              <Skeleton className="w-28 h-3" />
            </div>
          </div>
        </div>
        <Skeleton className="w-36 h-10 rounded-xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6 lg:px-10 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="w-16 h-10" />
          </div>
        ))}
      </div>

      {/* Tab Navigation / Content Area */}
      <div className="flex-1 flex flex-col mx-6 lg:mx-10 mb-8 border border-[#EAE2D5] rounded-2xl overflow-hidden bg-white">
        <div className="flex border-b border-[#EAE2D5] bg-[#FAF6F0] h-14">
          <Skeleton className="w-32 h-full rounded-none" />
          <Skeleton className="w-32 h-full rounded-none" />
        </div>
        <div className="p-6 space-y-4 flex-grow bg-white">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[#EAE2D5] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-3 flex-grow">
                <Skeleton className="w-64 h-5" />
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-full h-3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-8 rounded-lg" />
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 7. ChatSkeleton
export function ChatSkeleton() {
  return (
    <div className="space-y-1">
      <div className="px-2 mb-2">
        <Skeleton className="w-16 h-3" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-transparent">
          <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-8 h-3" />
            </div>
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-full h-3.5 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 8. MessageSkeleton
export function MessageSkeleton() {
  return (
    <div className="space-y-4 flex flex-col justify-end h-full">
      <div className="flex justify-start">
        <div className="max-w-xs w-48 rounded-2xl rounded-bl-none border border-[#EAE2D5] bg-[#FDFBF7] px-4 py-3 shadow-3xs space-y-2">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-5/6 h-3" />
          <div className="flex justify-end pt-1">
            <Skeleton className="w-8 h-2" />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-xs w-64 rounded-2xl rounded-br-none bg-[#241E1A]/10 px-4 py-3 shadow-3xs space-y-2">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-4/5 h-3" />
          <Skeleton className="w-2/3 h-3" />
          <div className="flex justify-end pt-1">
            <Skeleton className="w-8 h-2" />
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-xs w-36 rounded-2xl rounded-bl-none border border-[#EAE2D5] bg-[#FDFBF7] px-4 py-3 shadow-3xs space-y-2">
          <Skeleton className="w-full h-3" />
          <div className="flex justify-end pt-1">
            <Skeleton className="w-8 h-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

