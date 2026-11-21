"use client";

import { useEffect, useState } from "react";
import SafetyNote from "./SafetyNote";

interface EntrySafetyPanelProps {
  slug: string;
  plantName: string;
}

export default function EntrySafetyPanel({
  slug,
  plantName,
}: EntrySafetyPanelProps) {
  const [note, setNote] = useState("");
  const [source, setSource] = useState<"llm" | "mock">("mock");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, query: plantName }),
        });
        if (!response.ok) {
          throw new Error("Could not load safety note");
        }
        const data = (await response.json()) as {
          safetyNote?: string;
          safetySource?: "llm" | "mock";
        };
        if (!cancelled) {
          setNote(data.safetyNote || "No safety note returned.");
          setSource(data.safetySource === "llm" ? "llm" : "mock");
        }
      } catch {
        if (!cancelled) {
          setError(
            "Safety note could not be loaded. Traditional knowledge above remains available."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, plantName]);

  if (error) {
    return (
      <p className="border border-moss/30 bg-moss-pale/40 px-4 py-3 font-body text-sm text-forest-deep">
        {error}
      </p>
    );
  }

  return <SafetyNote note={note} source={source} loading={loading} />;
}
