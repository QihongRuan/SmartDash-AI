import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, PieChart as PieChartIcon, 
  Table as TableIcon, Map as MapIcon, Calendar, Sparkles,
  Settings2, X, Plus, Trash2, Check, RefreshCw
} from 'lucide-react';
import { DashboardData, DashboardWidget, ChartSeries } from '../types';
import StatCard from './StatCard';

interface DashboardProps {
  data: DashboardData;
  fileName: string;
}

// --- Constants ---
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  slate: '#64748B'
};
const PRESET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// --- Helpers ---
const formatValue = (value: any, format?: string) => {
  if (typeof value !== 'number') return value;
  if (format === 'currency') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  }
  if (format === 'percent') return `${value.toFixed(1)}%`;
  if (format === 'number') return value.toLocaleString();
  // Default auto-format
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

// --- Components ---

const ChartCard = ({ 
  title, 
  subtitle, 
  children, 
  onEdit, 
  isEditing 
}: { 
  title: string, 
  subtitle?: string, 
  children?: React.ReactNode,
  onEdit?: () => void,
  isEditing?: boolean
}) => (
  <div className={`bg-white rounded-xl p-5 shadow-sm border h-full flex flex-col transition-all duration-300 ${isEditing ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-100'}`}>
    <div className="mb-4 shrink-0 flex items-start justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {onEdit && (
        <button 
          onClick={onEdit}
          className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
          title="Customize Chart"
        >
          <Settings2 size={18} />
        </button>
      )}
    </div>
    <div className="flex-grow min-h-0 relative">
        {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-sm border border-slate-800 z-50">
        <p className="font-semibold mb-2 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-300">{entry.name}:</span>
            </div>
            <span className="font-mono font-medium">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Widget Customizer ---
const WidgetCustomizer: React.FC<{ 
  widget: DashboardWidget, 
  onUpdate: (updated: DashboardWidget) => void,
  onClose: () => void 
}> = ({ widget, onUpdate, onClose }) => {
  const dataKeys = widget.data.length > 0 ? Object.keys(widget.data[0]) : [];

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...widget, type: e.target.value as any });
  };

  const handleXAxisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...widget, xAxisKey: e.target.value });
  };

  const handleSeriesChange = (index: number, field: keyof ChartSeries, value: string) => {
    const newSeries = [...(widget.series || [])];
    newSeries[index] = { ...newSeries[index], [field]: value };
    onUpdate({ ...widget, series: newSeries });
  };

  const addSeries = () => {
    const firstNumericKey = dataKeys.find(k => typeof widget.data[0][k] === 'number') || dataKeys[0];
    const newSeries: ChartSeries = {
      key: firstNumericKey,
      name: firstNumericKey,
      color: PRESET_COLORS[(widget.series?.length || 0) % PRESET_COLORS.length]
    };
    onUpdate({ ...widget, series: [...(widget.series || []), newSeries] });
  };

  const removeSeries = (index: number) => {
    const newSeries = [...(widget.series || [])];
    newSeries.splice(index, 1);
    onUpdate({ ...widget, series: newSeries });
  };

  return (
    <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configuration</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Chart Type</label>
          <select 
            value={widget.type} 
            onChange={handleTypeChange}
            className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-1.5"
          >
            <option value="area">Area Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="composed">Composed (Line + Bar)</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">X-Axis Variable</label>
          <select 
            value={widget.xAxisKey || ''} 
            onChange={handleXAxisChange}
            className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-1.5"
          >
            {dataKeys.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">Series (Metrics)</label>
        <div className="space-y-2">
          {widget.series?.map((series, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input 
                type="color" 
                value={series.color || '#000000'}
                onChange={(e) => handleSeriesChange(idx, 'color', e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
              />
              <select 
                value={series.key}
                onChange={(e) => handleSeriesChange(idx, 'key', e.target.value)}
                className="flex-1 text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-1.5"
              >
                {dataKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <input 
                type="text" 
                value={series.name}
                onChange={(e) => handleSeriesChange(idx, 'name', e.target.value)}
                placeholder="Label"
                className="flex-1 text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
              />
              <button 
                onClick={() => removeSeries(idx)}
                className="text-slate-400 hover:text-red-500 p-1"
                disabled={(widget.series?.length || 0) <= 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button 
            onClick={addSeries}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={14} /> Add Metric
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Widget Renderer ---

const DynamicWidget: React.FC<{ config: DashboardWidget }> = ({ config }) => {
  const xAxisKey = config.xAxisKey || 'name';

  const CommonAxis = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
      <XAxis 
        dataKey={xAxisKey} 
        tick={{ fontSize: 11, fill: '#64748B' }} 
        axisLine={{ stroke: '#E2E8F0' }}
        tickLine={false}
        dy={10}
      />
      <YAxis 
        tick={{ fontSize: 11, fill: '#64748B' }} 
        axisLine={false}
        tickLine={false}
        tickFormatter={(val) => formatValue(val)}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
    </>
  );

  // --- Table Widget ---
  if (config.type === 'table' && config.columns) {
    return (
      <div className="overflow-x-auto h-full max-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs sticky top-0 z-10">
            <tr>
              {config.columns.map((col, i) => (
                <th key={i} className={`px-4 py-3 ${i === config.columns!.length - 1 ? 'text-right' : ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {config.data.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                {config.columns!.map((col, cIdx) => (
                  <td key={cIdx} className={`px-4 py-3 ${cIdx === config.columns!.length - 1 ? 'text-right' : ''}`}>
                    {col.format === 'percent' ? (
                       <span className={`px-2 py-1 rounded text-xs font-medium ${
                         row[col.key] > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                       }`}>
                         {formatValue(row[col.key], col.format)}
                       </span>
                    ) : (
                       <span className={cIdx === 0 ? 'font-medium text-slate-800' : 'text-slate-600 font-mono'}>
                         {formatValue(row[col.key], col.format)}
                       </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --- Chart Widgets ---
  return (
    <ResponsiveContainer width="100%" height={300}>
      {(() => {
        switch (config.type) {
          case 'area':
            return (
              <AreaChart data={config.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                   {config.series?.map((s, i) => (
                      <linearGradient key={s.key} id={`grad-${config.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color || COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={s.color || COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                   ))}
                </defs>
                {CommonAxis}
                {config.series?.map((s, i) => (
                  <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || COLORS.primary} fill={`url(#grad-${config.id}-${i})`} strokeWidth={2} />
                ))}
              </AreaChart>
            );
          case 'bar':
            return (
              <BarChart data={config.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                {CommonAxis}
                {config.series?.map((s, i) => (
                  <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={60} />
                ))}
              </BarChart>
            );
          case 'pie':
            return (
               <PieChart>
                 <Pie
                   data={config.data}
                   dataKey={config.series?.[0].key || 'value'}
                   nameKey={xAxisKey}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={4}
                 >
                   {config.data.map((entry, index) => (
                     <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
            );
          case 'composed':
            return (
               <ComposedChart data={config.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 {CommonAxis}
                 {config.series?.map((s, i) => {
                    if (i === 0) return <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || COLORS.primary} radius={[4,4,0,0]} />;
                    return <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || COLORS.purple} strokeWidth={3} dot={{r:3}} />;
                 })}
               </ComposedChart>
            );
          default: // Line
            return (
              <LineChart data={config.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                {CommonAxis}
                {config.series?.map((s, i) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || COLORS.primary} strokeWidth={3} dot={{r:3}} activeDot={{r:6}} />
                ))}
              </LineChart>
            );
        }
      })()}
    </ResponsiveContainer>
  );
};

// --- Main Component ---

const Dashboard: React.FC<DashboardProps> = ({ data: initialData, fileName }) => {
  // Local state for interactive editing without re-fetching
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  // Sync if props change (new file uploaded)
  useEffect(() => {
    setDashboardData(initialData);
  }, [initialData]);

  // Extract unique tabs from widgets
  const tabs = useMemo(() => {
    const allTabs = dashboardData.widgets.map(w => w.tab);
    return Array.from(new Set(allTabs));
  }, [dashboardData.widgets]);

  const [activeTab, setActiveTab] = useState(tabs[0] || 'Overview');

  // Filter widgets for active tab
  const activeWidgets = useMemo(() => {
    return dashboardData.widgets.filter(w => w.tab === activeTab);
  }, [dashboardData.widgets, activeTab]);

  const handleUpdateWidget = (updatedWidget: DashboardWidget) => {
    const newWidgets = dashboardData.widgets.map(w => 
      w.id === updatedWidget.id ? updatedWidget : w
    );
    setDashboardData({ ...dashboardData, widgets: newWidgets });
  };

  // Helper to map tab names to icons
  const getTabIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('overview')) return <LayoutDashboard size={16} />;
    if (n.includes('trend') || n.includes('time')) return <TrendingUp size={16} />;
    if (n.includes('breakdown') || n.includes('dist')) return <PieChartIcon size={16} />;
    if (n.includes('detail') || n.includes('table')) return <TableIcon size={16} />;
    if (n.includes('geo') || n.includes('region')) return <MapIcon size={16} />;
    return <Calendar size={16} />;
  };

  return (
    <div className="animate-fade-in pb-12">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{dashboardData.dataset_title}</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                {tabs.length > 0 ? 'Analysis Ready' : 'Processing'}
              </span>
              <span>{dashboardData.dataset_summary || `Analysis of ${fileName}`}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">AI Analysis Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {getTabIcon(tab)}
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Section (Always Visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardData.kpis.map((kpi, idx) => (
          <StatCard key={idx} kpi={kpi} />
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
        {activeWidgets.map((widget, idx) => {
          // Span 2 cols if it's the only widget or explicitly large (heuristic)
          const isFullWidth = activeWidgets.length === 1 || widget.type === 'area' || widget.type === 'composed';
          const isChart = widget.type !== 'table';
          const isEditing = editingWidgetId === widget.id;

          return (
            <div key={widget.id} className={isFullWidth ? 'lg:col-span-2' : ''}>
              <ChartCard 
                title={widget.title} 
                subtitle={widget.description}
                onEdit={isChart ? () => setEditingWidgetId(isEditing ? null : widget.id) : undefined}
                isEditing={isEditing}
              >
                {isEditing && (
                  <WidgetCustomizer 
                    widget={widget} 
                    onUpdate={handleUpdateWidget} 
                    onClose={() => setEditingWidgetId(null)} 
                  />
                )}
                <DynamicWidget config={widget} />
              </ChartCard>
            </div>
          );
        })}
      </div>

      {/* Insights Section (Always Visible at bottom) */}
      {dashboardData.insights && dashboardData.insights.length > 0 && (
        <div className="mt-10 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xl font-bold text-indigo-950">Strategic Insights</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {dashboardData.insights.map((insight, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    insight.type === 'positive' ? 'bg-emerald-500' : 
                    insight.type === 'negative' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">{insight.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-12 text-center border-t border-slate-200 pt-8">
         <p className="text-slate-400 text-sm">Generated by DashSmart AI • Context: {dashboardData.dataset_title}</p>
      </div>

    </div>
  );
};

export default Dashboard;