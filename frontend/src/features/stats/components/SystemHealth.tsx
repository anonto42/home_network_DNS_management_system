import React from 'react';

const healthItems = [
  { label: 'Uptime', value: '14d 06h 22m', color: 'bg-primary', percent: 98, icon: 'timer' },
  { label: 'Temperature', value: '42.5°C', color: 'bg-secondary', percent: 45, icon: 'thermostat' },
  { label: 'Memory Usage', value: '256MB / 1GB', color: 'bg-primary', percent: 25, icon: 'memory' },
];

export const SystemHealth: React.FC = () => (
  <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-lg">System Health</h3>
    <div className="space-y-lg">
      {healthItems.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between items-center mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface font-semibold">{item.value}</span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }}></div>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-xl p-md bg-surface-container-low rounded-lg border border-outline-variant flex items-center gap-md">
      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-on-secondary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <div>
        <p className="font-label-md text-label-md text-on-surface font-bold">All Systems Nominal</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Last checked: 1 min ago</p>
      </div>
    </div>
  </div>
);
