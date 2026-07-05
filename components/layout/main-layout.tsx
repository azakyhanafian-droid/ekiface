import { Sidebar } from './sidebar';
import { Header } from './header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background print:bg-white print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
