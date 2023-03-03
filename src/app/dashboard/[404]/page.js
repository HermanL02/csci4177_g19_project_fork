"use client";

import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="container flex flex-col h-screen items-center justify-center gap-16">
      <div className="flex items-center justify-center gap-8 text-neutral-400">
        <DocumentMagnifyingGlassIcon className="w-36 text-neutral-700/[0.8]" />
        <section className="flex flex-col gap-4 drop-shadow-lg">
          <h1 className="text-5xl font-extrabold text-orange-200">404</h1>
          <p className="font-medium">
            Page does not exist <br /> or is under construction.
          </p>
        </section>
      </div>
      <button className="rounded-lg border border-neutral-600 bg-black px-6 py-2 shadow-xl shadow-orange-200/[0.1]" onClick={() => router.back()}>
        Take me back
      </button>
    </div>
  );
}
