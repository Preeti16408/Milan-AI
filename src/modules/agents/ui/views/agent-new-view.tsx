"use client";

import { useRouter } from "next/navigation";
import { AgentForm } from "../components/agent-form";

export const AgentNewView = () => {
  const router = useRouter();

  return (
    <div className="flex-1 p-10 md:px-8 flex flex-col gap-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16rem] text-slate-500">
          Agents
        </p>
        <h1 className="text-3xl font-semibold">Create a New Agent</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Create a new AI agent with instructions that can be used in meetings and chat.
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <AgentForm
          onSuccess={() => router.push("/agents")}
          onCancel={() => router.push("/agents")}
        />
      </div>
    </div>
  );
};
