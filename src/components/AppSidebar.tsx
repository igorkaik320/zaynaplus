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
      { title: 'Contas a Pagar', url: '/contas-pagar', icon: Package, module: 'contas_pagar' },
    ],
  });

  groups.push({
    key: 'cadastros',
    label: 'Cadastros',
    icon: Cog,
    items: [
      { title: 'Fornecedores', url: '/fornecedores', icon: Truck, module: 'fornecedores' },
      { title: 'Empresas', url: '/empresas', icon: Building2, module: 'empresas' },
      { title: 'Conta Bancaria', url: '/contas-bancarias', icon: Landmark, module: 'contas_bancarias' },
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
          <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400">
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
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900',
            isActive && 'bg-slate-800 text-white font-semibold shadow-sm hover:bg-slate-800 hover:text-white'
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
        <div className="flex w-[64px] flex-col items-center border-r border-slate-900 bg-slate-950 py-4">
          {/* Logo */}
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#d6007a] shadow-[0_10px_28px_rgba(0,0,0,0.28)] ring-1 ring-white/15">
            <span className="font-serif text-[27px] italic leading-none">V</span>
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
                          ? 'bg-white text-slate-950 shadow-[0_8px_22px_rgba(0,0,0,0.28)]'
                          : isGroupActive
                          ? 'bg-white text-slate-950 shadow-[0_8px_22px_rgba(0,0,0,0.24)] ring-1 ring-white/10'
                          : 'text-slate-400 hover:bg-white/10 hover:text-white'
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
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/10 hover:text-white"
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
            'flex flex-col overflow-hidden bg-white transition-all duration-250 ease-in-out',
            openGroup ? 'w-[220px] border-r border-slate-200 shadow-[8px_0_28px_rgba(15,23,42,0.04)]' : 'w-0'
          )}
        >
          {openGroup && (
            <div className="flex h-full w-[220px] flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {openGroup.label}
                </h2>
                <button
                  onClick={() => setActiveGroup(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              {/* User info */}
              <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                <p className="truncate text-sm text-slate-700">{profile?.display_name}</p>
                <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
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
