import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { BarChart3, TrendingUp, Layers, Flame, PieChart } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    collectionSales: [
      { name: 'One Piece Collection', sales: 4200, orders: 120 },
      { name: 'Demon Slayer Collection', sales: 3800, orders: 105 },
      { name: 'Attack on Titan Collection', sales: 2900, orders: 88 },
      { name: 'Naruto Collection', sales: 2400, orders: 74 },
      { name: 'My Hero Academia Collection', sales: 1550, orders: 45 }
    ],
    categorySales: [
      { category: 'Oversized T-Shirt', count: 185 },
      { category: 'Regular T-Shirt', count: 142 },
      { category: 'Sweatshirt', count: 68 },
      { category: 'Sleeveless', count: 37 }
    ]
  });

  useEffect(() => {
    adminService.getAnalytics().then(res => {
      if (res.success) {
        setAnalytics({
          collectionSales: res.collectionSales || analytics.collectionSales,
          categorySales: res.categorySales || analytics.categorySales
        });
      }
    }).catch(() => {});
  }, []);

  const totalCollectionSales = analytics.collectionSales.reduce((acc, c) => acc + c.sales, 0);

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <BarChart3 className="w-4 h-4 text-[#FF7A00]" />
            <span>ENEN REVENUE & ANIME SALES METRICS</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            SALES <span className="text-flame-gradient">ANALYTICS</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ANIME COLLECTION SALES DISTRIBUTION */}
        <div className="lg:col-span-7 bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#282834] pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#E85D3D]" /> Revenue by Anime Collection
            </h3>
            <span className="text-xs font-extrabold text-[#FF7A00]">${totalCollectionSales.toLocaleString()} Total</span>
          </div>

          <div className="space-y-4">
            {analytics.collectionSales.map((item, idx) => {
              const pct = Math.round((item.sales / totalCollectionSales) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{item.name}</span>
                    <span className="text-[#E85D3D]">${item.sales.toLocaleString()} ({item.orders} orders)</span>
                  </div>
                  <div className="w-full h-3 bg-[#121218] rounded-full overflow-hidden border border-[#282834]">
                    <div
                      className="h-full bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: APPAREL CATEGORY BREAKDOWN */}
        <div className="lg:col-span-5 bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#282834] pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#FF7A00]" /> Apparel Category Demand
            </h3>
          </div>

          <div className="space-y-4">
            {analytics.categorySales.map((cat, idx) => (
              <div key={idx} className="p-4 bg-[#121218] border border-[#282834] rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-sm">{cat.category}</h4>
                  <p className="text-xs text-gray-400">Total Units Sold</p>
                </div>
                <span className="text-xl font-black text-flame-gradient">{cat.count} Units</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
