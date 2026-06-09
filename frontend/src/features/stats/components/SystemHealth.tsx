import React from 'react';
import { 
  Timer, 
  Thermometer, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const healthItems = [
  { label: 'Uptime',        value: '14d 06h 22m',  color: 'bg-emerald-500', percent: 98, icon: Timer },
  { label: 'Temperature',   value: '42.5°C',        color: 'bg-amber-500',  percent: 45, icon: Thermometer },
  { label: 'Memory Usage',  value: '256MB / 1GB',   color: 'bg-primary',    percent: 25, icon: Cpu },
];

export const SystemHealth: React.FC = () => (
  <Card className="shadow-sm border-border/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-bold tracking-tight text-foreground mt-2 ml-2">System Health</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6 p-6">
      {healthItems.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground/85" />
              {item.label}
            </span>
            <span className="text-sm font-bold text-foreground">{item.value}</span>
          </div>
          <div className="h-2 bg-muted/60 rounded-full overflow-hidden border border-border/10 shadow-inner">
            <div 
              className={`h-full ${item.color} rounded-full transition-all duration-500 ease-out`} 
              style={{ width: `${item.percent}%` }}
            />
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/50 flex items-center gap-4 transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/5">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-sm animate-pulse">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">All Systems Nominal</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Last checked: 1 min ago</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
