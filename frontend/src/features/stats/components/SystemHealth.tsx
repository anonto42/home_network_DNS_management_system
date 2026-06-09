import React from 'react';
import { 
  Timer, 
  Thermometer, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const healthItems = [
  { label: 'Uptime', value: '14d 06h 22m', color: 'bg-primary', percent: 98, icon: Timer },
  { label: 'Temperature', value: '42.5°C', color: 'bg-orange-500', percent: 45, icon: Thermometer },
  { label: 'Memory Usage', value: '256MB / 1GB', color: 'bg-blue-500', percent: 25, icon: Cpu },
];

export const SystemHealth: React.FC = () => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-bold tracking-tight text-foreground mt-2 ml-2">System Health</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6 p-6">
      {healthItems.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </span>
            <span className="text-sm font-bold text-foreground">{item.value}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${item.color} transition-all duration-500 opacity-80`} 
              style={{ width: `${item.percent}%` }}
            ></div>
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/10">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">All Systems Nominal</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Last checked: 1 min ago</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

