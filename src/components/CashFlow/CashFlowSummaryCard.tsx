import React from 'react';

interface CashFlowSummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  isBalance?: boolean;
}

const CashFlowSummaryCard: React.FC<CashFlowSummaryCardProps> = ({ 
  title, 
  amount, 
  icon, 
  color, 
  isBalance = false 
}) => {
  const getAmountColor = () => {
    if (isBalance) {
      return amount >= 0 ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-900';
  };

  const formatAmount = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${getAmountColor()}`}>
            {isBalance && amount < 0 ? '-' : ''}₪{formatAmount(Math.abs(amount))}
          </p>
          {isBalance && (
            <div className="flex items-center mt-2 justify-end">
              <span className={`text-xs font-medium ${getAmountColor()}`}>
                {amount >= 0 ? 'יתרה חיובית' : 'יתרה שלילית'}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default CashFlowSummaryCard;