import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  isNeutral?: boolean;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive,
  isNeutral,
  subtext,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="bg-[#F4F7FA] border border-slate-300 rounded-xl p-5 shadow-xs hover:border-slate-400 transition">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#9D00FF] flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {change && (
          <div
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isNeutral
                ? 'bg-slate-100 text-slate-600'
                : isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-[#FE1D01]'
            }`}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3 mr-1" />
            ) : isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-1" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{subtext}</span>
          {badge && (
            <span className="text-[10px] font-medium bg-[#E2E7EE] text-slate-700 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
