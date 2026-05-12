import { AppSidebar } from '@/components/AppSidebar';
import { NotificationMenu } from '@/components/notifications/NotificationMenu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
            <span className="h-5 w-1 rounded-full bg-[#d6007a]" />
            GESTAO VIRTUOSA
          </div>
          <div className="flex items-center gap-2">
            <NotificationMenu />
          </div>
        </header>
        <main className="flex-1 min-w-0 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
