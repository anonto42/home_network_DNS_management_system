import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLayout } from '../../hooks/useLayout';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "transition-all duration-300 pt-16 min-h-screen",
          isSidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
