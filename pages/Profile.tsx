
import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { User, Mail, Phone, Calendar, Save, Camera } from 'lucide-react';

const Profile = () => {
  const { userProfile, updateUserProfile, fields, cycles } = useFarm();
  const [formData, setFormData] = useState(userProfile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const activeCycles = cycles.filter(c => c.status === 'active').length;
  const completedCycles = cycles.filter(c => c.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Hồ Sơ Người Dùng</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-agri-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-md overflow-hidden">
                 {formData.avatarUrl ? (
                     <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <span>{formData.name.charAt(0)}</span>
                 )}
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={24} />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800">{formData.name}</h2>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full mt-2 font-medium">
              {formData.role}
            </span>
            
            <div className="mt-6 w-full space-y-3 text-left">
               <div className="flex items-center gap-3 text-slate-600 text-sm">
                 <Mail size={16} />
                 <span>{formData.email || 'Chưa cập nhật email'}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-600 text-sm">
                 <Phone size={16} />
                 <span>{formData.phone || 'Chưa cập nhật SĐT'}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-600 text-sm">
                 <Calendar size={16} />
                 <span>Tham gia: {new Date(formData.joinDate).toLocaleDateString('vi-VN')}</span>
               </div>
            </div>
          </div>
          
          {/* Stats Mini Card */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <h3 className="font-bold text-slate-800 mb-3">Thống kê nhanh</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-agri-600">{fields.length}</p>
                      <p className="text-xs text-slate-500">Luống vườn</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{completedCycles}</p>
                      <p className="text-xs text-slate-500">Vụ đã thu hoạch</p>
                  </div>
              </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800">Thông Tin Cá Nhân</h3>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing ? 'bg-slate-100 text-slate-600' : 'bg-agri-600 text-white shadow-sm'}`}
                  >
                    {isEditing ? 'Hủy bỏ' : 'Chỉnh sửa'}
                  </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                          <input 
                            type="text" 
                            disabled={!isEditing}
                            className="w-full p-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                          <select 
                            disabled={!isEditing}
                            className="w-full p-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                          >
                              <option value="Chủ trang trại">Chủ trang trại</option>
                              <option value="Kỹ sư">Kỹ sư</option>
                              <option value="Nhân công">Nhân công</option>
                          </select>
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        disabled={!isEditing}
                        className="w-full p-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@cphaco.com"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                      <input 
                        type="tel" 
                        disabled={!isEditing}
                        className="w-full p-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="0912345678"
                      />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh đại diện (URL)</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        className="w-full p-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
                        value={formData.avatarUrl || ''}
                        onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                        placeholder="https://..."
                      />
                  </div>

                  {isEditing && (
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                          <button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                          >
                              <Save size={18} /> Lưu Thay Đổi
                          </button>
                      </div>
                  )}
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;