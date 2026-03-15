import React, { useEffect, useRef, useState } from "react";
import type { Project, Message, Version } from "../types";
import {
  BotIcon,
  EyeIcon,
  Loader2Icon,
  SendIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../configs/axios";
import { toast } from "sonner";

interface SidebarProps {
  isMenuOpen: boolean;
  project: Project;
  setProject: (project: Project) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({
  isMenuOpen,
  project,
  setProject,
  isGenerating,
  setIsGenerating,
}: SidebarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  /* ---------------------- ROLLBACK ---------------------- */

  const handleRollback = async (versionId: string) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to roll back to this version?"
      );

      if (!confirm) return;

      setIsGenerating(true);

      await api.get(`/api/project/rollback/${project.id}/${versionId}`);

      const projectRes = await api.get(`/api/user/project/${project.id}`);

      setProject(projectRes.data.project);

      toast.success("Rolled back to selected version");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to rollback"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------------------- REVISION ---------------------- */

  const handleRevisions = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setIsGenerating(true);

    try {
      await api.post(`/api/project/revision/${project.id}`, {
        message: input,
      });

      const projectRes = await api.get(`/api/user/project/${project.id}`);

      setProject(projectRes.data.project);

      setInput("");

      toast.success("Changes applied");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Revision failed"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------------------- AUTO SCROLL ---------------------- */

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [project?.conversation?.length, project?.versions?.length, isGenerating]);

  /* ---------------------- UI ---------------------- */

  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all ${
        isMenuOpen ? "max-sm:w-0 overflow-hidden" : "w-full"
      }`}
    >
      <div className="flex flex-col h-full">

        {/* MESSAGE AREA */}

        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4"
        >
          {[...(project?.conversation ?? []), ...(project?.versions ?? [])]
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )
            .map((message) => {

              const isMessage = "content" in message;

              if (isMessage) {

                const msg = message as Message;
                const isUser = msg.role === "user";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-center gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                        <BotIcon className="size-5 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none"
                          : "rounded-tl-none bg-gray-800 text-gray-100"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserIcon className="size-5 text-gray-200" />
                      </div>
                    )}
                  </div>
                );
              }

              /* ---------- VERSION BLOCK ---------- */

              const ver = message as Version;

              return (
                <div
                  key={ver.id}
                  className="w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2"
                >
                  <div className="text-xs font-medium">
                    Code Updated
                    <br />
                    <span className="text-gray-500 text-xs font-normal">
                      {new Date(ver.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {project.current_version_index === ver.id ? (
                      <button className="px-3 py-1 rounded-md text-xs bg-gray-700">
                        Current version
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRollback(ver.id)}
                        className="px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                      >
                        Rollback
                      </button>
                    )}

                    <Link target="_blank" to={`/preview/${project.id}/${ver.id}`}>
                      <EyeIcon className="size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded" />
                    </Link>
                  </div>
                </div>
              );
            })}

          {/* LOADING AI */}

          {isGenerating && (
            <div className="flex items-start gap-3 justify-start">
              <BotIcon className="size-5 text-white" />

              <div className="flex gap-1.5 h-full items-end">
                <span className="size-2 rounded-full animate-bounce bg-gray-600" />
                <span
                  className="size-2 rounded-full animate-bounce bg-gray-600"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="size-2 rounded-full animate-bounce bg-gray-600"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}

        <form onSubmit={handleRevisions} className="m-3 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder="Describe your website or request changes..."
            className="w-full p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400"
            disabled={isGenerating}
          />

          <button
            disabled={isGenerating || !input.trim()}
            className="absolute bottom-2 right-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
          >
            {isGenerating ? (
              <Loader2Icon className="size-7 p-1.5 animate-spin" />
            ) : (
              <SendIcon className="size-7 p-1.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;