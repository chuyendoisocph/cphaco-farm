
import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import WeatherWidget from '../components/WeatherWidget';
import { ArrowRight, Leaf, DollarSign, Calendar, Circle, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { fields, cycles, getFormattedCurrency, updateTaskStatus } = useFarm();
  const [showRevenueModal, setShowRevenueModal] = useState(false);

  const activeCycles = cycles.filter(c => c.status === 'active');
  const completedCycles = cycles.filter(c => c.status === 'completed');
  
  // Simple calculations
  const totalArea = fields.reduce((acc, f) => acc + f.area, 0);
  const totalHarvestRevenue = completedCycles.reduce((acc, c) => acc + c.harvests.reduce((hAcc, h) => hAcc + h.revenue, 0), 0);
  
  // Get all harvests flat list
  const allHarvests = completedCycles.flatMap(c => 
    c.harvests.map(h => ({
        ...h,
        cropName: c.cropName,
        fieldId: c.fieldId,
        fieldName: fields.find(f => f.id === c.fieldId)?.name || 'Unknown Field'
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pending tasks across all active cycles
  const pendingTasks = activeCycles.flatMap(c => 
    c.tasks.filter(t => t.status === 'pending').map(t => ({...t, cycleName: c.cropName, fieldName: fields.find(f => f.id === c.fieldId)?.name }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Tổng Quan Vườn</h1>
      
      {/* Top Section: Weather & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 mb-1">Diện Tích Canh Tác</p>
                <p className="text-2xl font-bold text-slate-800">{(totalArea).toLocaleString()} m²</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Leaf size={20} />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{fields.length} luống trồng</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 mb-1">Đang Canh Tác</p>
                <p className="text-2xl font-bold text-slate-800">{activeCycles.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calendar size={20} />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Vụ mùa đang hoạt động</p>
          </div>

          <button 
            onClick={() => setShowRevenueModal(true)}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-yellow-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex justify-between items-start w-full">
              <div>
                <p className="text-sm text-slate-500 mb-1">Doanh Thu (Năm nay)</p>
                <p className="text-2xl font-bold text-slate-800">{getFormattedCurrency(totalHarvestRevenue)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <DollarSign size={20} />
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-2 font-medium flex items-center gap-1">
               {completedCycles.length} vụ đã thu hoạch <ArrowRight size={12}/>
            </p>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Crops List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Cây Trồng Hiện Tại</h3>
            <Link to="/fields" className="text-sm text-agri-600 hover:text-agri-700 flex items-center gap-1 font-medium">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {activeCycles.length > 0 ? activeCycles.map(cycle => {
              const field = fields.find(f => f.id === cycle.fieldId);
              return (
                <div key={cycle.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-agri-100 flex items-center justify-center text-agri-600">
                        <Leaf size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{cycle.cropName}</h4>
                        <p className="text-sm text-slate-500">{field?.name} • Thu hoạch dự kiến: {new Date(cycle.estimatedHarvestDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-200">
                      Đang phát triển
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-slate-400">Chưa có vụ mùa nào đang hoạt động.</div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Công Việc Cần Làm</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
              {pendingTasks.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingTasks.length > 0 ? pendingTasks.map(task => (
              <div key={task.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 group">
                <button
                    onClick={() => updateTaskStatus(task.cycleId, task.id, 'completed')}
                    className="mt-1 text-slate-300 hover:text-green-600 transition-colors"
                    title="Đánh dấu đã hoàn thành"
                >
                    <Circle size={20} />
                </button>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{task.type}: {task.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <span className="bg-slate-100 px-1.5 rounded">{task.fieldName}</span>
                    <span>•</span>
                    <span>{new Date(task.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <Link to={`/fields/${fields.find(f => f.name === task.fieldName)?.id || ''}`} className="px-3 py-1.5 text-xs font-medium text-agri-700 bg-agri-50 rounded-lg hover:bg-agri-100">
                  Chi tiết
                </Link>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">Không có công việc tồn đọng.</div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Details Modal */}
      {showRevenueModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="font-bold text-lg text-slate-800">Chi Tiết Doanh Thu</h3>
                          <p className="text-xs text-slate-500">Danh sách các khoản thu hoạch đã ghi nhận</p>
                      </div>
                      <button onClick={() => setShowRevenueModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-0">
                      {allHarvests.length > 0 ? (
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                                  <tr>
                                      <th className="p-4">Ngày</th>
                                      <th className="p-4">Luống / Cây trồng</th>
                                      <th className="p-4 text-right">Sản lượng</th>
                                      <th className="p-4 text-right">Thành tiền</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {allHarvests.map((h, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                          <td className="p-4">{new Date(h.date).toLocaleDateString('vi-VN')}</td>
                                          <td className="p-4">
                                              <div className="font-medium text-slate-800">{h.cropName}</div>
                                              <div className="text-xs text-slate-500">{h.fieldName}</div>
                                          </td>
                                          <td className="p-4 text-right font-medium">{h.quantityKg} kg</td>
                                          <td className="p-4 text-right font-bold text-green-600">{getFormattedCurrency(h.revenue)}</td>
                                      </tr>
                                  ))}
                              </tbody>
                              <tfoot className="bg-slate-50 font-bold text-slate-800 sticky bottom-0">
                                  <tr>
                                      <td className="p-4" colSpan={3}>Tổng cộng</td>
                                      <td className="p-4 text-right text-green-700">{getFormattedCurrency(totalHarvestRevenue)}</td>
                                  </tr>
                              </tfoot>
                          </table>
                      ) : (
                          <div className="p-12 text-center text-slate-400">
                              Chưa có dữ liệu doanh thu nào.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;