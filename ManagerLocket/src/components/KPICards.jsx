import React from 'react';
import {
  Users,
  TrendingUp,
  FileText,
  RotateCcw,
  Megaphone,
  DollarSign
} from 'lucide-react';

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const formatCurrency = (amount, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function KPICards({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
            <div className="h-10 w-10 bg-slate-100 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-slate-100 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">No data available</div>;
  }

  const kpiItems = [
    {
      label: 'Tổng người dùng',
      value: formatNumber(data.users?.total || 0),
      hint: data.users?.newLast7Days > 0
        ? `+${formatNumber(data.users.newLast7Days)} trong 7 ngày`
        : 'Chưa có dữ liệu',
      color: 'indigo',
      icon: Users,
    },
    {
      label: 'Người dùng mới (7 ngày)',
      value: formatNumber(data.users?.newLast7Days || 0),
      hint: data.users?.growthRate
        ? `${data.users.growthRate > 0 ? '+' : ''}${data.users.growthRate.toFixed(1)}% so với tuần trước`
        : 'Chưa có dữ liệu',
      color: 'emerald',
      icon: TrendingUp,
    },
    {
      label: 'Doanh thu tháng này',
      value: formatCurrency(data.revenue?.thisMonth || 0, data.revenue?.currency),
      hint: 'Sau khi trừ hoàn tiền',
      color: 'violet',
      icon: DollarSign,
    },
    {
      label: 'Bài đăng mới (24h)',
      value: formatNumber(data.posts?.last24h || 0),
      hint: `Tổng: ${formatNumber(data.posts?.total || 0)} bài đăng`,
      color: 'blue',
      icon: FileText,
    },
    {
      label: 'Yêu cầu hoàn tiền',
      value: formatNumber(data.refunds?.pending || 0),
      hint: 'Đang chờ xử lý',
      color: 'orange',
      icon: RotateCcw,
    },
    {
      label: 'Quảng cáo đang chạy',
      value: formatNumber(data.ads?.active || 0),
      hint: 'Active và chưa hết hạn',
      color: 'pink',
      icon: Megaphone,
    },
  ];

  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiItems.map((item, index) => {
        const style = colorStyles[item.color] || colorStyles.indigo;
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconColor} transition-colors group-hover:scale-110 duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              {item.hint.includes('+') && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {item.hint.split(' ')[0]}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">{item.label}</h3>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                {item.value}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {item.hint}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

