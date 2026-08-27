"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";
import { Group, Row } from "@/components/ui/group";
import { useAuth } from "@/lib/auth";

export default function MorePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const role = user?.role;

  return (
    <div>
      <h1 className="text-display font-medium tracking-tight">More</h1>
      <p className="mt-1 mb-4 text-body text-muted">
        {user?.name} · {role}
      </p>

      <Group title="Campus" className="mb-6">
        <Link href="/exams">
          <Row>
            <span className="flex-1 text-body">Exams</span>
            <CaretRight className="h-4 w-4 text-faint" />
          </Row>
        </Link>
        <Link href="/timetable">
          <Row>
            <span className="flex-1 text-body">Timetable</span>
            <CaretRight className="h-4 w-4 text-faint" />
          </Row>
        </Link>
        {role === "principal" ? (
          <>
            <Link href="/staff">
              <Row>
                <span className="flex-1 text-body">Staff</span>
                <CaretRight className="h-4 w-4 text-faint" />
              </Row>
            </Link>
            <Link href="/settings">
              <Row>
                <span className="flex-1 text-body">Settings</span>
                <CaretRight className="h-4 w-4 text-faint" />
              </Row>
            </Link>
          </>
        ) : null}
        <Link href="/notes">
          <Row>
            <span className="flex-1 text-body">Notes</span>
            <CaretRight className="h-4 w-4 text-faint" />
          </Row>
        </Link>
      </Group>

      <Group title="Session">
        <button
          className="w-full"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <Row>
            <span className="text-body text-danger">Sign out</span>
          </Row>
        </button>
      </Group>
    </div>
  );
}
