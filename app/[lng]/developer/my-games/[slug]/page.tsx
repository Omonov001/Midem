// app/developer/my-games/[slug]/page.tsx

import React from "react";
import EditGameForm from "../_components/edit-game-form";

// Next.js 14/15 uchun params interfeysi (Page dynamic route'dan slug'ni ushlash uchun)
interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function Page({ params }: PageProps) {
  // Promise bo'lsa await qilamiz, oddiy obyekt bo'lsa o'zini oladi
  const resolvedParams = await params;
  const currentSlug = resolvedParams?.slug;

  if (!currentSlug) {
    return (
      <div className="text-white p-8 text-center">
        URL manzildan oyin kaliti (slug) topilmadi.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-[1100px] mx-auto">
        {/* Biz yozgan formaga slug'ni PROP va KEY sifatida beramiz */}
        <EditGameForm gameSlug={currentSlug} key={currentSlug} />
      </div>
    </div>
  );
}
