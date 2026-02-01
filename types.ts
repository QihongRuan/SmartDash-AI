export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string; // e.g., "+15%"
  iconHint?: 'money' | 'users' | 'box' | 'activity' | 'time' | 'chart' | 'alert';
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  format?: 'currency' | 'number' | 'percent' | 'string';
}

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  tab: string; // e.g., "Overview", "Time Series", "Details"
  type: 'area' | 'bar' | 'line' | 'pie' | 'composed' | 'table';
  xAxisKey?: string; // For charts
  data: any[]; // Array of objects
  series?: ChartSeries[]; // For charts
  columns?: TableColumn[]; // For tables
}

export interface Insight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface DashboardData {
  dataset_title: string;
  dataset_summary: string;
  kpis: KPICardData[];
  widgets: DashboardWidget[]; // Replaced 'charts' with 'widgets' to include tables
  insights: Insight[];
}
