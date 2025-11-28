
import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { CropPreset, Pest, CropType, TaskType } from '../types';
import { Plus, Trash2, Sprout, Bug, X, Save } from 'lucide-react';

const AdminSettings = () => {
  const { cropPresets, pestPresets, addCropPreset, deleteCropPreset, addPestPreset, deletePestPreset } = useFarm();
  const [activeTab, setActiveTab] = useState<'crops' | 'pests'>('crops');
  
  // Modal State
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPestModal, setShowPestModal] = useState(false);

  // Form State for Crops
  const [newCrop, setNewCrop] = useState<Partial<CropPreset>>({
      name: '',
      type: CropType.LEAFY,
      growthDays: 30,
      waterNeeds: 'Trung bình',
      description: '',
      defaultTasks: []
  });

  // Form State for Pests
  const [newPest, setNewPest] = useState<Partial<Pest>>({
      name: '',
      type: 'insect',
      symptoms: '',
      affectedCrops: [],
      prevention: '',
      treatmentBio: '',
      treatmentChem: ''
  });

  const handleCropSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCrop.name) return;
      
      const presetToAdd: CropPreset = {
          id: Math.random().toString(36).substr(2, 9),
          name: newCrop.name!,
          type: newCrop.type as CropType,
          growthDays: Number(newCrop.growthDays),
          waterNeeds: newCrop.waterNeeds as any,
          description: newCrop.description || '',
          defaultTasks: newCrop.defaultTasks || [] 
          // Note: In a full app, we would have a UI to add default tasks. 
          // For simplicity here, we create an empty task list or minimal defaults.
      };
      
      addCropPreset(presetToAdd);
      setShowCropModal(false);
      setNewCrop({ name: '', type: CropType.LEAFY, growthDays: 30, waterNeeds: 'Trung bình', description: '', defaultTasks: [] });
  };

  const handlePestSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPest.name) return;

      const pestToAdd: Pest = {
          id: Math.random().toString(36).substr(2, 9),
          name: newPest.name!,
          type: newPest.type as 'insect' | 'disease',
          symptoms: newPest.symptoms || '',
          affectedCrops: [], // Simplified for now
          prevention: newPest.prevention || '',
          treatmentBio: newPest.treatmentBio || '',
          treatmentChem: newPest.treatmentChem || ''
      };

      addPestPreset(pestToAdd);
      setShowPestModal(false);
      setNewPest({ name: '', type: 'insect', symptoms: '', prevention: '', treatmentBio: '', treatmentChem: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Cài Đặt Hệ Thống</h1>
           <p className="text-slate-500 text-sm">Quản lý danh mục cây trồng và cơ sở dữ liệu sâu bệnh</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
          <button 
             onClick={() => setActiveTab('crops')}
             className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'crops' ? 'border-agri-600 text-agri-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             <Sprout size={18} /> Danh Mục Cây Trồng
          </button>
          <button 
             onClick={() => setActiveTab('pests')}
             className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pests' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             <Bug size={18} /> Cơ Sở Dữ Liệu Sâu Bệnh
          </button>
      </div>

      {/* Crops Content */}
      {activeTab === 'crops' && (
          <div className="space-y-4">
              <div className="flex justify-end">
                  <button onClick={() => setShowCropModal(true)} className="bg-agri-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
                      <Plus size={18} /> Thêm Cây Mới
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cropPresets.map(crop => (
                      <div key={crop.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h3 className="font-bold text-slate-800">{crop.name}</h3>
                                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{crop.type}</span>
                              </div>
                              <button onClick={() => deleteCropPreset(crop.id)} className="text-slate-300 hover:text-red-500 p-1">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{crop.description}</p>
                          <div className="pt-3 border-t border-slate-50 flex gap-4 text-xs font-medium text-slate-600">
                              <span>⏱ {crop.growthDays} ngày</span>
                              <span>💧 Nước: {crop.waterNeeds}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Pests Content */}
      {activeTab === 'pests' && (
          <div className="space-y-4">
              <div className="flex justify-end">
                  <button onClick={() => setShowPestModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
                      <Plus size={18} /> Thêm Sâu Bệnh
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pestPresets.map(pest => (
                      <div key={pest.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${pest.type === 'insect' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                                      <Bug size={16} />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-800">{pest.name}</h3>
                                      <p className="text-xs text-slate-500 capitalize">{pest.type === 'insect' ? 'Côn trùng' : 'Bệnh hại'}</p>
                                  </div>
                              </div>
                              <button onClick={() => deletePestPreset(pest.id)} className="text-slate-300 hover:text-red-500 p-1">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                          <div className="mt-2 space-y-2 text-sm">
                              <p><span className="font-semibold text-slate-700">Triệu chứng:</span> <span className="text-slate-600 line-clamp-2">{pest.symptoms}</span></p>
                              <p><span className="font-semibold text-green-700">Sinh học:</span> <span className="text-slate-600 line-clamp-2">{pest.treatmentBio}</span></p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Add Crop Modal */}
      {showCropModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Thêm Cây Trồng Mới</h3>
                      <button onClick={() => setShowCropModal(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleCropSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1">Tên cây</label>
                          <input className="w-full p-2 border rounded-lg" value={newCrop.name} onChange={e => setNewCrop({...newCrop, name: e.target.value})} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium mb-1">Nhóm</label>
                              <select className="w-full p-2 border rounded-lg" value={newCrop.type} onChange={e => setNewCrop({...newCrop, type: e.target.value as CropType})}>
                                  {Object.values(CropType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium mb-1">Số ngày lớn</label>
                              <input type="number" className="w-full p-2 border rounded-lg" value={newCrop.growthDays} onChange={e => setNewCrop({...newCrop, growthDays: Number(e.target.value)})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Nhu cầu nước</label>
                          <select className="w-full p-2 border rounded-lg" value={newCrop.waterNeeds} onChange={e => setNewCrop({...newCrop, waterNeeds: e.target.value as any})}>
                              <option value="Ít">Ít</option>
                              <option value="Trung bình">Trung bình</option>
                              <option value="Nhiều">Nhiều</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Mô tả đặc điểm</label>
                          <textarea className="w-full p-2 border rounded-lg" rows={2} value={newCrop.description} onChange={e => setNewCrop({...newCrop, description: e.target.value})}></textarea>
                      </div>
                      <button type="submit" className="w-full py-2 bg-agri-600 text-white font-bold rounded-lg mt-2">Lưu Cây Trồng</button>
                  </form>
              </div>
          </div>
      )}

      {/* Add Pest Modal */}
      {showPestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Thêm Dữ Liệu Sâu Bệnh</h3>
                      <button onClick={() => setShowPestModal(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <form onSubmit={handlePestSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1">Tên sâu/bệnh</label>
                          <input className="w-full p-2 border rounded-lg" value={newPest.name} onChange={e => setNewPest({...newPest, name: e.target.value})} required />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Loại</label>
                          <select className="w-full p-2 border rounded-lg" value={newPest.type} onChange={e => setNewPest({...newPest, type: e.target.value as any})}>
                              <option value="insect">Côn trùng (Sâu hại)</option>
                              <option value="disease">Bệnh hại (Nấm/Khuẩn)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Triệu chứng nhận biết</label>
                          <textarea className="w-full p-2 border rounded-lg" rows={2} value={newPest.symptoms} onChange={e => setNewPest({...newPest, symptoms: e.target.value})}></textarea>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Biện pháp sinh học</label>
                          <textarea className="w-full p-2 border rounded-lg" rows={2} value={newPest.treatmentBio} onChange={e => setNewPest({...newPest, treatmentBio: e.target.value})}></textarea>
                      </div>
                      <button type="submit" className="w-full py-2 bg-red-600 text-white font-bold rounded-lg mt-2">Lưu Dữ Liệu</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminSettings;