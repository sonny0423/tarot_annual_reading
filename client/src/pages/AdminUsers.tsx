import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserPlus, Trash2, PauseCircle, PlayCircle, Clock3, Check, X, Zap, Search } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim();

  // Reset password dialog state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string | null; email: string | null } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Create user dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", name: "", role: "user" as "user" | "admin" | "assistant" });

  // Delete user dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string | null; email: string | null } | null>(null);

  const { data, isLoading, refetch } = trpc.admin.getUsers.useQuery({ page, pageSize, search: normalizedSearch || undefined });
  const { data: pendingApplications, refetch: refetchPending } = trpc.admin.getPendingApplications.useQuery({ search: normalizedSearch || undefined });
  const { data: approvalMode, refetch: refetchApprovalMode } = trpc.admin.getRegistrationApprovalMode.useQuery();

  const updateApprovalModeMutation = trpc.admin.setRegistrationApprovalMode.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      refetchApprovalMode();
      refetchPending();
      refetch();
    },
    onError: (err) => {
      toast.error("切換註冊模式失敗：" + err.message);
    },
  });

  const reviewRegistrationMutation = trpc.admin.reviewRegistration.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      refetchPending();
      refetch();
    },
    onError: (err) => {
      toast.error("審核失敗：" + err.message);
    },
  });

  const updateRoleMutation = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      toast.success("角色已更新");
      refetch();
    },
    onError: (err) => {
      toast.error("更新失敗：" + err.message);
    },
  });

  const resetPasswordMutation = trpc.admin.resetUserPassword.useMutation({
    onSuccess: () => {
      toast.success("密碼已成功重設");
      setResetDialogOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    },
    onError: (err) => {
      toast.error("重設失敗：" + err.message);
    },
  });

  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("使用者已新增");
      setCreateDialogOpen(false);
      setCreateForm({ email: "", password: "", name: "", role: "user" });
      refetch();
    },
    onError: (err) => {
      toast.error("新增失敗：" + err.message);
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("使用者已刪除");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      refetch();
    },
    onError: (err) => {
      toast.error("刪除失敗：" + err.message);
    },
  });

  const updateSubscriptionMutation = trpc.admin.updateSubscriptionStatus.useMutation({
    onSuccess: () => {
      toast.success("訂閱狀態已更新");
      refetch();
    },
    onError: (err) => {
      toast.error("更新失敗：" + err.message);
    },
  });

  const handleOpenResetDialog = (u: { id: number; name: string | null; email: string | null }) => {
    setSelectedUser(u);
    setNewPassword("");
    setResetDialogOpen(true);
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    if (newPassword.length < 8) {
      toast.error("密碼至少需要 8 個字元");
      return;
    }
    resetPasswordMutation.mutate({ userId: selectedUser.id, newPassword });
  };

  const handleCreateUser = () => {
    if (createForm.email.length < 3) {
      toast.error("帳號至少需要 3 個字元");
      return;
    }
    if (createForm.password.length < 8) {
      toast.error("密碼至少需要 8 個字元");
      return;
    }
    createUserMutation.mutate({
      email: createForm.email,
      password: createForm.password,
      name: createForm.name || undefined,
      role: createForm.role,
    });
  };

  const handleOpenDeleteDialog = (u: { id: number; name: string | null; email: string | null }) => {
    setUserToDelete(u);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate({ userId: userToDelete.id });
  };

  // Redirect if not admin
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">請先登入</p>
          <Link href="/login">
            <Button>前往登入</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">無存取權限</p>
          <p className="text-muted-foreground mb-4">此頁面僅限管理員使用</p>
          <Link href="/">
            <Button variant="outline">返回首頁</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                ← 返回首頁
              </Button>
            </Link>
            <span className="text-muted-foreground">|</span>
            <h1 className="text-xl font-semibold text-foreground">用戶管理</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            管理員後台
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <section className={`mb-6 rounded-lg border overflow-hidden ${approvalMode?.mode === "instant" ? "border-violet-200 bg-violet-50/70" : "border-slate-200 bg-slate-50/80"}`}>
          <div className="px-5 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className={`w-5 h-5 ${approvalMode?.mode === "instant" ? "text-violet-600" : "text-slate-600"}`} />
                註冊審核模式
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {approvalMode?.mode === "instant"
                  ? "課堂快速開放中：新同學註冊後會立即啟用並登入系統。"
                  : "人工審核中：新同學送出申請後，須由管理員逐筆核准。"}
              </p>
              {approvalMode?.updatedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  最後切換：{new Date(approvalMode.updatedAt).toLocaleString("zh-TW")}（管理員 #{approvalMode.updatedBy ?? "—"}）
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-md bg-background/70 px-3 py-2 border border-border">
              <span className={`text-sm font-medium ${approvalMode?.mode === "instant" ? "text-violet-700" : "text-slate-700"}`}>
                {approvalMode?.mode === "instant" ? "課堂快速開放" : "人工審核"}
              </span>
              <Switch
                aria-label="切換課堂快速開放模式"
                checked={approvalMode?.mode === "instant"}
                onCheckedChange={(checked) => updateApprovalModeMutation.mutate({ mode: checked ? "instant" : "manual" })}
                disabled={!approvalMode || updateApprovalModeMutation.isPending}
              />
            </div>
          </div>
          {approvalMode?.events?.[0] && (
            <div className="px-5 py-2 border-t border-inherit text-xs text-muted-foreground">
              最近模式紀錄：{approvalMode.events[0].mode === "instant" ? "課堂快速開放" : "人工審核"}，由管理員 #{approvalMode.events[0].changedBy} 於 {new Date(approvalMode.events[0].changedAt).toLocaleString("zh-TW")} 切換。
            </div>
          )}
        </section>

        <section className="mb-8 rounded-lg border border-amber-200 bg-amber-50/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                <Clock3 className="w-5 h-5" /> 待審核註冊申請
              </h2>
              <p className="text-sm text-amber-800 mt-1">
                {approvalMode?.mode === "instant"
                  ? "快速開放期間的新帳號會立即啟用；此處仍可處理先前的待審核申請。"
                  : "核准前，申請人無法登入或使用運勢功能。"}
              </p>
            </div>
            <Badge className="bg-amber-500 text-white hover:bg-amber-500">{pendingApplications?.length ?? 0} 筆</Badge>
          </div>
          {pendingApplications && pendingApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-amber-200 hover:bg-transparent">
                  <TableHead>姓名</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>申請時間</TableHead>
                  <TableHead className="w-48">審核操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApplications.map((application) => (
                  <TableRow key={application.id} className="border-amber-200 hover:bg-amber-100/50">
                    <TableCell className="font-medium">{application.name || "（未設定）"}</TableCell>
                    <TableCell className="text-sm">{application.email || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(application.createdAt).toLocaleString("zh-TW", {
                        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => reviewRegistrationMutation.mutate({ userId: application.id, decision: "approved" })}
                          disabled={reviewRegistrationMutation.isPending}
                        >
                          <Check className="w-3.5 h-3.5" /> 核准
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => reviewRegistrationMutation.mutate({ userId: application.id, decision: "rejected" })}
                          disabled={reviewRegistrationMutation.isPending}
                        >
                          <X className="w-3.5 h-3.5" /> 拒絕
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">目前沒有待審核的註冊申請</div>
          )}
        </section>

        <section className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">搜尋使用者</h2>
              <p className="text-sm text-muted-foreground mt-1">可依姓名或完整 Email 篩選待審核申請與使用者名單。</p>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="輸入姓名或 Email 搜尋"
                aria-label="搜尋姓名或 Email"
                className="pl-9"
              />
            </div>
          </div>
          {normalizedSearch && (
            <p className="mt-3 text-sm text-muted-foreground">
              目前顯示符合「<span className="font-medium text-foreground">{normalizedSearch}</span>」的結果。
            </p>
          )}
        </section>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">註冊用戶名單</h2>
            <p className="text-muted-foreground mt-1">
              共 <span className="font-semibold text-foreground">{data?.total ?? 0}</span> 位用戶
            </p>
          </div>
          {/* 新增使用者按鈕 */}
          <Button
            onClick={() => {
              setCreateForm({ email: "", password: "", name: "", role: "user" });
              setCreateDialogOpen(true);
            }}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            新增使用者
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-muted-foreground">載入中...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>帳號</TableHead>
                  <TableHead className="w-24">登入方式</TableHead>
                  <TableHead className="w-24">角色</TableHead>
                  <TableHead className="w-44">註冊時間</TableHead>
                  <TableHead className="w-44">最後登入</TableHead>
                  <TableHead className="w-28">訂閱剩餘</TableHead>
                  <TableHead className="w-64">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground text-sm">{u.id}</TableCell>
                    <TableCell className="font-medium">
                      {u.name || <span className="text-muted-foreground italic">（未設定）</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.email || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {u.loginMethod || "email"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "admin" ? "default" : u.role === "assistant" ? "outline" : "secondary"}
                        className={u.role === "admin" ? "bg-purple-600 text-white" : u.role === "assistant" ? "border-blue-400 text-blue-600" : ""}
                      >
                        {u.role === "admin" ? "管理員" : u.role === "assistant" ? "助教" : "一般用戶"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleString("zh-TW", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.lastSignedIn
                        ? new Date(u.lastSignedIn).toLocaleString("zh-TW", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {u.role !== 'admin' ? (() => {
                        const subStatus = (u as any).subscriptionStatus || 'active';
                        const subStart = (u as any).subscriptionStart;
                        const elapsed = subStart
                          ? Math.floor((Date.now() - new Date(subStart).getTime()) / (1000 * 60 * 60 * 24))
                          : 0;
                        const daysLeft = Math.max(0, 180 - elapsed);
                        if (subStatus === 'suspended') {
                          return <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">已暫停</Badge>;
                        }
                        if (subStatus === 'expired' || daysLeft === 0) {
                          return <Badge variant="outline" className="text-xs border-red-400 text-red-600">已到期</Badge>;
                        }
                        return (
                          <span className={`text-xs font-medium ${
                            daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-green-600'
                          }`}>剩 {daysLeft} 天</span>
                        );
                      })() : <span className="text-xs text-muted-foreground">無限制</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={u.role ?? "user"}
                          onValueChange={(val) =>
                            updateRoleMutation.mutate({
                              userId: u.id,
                              role: val as "user" | "admin" | "assistant",
                            })
                          }
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="h-8 text-xs w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">一般用戶</SelectItem>
                            <SelectItem value="assistant">助教</SelectItem>
                            <SelectItem value="admin">管理員</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs px-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                          onClick={() => handleOpenResetDialog(u)}
                        >
                          重設密碼
                        </Button>
                        {/* 暫停/繼續按鈕（不顯示對管理員自己） */}
                        {u.id !== user.id && u.role !== 'admin' && (() => {
                          const subStatus = (u as any).subscriptionStatus || 'active';
                          const isSuspended = subStatus === 'suspended';
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-8 text-xs px-2 ${
                                isSuspended
                                  ? 'text-green-600 border-green-300 hover:bg-green-50'
                                  : 'text-orange-600 border-orange-300 hover:bg-orange-50'
                              }`}
                              onClick={() => updateSubscriptionMutation.mutate({
                                userId: u.id,
                                status: isSuspended ? 'active' : 'suspended',
                              })}
                              disabled={updateSubscriptionMutation.isPending}
                              title={isSuspended ? '繼續使用' : '暫停使用'}
                            >
                              {isSuspended
                                ? <PlayCircle className="w-3 h-3" />
                                : <PauseCircle className="w-3 h-3" />}
                            </Button>
                          );
                        })()}
                        {/* 不能刪除自己 */}
                        {u.id !== user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-2 text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleOpenDeleteDialog(u)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {normalizedSearch ? "沒有符合搜尋條件的使用者" : "尚無用戶資料"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一頁
            </Button>
            <span className="text-sm text-muted-foreground">
              第 {page} / {totalPages} 頁
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              下一頁
            </Button>
          </div>
        )}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重設用戶密碼</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              正在為用戶 <span className="font-semibold text-foreground">
                {selectedUser?.name || selectedUser?.email || `ID: ${selectedUser?.id}`}
              </span> 重設密碼
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">新密碼</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="請輸入新密碼（至少 8 個字元）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetDialogOpen(false);
                setNewPassword("");
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending || newPassword.length < 8}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {resetPasswordMutation.isPending ? "重設中..." : "確認重設"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增使用者</DialogTitle>
            <DialogDescription>
              填寫以下資料以新增一位使用者帳號
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">姓名（選填）</Label>
              <Input
                id="create-name"
                type="text"
                placeholder="使用者姓名"
                value={createForm.name}
                onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">帳號 <span className="text-red-500">*</span></Label>
              <Input
                id="create-email"
                type="text"
                placeholder="帳號（至少 3 個字元）"
                value={createForm.email}
                onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-password">密碼 <span className="text-red-500">*</span></Label>
              <Input
                id="create-password"
                type="password"
                placeholder="密碼（至少 8 個字元）"
                value={createForm.password}
                onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-role">角色</Label>
              <Select
                value={createForm.role}
                onValueChange={(val) => setCreateForm(f => ({ ...f, role: val as "user" | "admin" | "assistant" }))}
              >
                <SelectTrigger id="create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">一般用戶</SelectItem>
                  <SelectItem value="assistant">助教</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending || createForm.email.length < 3 || createForm.password.length < 8}
            >
              {createUserMutation.isPending ? "新增中..." : "確認新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>確認刪除使用者</DialogTitle>
            <DialogDescription>
              此操作無法復原，請確認是否要刪除此帳號。
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              即將刪除用戶：<span className="font-semibold text-foreground">
                {userToDelete?.name || userToDelete?.email || `ID: ${userToDelete?.id}`}
              </span>
            </p>
            {userToDelete?.email && userToDelete?.name && (
              <p className="text-sm text-muted-foreground mt-1">帳號：{userToDelete.email}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "刪除中..." : "確認刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
