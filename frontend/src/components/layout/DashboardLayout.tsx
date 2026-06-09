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
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main 
          className={cn(
            "flex-1 transition-all duration-300 pt-16 min-h-screen",
            isSidebarCollapsed ? "md:ml-20" : "md:ml-[280px]"
          )}
        >
          <div className="container mx-auto p-4 md:p-8 max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

