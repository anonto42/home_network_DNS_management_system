import React from 'react';

export const Sidebar: React.FC<{ activeTab: string, setTab: (tab: string) => void }> = ({ activeTab, setTab }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'records', label: 'DNS Records', icon: 'dns' },
    { key: 'steering', label: 'Traffic Steering', icon: 'alt_route' },
    { key: 'blocklist', label: 'Security', icon: 'shield' },
    { key: 'logs', label: 'Activity Logs', icon: 'list_alt' },
  ];

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col p-md z-50">
      <div className="mb-xl flex items-center gap-md">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">NetShield DNS</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Enterprise Console</p>
        </div>
      </div>
      <nav className="flex-1 space-y-sm">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`w-full flex items-center gap-md p-md rounded-lg transition-colors duration-200 cursor-pointer active:scale-95 ${
              activeTab === item.key
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === item.key ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
            <span className="font-body-md text-body-md">{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="mb-xl w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg flex items-center justify-center gap-sm shadow-sm hover:opacity-90 active:scale-95 transition-all">
        <span className="material-symbols-outlined">add</span>
        Add New Zone
      </button>
      <div className="mt-auto space-y-sm">
        <a className="flex items-center gap-md p-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 cursor-pointer rounded-lg" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </a>
        <a className="flex items-center gap-md p-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 cursor-pointer rounded-lg" href="#">
          <span className="material-symbols-outlined">help_outline</span>
          <span className="font-body-md text-body-md">Support</span>
        </a>
      </div>
    </aside>
  );
};
