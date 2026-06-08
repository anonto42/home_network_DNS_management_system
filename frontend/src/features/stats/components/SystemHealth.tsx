import React from 'react';
import { Card } from '../../../components/ui/Card';

export const SystemHealth: React.FC = () => (
  <Card className="space-y-lg">
    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-lg">System Health</h3>
    <div className="space-y-lg">
      {[
        { label: 'Uptime', value: '14d 06h 22m', color: 'bg-primary', percent: 98, icon: 'timer' },
        { label: 'Temperature', value: '42.5°C', color: 'bg-secondary', percent: 45, icon: 'thermostat' },
        { label: 'Memory Usage', value: '256MB / 1GB', color: 'bg-primary', percent: 25, icon: 'memory' },
      ].map((item) => (
        <div key={item.label}>
          <div className="flex justify-between items-center mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface font-semibold">{item.value}</span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
