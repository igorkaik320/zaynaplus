import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { NavLink } from '@/components/NavLink';
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Building2,
  CalendarDays,
  Car,
  ChevronLeft,
  CircleDollarSign,
  Cog,
  Droplets,
  Eye,
  Factory,
  Flame,
  FileBarChart,
  Fuel,
  History,
  Landmark,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  MapPinned,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  UserCheck,
  Users,
  Wrench,
  Users as AdminIcon,
} from 'lucide-react';
import { ModuleKey } from '@/lib/modulePermissions';
import { confirmDraftDiscard } from '@/lib/draftGuard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  module?: ModuleKey;
}

interface MenuGroup {
  key: string;
  label: string;
  icon: any;
  items: MenuItem[];
}

export function AppSidebar() {
  const { userRole, profile, signOut } = useAuth();
  const { canAccess, loading: permLoading } = useModulePermissions();
  const isAdmin = userRole === 'admin';
  const location = useLocation();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const groups: MenuGroup[] = [];

  groups.push({
    key: 'financeiro',
    label: 'Financeiro',
    icon: CircleDollarSign,
    items: [
      { title: 'Controle de Caixa', url: '/controle-caixa', icon: Landmark, module: 'controle_caixa' },
      { title: 'Contas a Pagar', url: '/contas-pagar', icon: Package, module: 'contas_pagar' },
    ],
  });

  groups.push({
    key: 'cadastros',
    label: 'Cadastros',
    icon: Cog,
    items: [
      { title: 'Fornecedores', url: '/fornecedores', icon: Truck, module: 'fornecedores' },
    ],
  });

  if (isAdmin) {
    groups.push({
      key: 'seguranca',
      label: 'Segurança',
      icon: Lock,
      items: [
        { title: 'Usuários', url: '/usuarios', icon: Users },
      ],
    });
  }

  // Detect which group is active based on current route
  const currentGroupKey = groups.find((g) =>
    g.items.some((item) => location.pathname.startsWith(item.url))
  )?.key;

  function handleGroupClick(key: string) {
    setActiveGroup((prev) => (prev === key ? null : key));
  }

  function renderMenuItem(item: MenuItem) {
    const hasAccess = !item.module || canAccess(item.module);
    const locked = item.module && !hasAccess && !permLoading;

    if (locked) {
      return (
        <li key={item.url}>
          <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-white/30">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-sm">{item.title}</span>
            <Lock className="ml-auto h-3.5 w-3.5" />
          </div>
        </li>
      );
    }

    const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');

    return (
      <li key={item.url}>
        <NavLink
          to={item.url}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/75 transition-all duration-150 hover:bg-white/10 hover:text-white',
            isActive && 'bg-blue-500/90 text-white font-semibold shadow-[0_4px_14px_rgba(59,130,246,0.35)]'
          )}
          activeClassName=""
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.title}</span>
        </NavLink>
      </li>
    );
  }

  async function handleSignOut() {
    if (!confirmDraftDiscard()) return;
    await signOut();
  }

  const openGroup = groups.find((g) => g.key === activeGroup);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="sticky top-0 flex h-screen shrink-0">
        {/* Icon strip */}
        <div className="flex w-[60px] flex-col items-center border-r border-teal-100 bg-white py-4">
          {/* Logo */}
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md">
            <span className="text-lg font-black tracking-wider">Z</span>
          </div>

          {/* Group icons */}
          <nav className="flex flex-1 flex-col items-center gap-1">
            {groups.map((group) => {
              const isGroupActive = currentGroupKey === group.key;
              const isOpen = activeGroup === group.key;

              return (
                <Tooltip key={group.key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleGroupClick(group.key)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150',
                        isOpen
                          ? 'bg-teal-500 text-white shadow-[0_4px_14px_rgba(20,184,166,0.4)]'
                          : isGroupActive
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-slate-500 hover:bg-teal-50 hover:text-teal-700'
                      )}
                    >
                      <group.icon className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    {group.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Sign out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              Sair
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Expandable subitems panel */}
        <div
          className={cn(
            'flex flex-col overflow-hidden bg-teal-50/40 transition-all duration-250 ease-in-out',
            openGroup ? 'w-[220px] border-r border-teal-100' : 'w-0'
          )}
        >
          {openGroup && (
            <div className="flex h-full w-[220px] flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-teal-100 px-4 py-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700/70">
                  {openGroup.label}
                </h2>
                <button
                  onClick={() => setActiveGroup(null)}
                  className="rounded p-1 text-slate-400 hover:bg-teal-100 hover:text-teal-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              {/* User info */}
              <div className="border-b border-teal-100 px-4 py-3">
                <p className="truncate text-sm text-slate-700">{profile?.display_name}</p>
                <span className="mt-1 inline-flex rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                  {userRole === 'admin'
                    ? 'Administração'
                    : userRole === 'conferente'
                    ? 'Conferente'
                    : 'Operador'}
                </span>
              </div>

              {/* Items */}
              <ul className="flex-1 space-y-0.5 overflow-auto px-2 py-3">
                {openGroup.items.map(renderMenuItem)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
