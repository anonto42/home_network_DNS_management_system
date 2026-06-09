import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children, activeTab, setTab }) => (
  <div className="bg-surface text-on-surface">
    <Sidebar activeTab={activeTab} setTab={setTab} />
    <Header />
    <main className="ml-[280px] pt-16 min-h-screen p-xl max-w-[1440px]">
      {children}
    </main>
  </div>
);
