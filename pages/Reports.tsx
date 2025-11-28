
import React from 'react';
import { useFarm } from '../context/FarmContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const { cycles, getFormattedCurrency } = useFarm();
  const completedCycles = cycles.filter(c => c.status === 'completed');

  // Prepare data for Revenue by Crop
  const revenueData = completedCycles.map(c => ({
    name: c.cropName,
    revenue: c.harvests.reduce((acc, h) => acc + h.revenue, 0)
  }));

  // Prepare data for Yield by Crop
  const yieldData = completedCycles.map(c => ({
    name: c.cropName,
    quantity: c.harvests.reduce((acc, h) => acc + h.quantityKg, 0)
  }));
  
  // Prepare Cost vs Revenue
  const financialData = completedCycles.map(c => {
      const revenue = c.harvests.reduce((acc, h) => acc + h.revenue, 0);
      const cost = c.tasks.reduce((acc, t) => acc + (t.cost || 0), 0);
      return {
          name: c.cropName,
          revenue,
          cost,
          profit: revenue - cost
      }
  });

  const COLORS = ['#16a34a', '#d97706', '#2563eb', '#db2777'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Báo Cáo Hoạt Động</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Doanh thu theo cây trồng</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => getFormattedCurrency(value)} />
                        <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} name="Doanh thu" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Cost vs Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-lg mb-4 text-slate-800">Chi phí & Lợi nhuận</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => getFormattedCurrency(value)} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#16a34a" name="Doanh thu" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cost" fill="#ef4444" name="Chi phí" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg mb-4 text-slate-800">Tổng hợp sản lượng (Kg)</h3>
           <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={yieldData} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                       <XAxis type="number" />
                       <YAxis dataKey="name" type="category" width={100} />
                       <Tooltip />
                       <Bar dataKey="quantity" fill="#2563eb" radius={[0, 4, 4, 0]} name="Sản lượng (Kg)" />
                   </BarChart>
               </ResponsiveContainer>
           </div>
       </div>
    </div>
  );
};

export default Reports;