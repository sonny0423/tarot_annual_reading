import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      setError(err.message || "發送失敗，請稍後再試");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("請輸入帳號");
      return;
    }
    forgotMutation.mutate({ email: email.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-amber-400 mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">塔羅流年運勢查詢</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!submitted ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">忘記密碼</h2>
              <p className="text-sm text-gray-500 mb-6">
                請輸入您註冊時使用的 <strong>Email 地址</strong>，我們將發送重設密碼連結給您。
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-700">Email 地址</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="請輸入註冊 Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 text-white font-semibold text-base shadow-lg shadow-purple-200/50"
                >
                  {forgotMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      發送中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      發送重設連結
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">連結已發送</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                若此帳號存在，重設密碼連結已發送到您的 Email。<br />
                請檢查您的收件匣（包含垃圾郵件資料夾）。<br />
                連結將在 <strong>1 小時</strong>後失效。
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login">
              <button className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium">
                <ArrowLeft className="w-4 h-4" />
                返回登入
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
