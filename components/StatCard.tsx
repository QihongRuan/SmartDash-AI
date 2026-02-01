import React from 'react';
import { 
  TrendingUp, TrendingDown, Minus, DollarSign, Users, Package, 
  Activity, Clock, BarChart2, AlertCircle 
} from 'lucide-react';
import { KPICardData } from '../types';

interface StatCardProps {
  kpi: KPICardData;
}

const StatCard: React.FC<StatCardProps> = ({ kpi }) => {
  const getIcon = () => {
    switch (kpi.iconHint) {
      case 'money': return <DollarSign size={22} />;
      case 'users': return <Users size={22} />;
      case 'box': return <Package size={22} />;
      case 'time': return <Clock size={22} />;
      case 'chart': return <BarChart2 size={22} />;
      case 'alert': return <AlertCircle size={22} />;
      case 'activity': 
      default: return <Activity size={22} />;
    }
  };

  const getTrendColor = () => {
    if (kpi.trend === 'up') return 'text-emerald-600 bg-emerald-50';
    if (kpi.trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getIconColor = () => {
    // Determine header icon background based on hint
    switch (kpi.iconHint) {
      case 'money': return 'bg-emerald-100 text-emerald-600';
      case 'alert': return 'bg-red-100 text-red-600';
      case 'users': return 'bg-blue-100 text-blue-600';
      case 'box': return 'bg-amber-100 text-amber-600';
      default: return 'bg-indigo-100 text-indigo-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide truncate pr-2">
            {kpi.label}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {kpi.value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg shrink-0 ${getIconColor()}`}>
            {getIcon()}
        </div>
      </div>
      
      {(kpi.trend || kpi.subValue) && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
          {kpi.trendValue && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${getTrendColor()}`}>
              {kpi.trend === 'up' && <TrendingUp size={12} />}
              {kpi.trend === 'down' && <TrendingDown size={12} />}
              {kpi.trend === 'neutral' && <Minus size={12} />}
              {kpi.trendValue}
            </span>
          )}
          {kpi.subValue && (
            <span className="text-xs text-slate-400 truncate max-w-[120px]">
              {kpi.subValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
