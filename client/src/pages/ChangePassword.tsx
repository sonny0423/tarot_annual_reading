import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, KeyRound } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ChangePassword() {
  const [, navigate] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: (result) => {
      setError("");
      setSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => navigate("/"), 1200);
    },
    onError: (err) => {
      setSuccess("");
      setError(err.message);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("兩次輸入的新密碼不一致");
      return;
    }

    changePassword.mutate({ currentPassword, newPassword });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首頁
        </button>

        <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-white">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">變更密碼</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              為了保護帳號安全，請先輸入目前密碼，再設定新密碼。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                目前密碼
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="輸入目前密碼"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                新密碼
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="至少 8 個字元"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                確認新密碼
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="再次輸入新密碼"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}，即將返回首頁。
              </p>
            )}

            <button
              type="submit"
              disabled={changePassword.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-amber-500 px-4 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-amber-600 focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changePassword.isPending ? "變更中..." : "確認變更密碼"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
