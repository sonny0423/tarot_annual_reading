import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CardsLibrary from "./pages/CardsLibrary";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import AdminUsers from "./pages/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./_core/hooks/useAuth";

function SubscriptionBlockedPage({ status, user, onLogout }: { status: 'suspended' | 'expired'; user: any; onLogout: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          {status === 'suspended' ? '帳號已暫停' : '使用期限已到期'}
        </h1>
        <p className="text-gray-500 mb-6">
          {status === 'suspended'
            ? '您的帳號已被管理員暫停，請聯繫管理員以恢復使用權限。'
            : '您的 180 天使用期限已到期，請聯繫管理員以續期。'}
        </p>
        <button
          onClick={onLogout}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          登出
        </button>
      </div>
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 mb-4 animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/welcome" />;
  }

  // Admin is never blocked by subscription
  const isAdmin = (user as any).role === 'admin';
  const subStatus = (user as any).subscriptionStatus;
  if (!isAdmin && (subStatus === 'suspended' || subStatus === 'expired')) {
    return <SubscriptionBlockedPage status={subStatus} user={user} onLogout={logout} />;
  }

  return <>{children}</>;
}

// Redirect logged-in users away from public pages (landing, login)
function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-amber-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 mb-4 animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/welcome">
        <PublicOnlyGuard>
          <Landing />
        </PublicOnlyGuard>
      </Route>
      <Route path="/login">
        <PublicOnlyGuard>
          <Login />
        </PublicOnlyGuard>
      </Route>
      <Route path="/forgot-password">
        <PublicOnlyGuard>
          <ForgotPassword />
        </PublicOnlyGuard>
      </Route>
      <Route path="/reset-password">
        <ResetPassword />
      </Route>
      <Route path="/">
        <AuthGuard>
          <Home />
        </AuthGuard>
      </Route>
      <Route path="/cards">
        <AuthGuard>
          <CardsLibrary />
        </AuthGuard>
      </Route>
      <Route path="/admin/users">
        <AuthGuard>
          <AdminUsers />
        </AuthGuard>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
