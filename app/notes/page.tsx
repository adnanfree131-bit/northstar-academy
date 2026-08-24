"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Lock, PushPin } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { apiGet, apiPost } from "@/lib/api";

type Note = {
  id: string;
  student_id: string | null;
  title: string;
  body: string;
  category: string;
  confidential: number;
  pinned: number;
  author: string;
  created_at: string;
};

const categories = ["all", "sen", "medical", "discipline", "finance", "academic", "general"];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [source, setSource] = useState<"d1" | "empty">("empty");
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [confidential, setConfidential] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await apiGet<Note[]>("/api/notes");
    if (data) {
      setNotes(data);
      setSource("d1");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? notes : notes.filter((n) => n.category === filter)),
    [notes, filter]
  );

  async function addNote() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    const created = await apiPost<Note>("/api/notes", {
      title: title.trim(),
      body: body.trim(),
      category,
      confidential,
      author: "Sara Malik",
    });
    setSaving(false);
    if (created) {
      setTitle("");
      setBody("");
      setConfidential(false);
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Notes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Staff notes, SEN flags, medical protocols, and confidential records
            {source === "d1" ? " · live from D1" : " · API not connected"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader title="Add note" description="Confidential notes are hidden from the parent portal" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-300"
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none"
            >
              {categories.filter((c) => c !== "all").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={confidential}
                onChange={(e) => setConfidential(e.target.checked)}
              />
              Confidential
            </label>
          </div>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Note details, follow-up, and edge-case instructions..."
          className="mt-3 min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-300"
        />
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={addNote} loading={saving}>
            <Plus className="h-4 w-4" weight="bold" />
            Save note
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
              filter === c ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((note) => (
          <div key={note.id} className="bezel">
            <div className="bezel-inner p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-zinc-900">{note.title}</p>
                    {note.pinned ? <PushPin className="h-4 w-4 text-amber-600" weight="fill" /> : null}
                    {note.confidential ? (
                      <Badge variant="danger">
                        <Lock className="mr-1 h-3 w-3" />
                        Confidential
                      </Badge>
                    ) : null}
                    <Badge variant="muted">{note.category}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {note.author} · {note.created_at}
                    {note.student_id ? ` · ${note.student_id}` : " · school-wide"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{note.body}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <p className="py-10 text-center text-sm text-zinc-500">
            {source === "d1" ? "No notes in this category." : "Connect D1 to load and save notes."}
          </p>
        </Card>
      )}
    </div>
  );
}
