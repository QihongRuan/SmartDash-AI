import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { DashboardWidget } from '../types';

interface DynamicChartProps {
  chart: DashboardWidget;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DynamicChart: React.FC<DynamicChartProps> = ({ chart }) => {
  const xAxisKey = chart.xAxisKey || 'name';

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{fontSize: 12}} />
            <YAxis stroke="#64748b" tick={{fontSize: 12}} />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            {chart.series?.map((s, i) => (
              <Line 
                key={s.key}
                type="monotone" 
                dataKey={s.key} 
                name={s.name}
                stroke={s.color || COLORS[i % COLORS.length]} 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
            ))}
          </LineChart>
        );
      
      case 'area':
        return (
            <AreaChart data={chart.data}>
                <defs>
                  {chart.series?.map((s, i) => (
                    <linearGradient key={`grad-${s.key}`} id={`colorValue-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                {chart.series?.map((s, i) => (
                  <Area 
                    key={s.key}
                    type="monotone" 
                    dataKey={s.key} 
                    name={s.name}
                    stroke={s.color || COLORS[i % COLORS.length]} 
                    fillOpacity={1} 
                    fill={`url(#colorValue-${s.key})`} 
                  />
                ))}
            </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{fontSize: 12}} />
            <YAxis stroke="#64748b" tick={{fontSize: 12}} />
            <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            {chart.series?.map((s, i) => (
              <Bar 
                key={s.key}
                dataKey={s.key} 
                name={s.name}
                fill={s.color || COLORS[i % COLORS.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const valueKey = chart.series?.[0]?.key || 'value';
        return (
          <PieChart>
            <Pie
              data={chart.data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={valueKey}
              nameKey={xAxisKey}
            >
              {chart.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart() || <div>Unsupported Chart Type</div>}
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicChart;