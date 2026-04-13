import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProjectPreview from "../components/ProjectPreview";
import api from "../configs/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import type { Project } from "../types";
import type { ProjectPreviewRef } from "../components/ProjectPreview";

const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const previewRef = useRef<ProjectPreviewRef>(null);

  const { session, isPending } = useAuth();

  const pollingRef = useRef(false);

  /* ---------------- FETCH PROJECT ---------------- */

  const fetchProject = async () => {
    if (!projectId || pollingRef.current) return;

    pollingRef.current = true;

    try {
      const { data } = await api.get(`/api/user/project/${projectId}`);

      setProject(data.project);

      if (data.project.current_code) {
        setIsGenerating(false);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      pollingRef.current = false;
    }
  };

  /* ---------------- SAVE PROJECT ---------------- */

  const saveProject = async () => {
    let code = previewRef.current?.getCode()?.trim();

    // fallback if editor ref didn't return anything
    if (!code && project?.current_code) {
      code = project.current_code;
    }

    if (!code) {
      toast.error("No code to save");
      return;
    }

    setIsSaving(true);

    try {
      await api.put(`/api/project/save/${projectId}`, { code });

      // refresh project from DB to guarantee persistence
      await api.get(`/api/user/project/${projectId}`);

      setProject((prev) => (prev ? { ...prev, current_code: code } : null));

      toast.success("Project saved successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save project",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- DOWNLOAD CODE ---------------- */

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;

    if (!code) return;

    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/html" });

    element.href = URL.createObjectURL(file);
    element.download = "index.html";

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  /* ---------------- PUBLISH ---------------- */

  const togglePublish = async () => {
    try {
      await api.get(`/api/user/publish-toggle/${projectId}`);

      setProject((prev) =>
        prev ? { ...prev, isPublished: !prev.isPublished } : null,
      );

      toast.success("Publish status updated");
    } catch (error) {
      toast.error("Error updating publish status");
      console.error(error);
    }
  };

  /* ---------------- AUTH CHECK ---------------- */

  useEffect(() => {
    if (session?.user) {
      void fetchProject();
    } else if (!isPending && !session?.user) {
      navigate("/auth/signin");
      toast("Please login to view your projects");
    }
  }, [isPending, navigate, session?.user]);

  /* ---------------- POLLING ---------------- */

  useEffect(() => {
    if (!projectId || !isGenerating) return;

    const interval = setInterval(() => {
      if (!isSaving) fetchProject();
    }, 3000);

    return () => clearInterval(interval);
  }, [projectId, isSaving]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-violet-200" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return project ? (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      {/* NAVBAR */}

      <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2">
        {/* LEFT */}

        <div className="flex items-center gap-2 sm:min-w-90">
          <img
            src="/favicon.svg"
            alt="logo"
            className="h-6 cursor-pointer"
            onClick={() => navigate("/")}
          />

          <div className="max-w-64 sm:max-w-xs">
            <p className="text-sm capitalize truncate">{project.name}</p>
            <p className="text-xs text-gray-400">
              Previewing last saved version
            </p>
          </div>

          <div className="sm:hidden flex-1 flex justify-end">
            {isMenuOpen ? (
              <MessageSquareIcon
                onClick={() => setIsMenuOpen(false)}
                className="size-6 cursor-pointer"
              />
            ) : (
              <XIcon
                onClick={() => setIsMenuOpen(true)}
                className="size-6 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* DEVICE SWITCH */}

        <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md">
          <SmartphoneIcon
            onClick={() => setDevice("phone")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "phone" ? "bg-gray-700" : ""
            }`}
          />

          <TabletIcon
            onClick={() => setDevice("tablet")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "tablet" ? "bg-gray-700" : ""
            }`}
          />

          <LaptopIcon
            onClick={() => setDevice("desktop")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "desktop" ? "bg-gray-700" : ""
            }`}
          />
        </div>

        {/* RIGHT ACTIONS */}

        <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
          {/* SAVE */}

          <button
            onClick={saveProject}
            disabled={isSaving}
            className={`max-sm:hidden px-3.5 py-1 flex items-center gap-2 rounded border border-gray-700 ${
              isSaving
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              <SaveIcon size={16} />
            )}
            Save
          </button>

          {/* PREVIEW */}

          <Link
            target="_blank"
            to={`/preview/${projectId}`}
            className="flex items-center gap-2 px-4 py-1 border border-gray-700 rounded hover:border-gray-500"
          >
            <FullscreenIcon size={16} />
            Preview
          </Link>

          {/* DOWNLOAD */}

          <button
            onClick={downloadCode}
            className="bg-gradient-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 px-3.5 py-1 flex items-center gap-2 rounded"
          >
            <ArrowBigDownDashIcon size={16} />
            Download
          </button>

          {/* PUBLISH */}

          <button
            onClick={togglePublish}
            className="bg-gradient-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 px-3.5 py-1 flex items-center gap-2 rounded"
          >
            {project.isPublished ? (
              <EyeOffIcon size={16} />
            ) : (
              <EyeIcon size={16} />
            )}

            {project.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* BUILDER */}

      <div className="flex-1 flex overflow-auto">
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={(p) => setProject(p)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />

        <div className="flex-1 p-2 pl-0">
          <ProjectPreview
            ref={previewRef}
            project={project}
            isGenerating={isGenerating}
            device={device}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-200">
        Unable to Load Project!
      </p>
    </div>
  );
};

export default Projects;
