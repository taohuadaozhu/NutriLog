import React from 'react';

interface Props {
  label: string;
  value: number;
  unit: string;
  colorClass: string;
  icon?: React.ReactNode;
}

export const NutrientCard: React.FC<Props> = ({ label, value, unit, colorClass, icon }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100">
      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</span>
      <div className={`text-2xl font-bold ${colorClass} flex items-baseline gap-1`}>
        {value.toLocaleString()} 
        <span className="text-sm font-normal text-gray-400">{unit}</span>
      </div>
      {icon && <div className="mt-2 text-gray-400">{icon}</div>}
    </div>
  );
};
