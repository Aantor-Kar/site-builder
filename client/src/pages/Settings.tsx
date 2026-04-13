import { useAuth } from "@/context/AuthContext";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const cardClasses =
  "w-full max-w-xl rounded-3xl border border-white/10 bg-black/20 p-6 text-white shadow-xl shadow-indigo-950/20";

const Settings = () => {
  const navigate = useNavigate();
  const {
    session,
    isPending,
    updateProfile,
    changePassword,
    deleteAccount,
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate("/auth/signin");
      return;
    }

    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [isPending, navigate, session?.user]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      await updateProfile({ name, email });
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingPassword(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!window.confirm("This will permanently delete your account and projects.")) {
      return;
    }

    setDeletingAccount(true);

    try {
      await deleteAccount(deletePassword);
      toast.success("Account deleted");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setDeletingAccount(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[90vh] w-full max-w-5xl flex-col gap-6 px-4 py-12">
      <section className={cardClasses}>
        <p className="text-sm uppercase tracking-[0.25em] text-indigo-300/80">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Account settings</h1>
        <p className="mt-2 text-sm text-gray-300">
          Update the details used by your Node.js auth backend.
        </p>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
              required
            />
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>

      <section className={cardClasses}>
        <p className="text-sm uppercase tracking-[0.25em] text-indigo-300/80">
          Security
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Change password</h2>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">
              Current password
            </span>
            <input
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              type="password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">New password</span>
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              minLength={8}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
              required
            />
          </label>

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>

      <section className={cardClasses}>
        <p className="text-sm uppercase tracking-[0.25em] text-red-300/80">
          Danger Zone
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Delete account</h2>
        <p className="mt-2 text-sm text-gray-300">
          This removes your account, sessions, credits history, and saved
          projects.
        </p>

        <form onSubmit={handleDeleteAccount} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">
              Confirm password
            </span>
            <input
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              type="password"
              className="w-full rounded-xl border border-red-400/20 bg-white/5 px-4 py-3 outline-none transition focus:border-red-400"
              required
            />
          </label>

          <button
            type="submit"
            disabled={deletingAccount}
            className="rounded-xl bg-red-600 px-4 py-3 font-medium transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deletingAccount ? "Deleting..." : "Delete account"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Settings;
