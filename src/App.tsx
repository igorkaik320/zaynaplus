import { Suspense } from "react";
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

import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";
import FornecedoresPage from "./pages/FornecedoresPage";
import EmpresasPage from "./pages/EmpresasPage";
import ContasBancariasPage from "./pages/ContasBancariasPage";
import ContasPagarPage from "@/pages/ContasPagarPage";
import Index from "./pages/Index";
import FaturadosParcelasPage from "./pages/FaturadosParcelasPage";
import AgendaPage from "./pages/AgendaPage";
import PacientesPage from "./pages/PacientesPage";
import ProntuariosPage from "./pages/ProntuariosPage";
import ContasReceberPage from "./pages/ContasReceberPage";
import ProfissionaisPage from "./pages/ProfissionaisPage";
import ProcedimentosPage from "./pages/ProcedimentosPage";
import NotFound from "./pages/NotFound";

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
    <AppLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando módulo...</p>
      </div>
    </AppLayout>
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
  if (userRole === "admin") return <Navigate to="/contas-pagar" replace />;
  if (permLoading) return <LoadingScreen />;

  const firstAccessibleRoute: Array<{ module: ModuleKey; path: string }> = [
    { module: "agenda", path: "/agenda" },
    { module: "pacientes", path: "/pacientes" },
    { module: "prontuario", path: "/prontuario" },
    { module: "contas_receber", path: "/contas-receber" },
    { module: "controle_caixa", path: "/controle-caixa" },
    { module: "parcelas_faturadas", path: "/parcelas-faturadas" },
    { module: "contas_pagar", path: "/contas-pagar" },
    { module: "fornecedores", path: "/fornecedores" },
    { module: "empresas", path: "/empresas" },
    { module: "contas_bancarias", path: "/contas-bancarias" },
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
  const { user, loading, userRole } = useAuth();
  const { canAccess, loading: permLoading } = useModulePermissions();

  if (!user && loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" />;
  if (userRole === "admin") return <AppLayout>{children}</AppLayout>;
  if (permLoading) return <LoadingScreen />;

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
                <Route path="/controle-caixa" element={<ModuleRoute module="controle_caixa"><Index /></ModuleRoute>} />
                <Route path="/parcelas-faturadas" element={<ModuleRoute module="parcelas_faturadas"><FaturadosParcelasPage /></ModuleRoute>} />
                <Route path="/contas-pagar" element={<ModuleRoute module="contas_pagar"><ContasPagarPage /></ModuleRoute>} />
                <Route path="/contas-receber" element={<ModuleRoute module="contas_receber"><ContasReceberPage /></ModuleRoute>} />
                <Route path="/agenda" element={<ModuleRoute module="agenda"><AgendaPage /></ModuleRoute>} />
                <Route path="/pacientes" element={<ModuleRoute module="pacientes"><PacientesPage /></ModuleRoute>} />
                <Route path="/prontuario" element={<ModuleRoute module="prontuario"><ProntuariosPage /></ModuleRoute>} />
                <Route path="/profissionais" element={<ModuleRoute module="profissionais"><ProfissionaisPage /></ModuleRoute>} />
                <Route path="/procedimentos" element={<ModuleRoute module="procedimentos"><ProcedimentosPage /></ModuleRoute>} />
                <Route path="/fornecedores" element={<ModuleRoute module="fornecedores"><FornecedoresPage /></ModuleRoute>} />
                <Route path="/empresas" element={<ModuleRoute module="empresas"><EmpresasPage /></ModuleRoute>} />
                <Route path="/contas-bancarias" element={<ModuleRoute module="contas_bancarias"><ContasBancariasPage /></ModuleRoute>} />
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
