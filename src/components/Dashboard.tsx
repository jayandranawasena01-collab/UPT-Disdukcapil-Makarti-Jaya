import { useMemo } from "react";
import { PelayananRecord, ServiceType } from "../types";
import { SERVICE_LABELS } from "../data";

interface DashboardProps {
  pelayananDB: Record<ServiceType, PelayananRecord[]>;
  onRefresh: () => void;
}

export default function Dashboard({ pelayananDB, onRefresh }: DashboardProps) {
  // Calculate counts for each service
  const stats = useMemo(() => {
    const data: Record<ServiceType, number> = {
      "Penerbitan KK": 0,
      "SKP WNI": 0,
      "Penerbitan Akta Kelahiran": 0,
      "Penerbitan Akta Kematian": 0,
      "Penerbitan Akta Perkawinan": 0,
      "Rekam KTP-EL": 0,
      "Aktivasi IKD": 0,
    };
    
    (Object.keys(pelayananDB) as ServiceType[]).forEach((key) => {
      data[key] = pelayananDB[key]?.length || 0;
    });

    return data;
  }, [pelayananDB]);

  const totalDocuments = useMemo(() => {
    return (Object.values(stats) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
  }, [stats]);

  // Card configurations showing visual gradients & icons matching original setup
  const serviceCards = [
    {
      type: "Penerbitan KK" as ServiceType,
      icon: "👥",
      gradient: "from-blue-600 to-indigo-700",
      accentColor: "#2563eb"
    },
    {
      type: "SKP WNI" as ServiceType,
      icon: "✈️",
      gradient: "from-emerald-500 to-teal-600",
      accentColor: "#10b981"
    },
    {
      type: "Penerbitan Akta Kelahiran" as ServiceType,
      icon: "👶",
      gradient: "from-purple-500 to-indigo-600",
      accentColor: "#8b5cf6"
    },
    {
      type: "Penerbitan Akta Kematian" as ServiceType,
      icon: "💀",
      gradient: "from-rose-500 to-pink-600",
      accentColor: "#f43f5e"
    },
    {
      type: "Penerbitan Akta Perkawinan" as ServiceType,
      icon: "💍",
      gradient: "from-amber-500 to-orange-600",
      accentColor: "#f59e0b"
    },
    {
      type: "Rekam KTP-EL" as ServiceType,
      icon: "🆔",
      gradient: "from-cyan-500 to-blue-500",
      accentColor: "#06b6d4"
    },
    {
      type: "Aktivasi IKD" as ServiceType,
      icon: "📱",
      gradient: "from-blue-700 via-indigo-800 to-slate-950",
      accentColor: "#1e3a8a"
    }
  ];

  // Helper calculation for custom SVG radial chart
  const pieSlices = useMemo(() => {
    let accumulatedAngle = 0;
    return serviceCards.map((card) => {
      const count = stats[card.type] || 0;
      const percentage = totalDocuments > 0 ? (count / totalDocuments) * 100 : 0;
      const angle = (count / (totalDocuments || 1)) * 360;
      
      const slice = {
        type: card.type,
        count,
        percentage,
        startAngle: accumulatedAngle,
        endAngle: accumulatedAngle + angle,
        color: card.accentColor
      };
      accumulatedAngle += angle;
      return slice;
    });
  }, [stats, totalDocuments]);

  // Generate SVG paths for dynamic doughnut slices
  const renderPaths = () => {
    if (totalDocuments === 0) {
      return (
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="20"
        />
      );
    }

    return pieSlices.map((slice, i) => {
      const { startAngle, endAngle, color } = slice;
      if (endAngle - startAngle >= 360) {
        return (
          <circle
            key={i}
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke={color}
            strokeWidth="22"
          />
        );
      }

      // Convert angles to radians
      const radStart = ((startAngle - 90) * Math.PI) / 180;
      const radEnd = ((endAngle - 90) * Math.PI) / 180;

      // Coordinate matching index/axes
      const x1 = 100 + 70 * Math.cos(radStart);
      const y1 = 100 + 70 * Math.sin(radStart);
      const x2 = 100 + 70 * Math.cos(radEnd);
      const y2 = 100 + 70 * Math.sin(radEnd);

      const largeArc = endAngle - startAngle > 180 ? 1 : 0;

      // Draw stroke path
      return (
        <path
          key={i}
          d={`M ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth="22"
          strokeLinecap="round"
          className="transition-all duration-500 hover:stroke-[26px] cursor-pointer"
          title={`${slice.type}: ${slice.count}`}
        />
      );
    });
  };

  return (
    <div id="sec-dashboard" className="animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">Ringkasan real-time pelayanan UPTD Makarti Jaya</p>
          <p className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md font-semibold inline-block mt-1">Periode Januari 2026 sampai hari ini</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold transition-all hover:scale-[1.01] hover:shadow flex items-center justify-center gap-2 border border-slate-200"
        >
          🔄 Segarkan Data
        </button>
      </div>

      {/* Hero Card block */}
      <div className="mb-6 sm:mb-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl p-6 sm:p-8 text-white relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-neutral-900/10 pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mix-blend-screen filter blur-[60px] opacity-40"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
          <div className="mb-4 md:mb-0">
            <p className="text-blue-200 font-semibold tracking-widest uppercase text-xs mb-2 flex items-center gap-2">
              📈 Total Keseluruhan Pelayanan
            </p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-5xl md:text-6xl font-black tracking-tighter transition-all duration-300">
                {totalDocuments}
              </h3>
              <span className="text-blue-200 font-medium text-sm sm:text-lg">Dokumen Terdaftar</span>
            </div>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-lg">
            <span className="text-3xl">📁</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Statistics details cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5" id="dashboardCards">
          {serviceCards.map((card, idx) => {
            const count = stats[card.type] || 0;
            return (
              <div
                key={idx}
                className="bg-white rounded-[1.2rem] sm:rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex items-center hover:scale-[1.02] hover:shadow-md transition-all duration-300 group cursor-default"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center mr-4 sm:mr-5 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0 text-xl sm:text-2xl`}>
                  {card.icon}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 truncate">
                    {SERVICE_LABELS[card.type] || card.type}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                    {count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Proporsional Doughnut Chart and Legend */}
        <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 flex flex-col h-full shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">
              📊
            </div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">Proporsi Pelayanan</h3>
          </div>
          
          <div className="flex-1 relative min-h-[220px] sm:min-h-[260px] flex items-center justify-center">
            {/* SVG custom animated doughnut */}
            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
              {renderPaths()}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total</span>
              <span className="text-3xl font-black text-slate-800 leading-none">{totalDocuments}</span>
            </div>
          </div>

          {/* Simple custom legends */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {serviceCards.map((card, i) => {
              const count = stats[card.type] || 0;
              const percentage = totalDocuments > 0 ? ((count / totalDocuments) * 100).toFixed(1) : "0";
              return (
                <div key={i} className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: card.accentColor }}
                  />
                  <span className="text-slate-600 truncate font-semibold">
                    {card.type.replace("Penerbitan ", "")}: <b className="text-slate-900">{percentage}%</b>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
