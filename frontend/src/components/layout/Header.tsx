import React from 'react';

export const Header: React.FC = () => (
  <header className="h-16 fixed top-0 right-0 w-[calc(100%-280px)] border-b border-outline-variant bg-surface flex justify-between items-center px-lg z-40">
    <div className="flex-1 max-w-md">
      <div className="relative focus-within:ring-2 focus-within:ring-primary rounded-lg transition-all">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input className="w-full bg-surface-container-low border-none rounded-lg pl-10 py-sm font-body-sm text-body-sm focus:ring-0" placeholder="Search queries, domains, or logs..." type="text"/>
      </div>
    </div>
    <div className="flex items-center gap-lg">
      <div className="flex items-center gap-md">
        <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">cloud_done</span>
        </button>
      </div>
      <div className="h-8 w-[1px] bg-outline-variant"></div>
      <div className="flex items-center gap-sm cursor-pointer group">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">account_circle</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">expand_more</span>
      </div>
    </div>
  </header>
);
