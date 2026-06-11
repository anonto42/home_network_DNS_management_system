import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Route as RouteIcon,
  Shield,
  ListTodo,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { useLayout } from '../../hooks/useLayout';
import { useAuth } from '../../hooks/useAuth';
import { useTour } from '../../contexts/TourContext';
import { apiDelete } from '../../hooks/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Logo = ({ collapsed }: { collapsed: boolean }) => (
  <div className={cn(
    "flex items-center transition-all duration-300",
    collapsed ? "justify-center" : "gap-3 overflow-hidden whitespace-nowrap"
  )}>
    <div className="w-9 h-9 bg-primary flex-shrink-0 flex items-center justify-center shadow-sm">
      <Shield size={20} className="text-primary-foreground" />
    </div>
    {!collapsed && (
      <div className="flex flex-col">
        <h1 className="text-base font-bold leading-tight tracking-tight text-foreground">NetShield</h1>
        <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase opacity-70">Enterprise</p>
      </div>
    )}
  </div>
);

export const SidebarContent: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  const { logout } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/records', label: 'DNS Records', icon: Server },
    { path: '/steering', label: 'Traffic Steering', icon: RouteIcon },
    { path: '/blocklist', label: 'Security', icon: Shield },
    { path: '/logs', label: 'Activity Logs', icon: ListTodo },
  ];

  const handleLogout = async () => {
    try { await apiDelete('/session') } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-8">
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 space-y-1 px-2" data-tour="sidebar-navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(
              "flex items-center transition-all duration-200 group relative rounded-md",
              collapsed ? "justify-center p-2 mx-1" : "gap-3 px-3 py-2 mx-1",
              isActive
                ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5 rounded-r-md rounded-l-none"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:translate-x-[2px]"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn(
              "h-5 w-5 shrink-0",
              !collapsed && "group-hover:scale-105 transition-transform duration-200"
            )} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mt-auto space-y-1">
        <button
          onClick={startTour}
          title={collapsed ? "System Tour" : undefined}
          className={cn(
            "w-full flex items-center transition-all duration-200 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10",
            collapsed ? "justify-center p-2 mx-1" : "gap-3 px-3 py-2 mx-1"
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">System Tour</span>}
        </button>

        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center transition-all duration-200 relative rounded-md",
            collapsed ? "justify-center p-2 mx-1" : "gap-3 px-3 py-2 mx-1",
            isActive
              ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5 rounded-r-md rounded-l-none"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:translate-x-[2px]"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "w-full flex items-center transition-all duration-200 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center p-2 mx-1" : "gap-3 px-3 py-2 mx-1"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useLayout();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 shadow-md",
        isSidebarCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 rounded-full shadow-md bg-card hover:bg-muted border border-border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-primary" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          )}
        </Button>
      </div>
      <SidebarContent collapsed={isSidebarCollapsed} />
    </aside>
  );
};
