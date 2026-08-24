"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StudentDetail } from "../[id]/student-detail";

function ProfileInner() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  if (!id) return <p className="text-sm text-zinc-500">Missing student id.</p>;
  return <StudentDetail id={id} />;
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading profile…</p>}>
      <ProfileInner />
    </Suspense>
  );
}
