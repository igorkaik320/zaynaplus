import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Clock } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useBeforeUnloadDraftGuard } from "@/lib/draftGuard";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import AppLayout from "@/components/AppLayout";
import type { ModuleKey } from "@/lib/modulePermissions";
import { Lock } from "lucide-react";
import { MaintenanceNotificationProvider } from "@/lib/maintenanceNotifications";

// Lazy-loaded pages — apenas essenciais
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const FornecedoresPage = lazy(() => import("./pages/FornecedoresPage"));
const EmpresasPage = lazy(() => import("./pages/EmpresasPage"));
const ContasPagarPage = lazy(() => import("@/pages/ContasPagarPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min default
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function DraftGuards() {
  useBeforeUnloadDraftGuard();
  return null;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Carregando...</p>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Carregando módulo...</p>
    </div>
  );
}

function PendingApprovalScreen() {
  const { signOut } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <Clock className="h-14 w-14 text-muted-foreground" />
      <h2 className="text-xl font-bold">Aguardando aprovação</h2>
      <p className="max-w-md text-center text-muted-foreground">
        Seu cadastro foi realizado com sucesso. Um administrador precisa liberar seu acesso antes que você possa utilizar o sistema.
      </p>
      <button onClick={signOut} className="mt-4 text-sm text-primary underline hover:no-underline">Sair</button>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isPending } = useAuth();

  if (!user && loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" />;
  if (isPending) return <PendingApprovalScreen />;

  return <AppLayout>{children}</AppLayout>;
}

function HomeRoute() {
  const { user, loading, userRole } = useAuth();
  const { canAccess, loading: permLoading } = useModulePermissions();

  if (!user && loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" />;
  if (permLoading) return <LoadingScreen />;

  if (userRole === "admin") return <Navigate to="/controle-caixa" replace />;

  const firstAccessibleRoute: Array<{ module: ModuleKey; path: string }> = [
    { module: "controle_caixa", path: "/controle-caixa" },
    { module: "contas_pagar", path: "/contas-pagar" },
    { module: "fornecedores", path: "/fornecedores" },
    { module: "empresas", path: "/empresas" },
    { module: "usuarios", path: "/usuarios" },
  ];

  const target = firstAccessibleRoute.find((entry) => canAccess(entry.module));
  if (target) return <Navigate to={target.path} replace />;

  return (
    <AppLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Sem modulo liberado</h2>
        <p className="text-muted-foreground">Seu usuário ainda não tem acesso a nenhum módulo.</p>
      </div>
    </AppLayout>
  );
}

function ModuleRoute({ children, module }: { children: React.ReactNode; module: ModuleKey }) {
  const { user, loading } = useAuth();
  const { canAccess, loading: permLoading } = useModulePermissions();

  if (!user && loading) return <LoadingScreen />;
  if (permLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" />;

  if (!canAccess(module)) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar este módulo.
          </p>
        </div>
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, userRole } = useAuth();

  if (!user && loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" />;
  if (userRole !== "admin") return <Navigate to="/" />;

  return <AppLayout>{children}</AppLayout>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (!user && loading) return null;
  if (user) return <Navigate to="/" />;

  return <>{children}</>;
}

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DraftGuards />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <MaintenanceNotificationProvider>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
                <Route path="/" element={<HomeRoute />} />
                <Route path="/contas-pagar" element={<ModuleRoute module="contas_pagar"><ContasPagarPage /></ModuleRoute>} />
                <Route path="/controle-caixa" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/fornecedores" element={<ModuleRoute module="fornecedores"><FornecedoresPage /></ModuleRoute>} />
                <Route path="/empresas" element={<ModuleRoute module="empresas"><EmpresasPage /></ModuleRoute>} />
                <Route path="/usuarios" element={<AdminRoute><UserManagement /></AdminRoute>} />

                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </MaintenanceNotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
