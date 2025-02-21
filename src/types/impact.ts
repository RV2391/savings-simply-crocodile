
export interface ImpactMetrics {
  savings: {
    last30Days: number;
    total: number;
  };
  watchTime: {
    last30Days: number; // in minutes
    total: number;
  };
  completedCourses: {
    last30Days: number;
    total: number;
  };
}

export interface ImpactCardProps {
  title: string;
  value: string | number;
  subValue?: string | number;
  description: string;
  trend?: number; // percentage change
}
