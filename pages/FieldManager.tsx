
import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, BoxSelect, Plus, X, Sprout, Trash2, AlertTriangle, User, TrendingUp, MousePointerClick } from 'lucide-react';
import { SOIL_COLORS } from '../constants';
import { SoilType, Field } from '../types';
import { MapContainer, TileLayer, useMapEvents, CircleMarker } from 'react-leaflet';
import * as L from 'leaflet';

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (pos: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <CircleMarker center={[position.lat, position.lng]} radius={8} pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.5 }} /> : null;
};

// --- Helper Component to Fix Map Rendering in Modals ---
const MapFix = () => {
  const map = useMapEvents({});
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

// Custom Pin Icon using DivIcon to ensure visibility without external images
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const FieldManager = () => {
  const { fields, cycles, addField, deleteField } = useFarm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: '',
  });

  // Form State
  const [newField, setNewField] = useState<Partial<Field>>({
    name: '',
    area: 50,
    soilType: SoilType.GRAY,
    location: '',
    assignedTo: ''
  });
  
  // Coordinates State
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  // Default center for Binh Duong
  const defaultCenter = { lat: 11.05, lng: 106.66 };

  const getActiveCropName = (fieldId: string) => {
    const activeCycle = cycles.find(c => c.fieldId === fieldId && c.status === 'active');
    return activeCycle ? activeCycle.cropName : 'Đang nghỉ';
  };

  const getActiveCropCycle = (fieldId: string) => {
    return cycles.find(c => c.fieldId === fieldId && c.status === 'active');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.name || !newField.area) return;

    const fieldToAdd: Field = {
      id: Math.random().toString(36).substr(2, 9),
      name: newField.name!,
      area: Number(newField.area),
      soilType: newField.soilType as SoilType,
      location: newField.location || 'Bình Dương',
      assignedTo: newField.assignedTo || 'Chưa phân công',
      coordinates: coords || undefined
    };

    addField(fieldToAdd);
    setIsModalOpen(false);
    // Reset form
    setNewField({
      name: '',
      area: 50,
      soilType: SoilType.GRAY,
      location: '',
      assignedTo: ''
    });
    setCoords(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
      // Stop propagation to prevent Link navigation
      e.preventDefault();
      e.stopPropagation();
      setDeleteConfirm({ isOpen: true, id, name });
  };

  const handleConfirmDelete = () => {
      if (deleteConfirm.id) {
          deleteField(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, id: null, name: '' });
      }
  };

  const handleQuickHarvest = (e: React.MouseEvent, fieldId: string) => {
      e.preventDefault();
      e.stopPropagation();
      // Navigate to harvest tab of detail page
      navigate(`/fields/${fieldId}?tab=harvest`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Quản Lý Luống Trồng</h1>
           <p className="text-slate-500 text-sm">Quản lý các luống rau và trạng thái canh tác</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-agri-600 hover:bg-agri-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm shadow-agri-200"
        >
          <Plus size={20} />
          Thêm Luống Mới
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
             <Sprout size={32} />
           </div>
           <h3 className="text-lg font-medium text-slate-900">Chưa có luống nào</h3>
           <p className="text-slate-500 mb-4">Bắt đầu bằng cách thêm luống rau mới.</p>
           <button onClick={() => setIsModalOpen(true)} className="text-agri-600 font-medium hover:underline">
             + Thêm ngay
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fields.map(field => {
             const activeCycle = getActiveCropCycle(field.id);
             const activeCrop = activeCycle ? activeCycle.cropName : 'Đang nghỉ';
             const isResting = !activeCycle;

             return (
            <div key={field.id} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative">
               
               {/* Content Area */}
               <Link to={`/fields/${field.id}`} className="block p-6">
                  {/* Header: Name and Status */}
                  <div className="flex justify-between items-start mb-4 pr-8">
                     <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-agri-600 transition-colors">
                            {field.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                            <MapPin size={14} /> 
                            <span className="truncate max-w-[150px]">{field.location}</span>
                        </div>
                     </div>
                     <span className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                        isResting 
                        ? 'bg-slate-100 text-slate-500' 
                        : 'bg-green-100 text-green-700'
                     }`}>
                        {isResting ? 'Nghỉ' : 'Trồng'}
                     </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 w-full mb-4"></div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Diện tích</p>
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <BoxSelect size={16} className="text-slate-400" />
                            {field.area.toLocaleString()} m²
                        </div>
                     </div>
                     <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Loại đất</p>
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${SOIL_COLORS[field.soilType]}`}></div>
                            {field.soilType}
                        </div>
                     </div>
                  </div>

                  {/* Assigned User */}
                   <div className="mb-4">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Phụ trách</p>
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <User size={14} />
                            </div>
                            <span className="text-sm">{field.assignedTo || 'Chưa phân công'}</span>
                        </div>
                   </div>
                  
                  {/* Current Crop (if active) and Actions */}
                  {!isResting && (
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-bold text-agri-700 flex items-center gap-1">
                              <Sprout size={16} /> {activeCrop}
                          </span>
                          
                          <button 
                             onClick={(e) => handleQuickHarvest(e, field.id)}
                             className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors border border-green-200"
                          >
                             <TrendingUp size={14} /> Thu hoạch
                          </button>
                      </div>
                  )}
               </Link>

               {/* DELETE BUTTON - Absolute Position, High Z-Index */}
               <button 
                    type="button"
                    onClick={(e) => handleDeleteClick(e, field.id, field.name)}
                    className="absolute top-4 right-4 z-20 p-2 bg-white shadow-sm border border-slate-100 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa luống này"
               >
                    <Trash2 size={18} />
               </button>
            </div>
          )})}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 transform scale-100 transition-transform">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Xóa Luống Trồng?</h3>
                    <p className="text-slate-500">
                        Bạn có chắc chắn muốn xóa <strong>{deleteConfirm.name}</strong> không? 
                        Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex gap-3 w-full mt-2">
                        <button 
                            onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleConfirmDelete}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-200"
                        >
                            Xóa ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Create Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-lg text-slate-800">Thêm Luống Mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên luống <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Luống Rau Muống A1"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-agri-500"
                  value={newField.name}
                  onChange={e => setNewField({...newField, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích (m²) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-agri-500"
                    value={newField.area}
                    onChange={e => setNewField({...newField, area: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại đất</label>
                  <select 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-agri-500 bg-white"
                    value={newField.soilType}
                    onChange={e => setNewField({...newField, soilType: e.target.value as SoilType})}
                  >
                    {Object.values(SoilType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ / Vị trí</label>
                <input 
                  type="text" 
                  placeholder="VD: Vườn sau, Khu A"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-agri-500"
                  value={newField.location}
                  onChange={e => setNewField({...newField, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Người phụ trách</label>
                <input 
                  type="text" 
                  placeholder="VD: Nông Dân Ba"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-agri-500"
                  value={newField.assignedTo}
                  onChange={e => setNewField({...newField, assignedTo: e.target.value})}
                />
              </div>

              {/* Map Picker */}
              <div className="space-y-2">
                 <label className="block text-sm font-medium text-slate-700">Chọn vị trí trên bản đồ</label>
                 <div className="h-48 rounded-lg overflow-hidden border border-slate-300 relative">
                     <MapContainer 
                        key={isModalOpen ? "map-open" : "map-closed"} 
                        center={defaultCenter} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                     >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <MapFix />
                        <LocationMarker position={coords} setPosition={setCoords} />
                     </MapContainer>
                     
                     {!coords && (
                        <div className="absolute inset-0 bg-black/10 z-[400] pointer-events-none flex items-center justify-center">
                            <div className="bg-white/90 px-3 py-1 rounded shadow-sm text-xs font-medium text-slate-600 flex items-center gap-1">
                                <MousePointerClick size={14} /> Click bản đồ để ghim
                            </div>
                        </div>
                     )}
                 </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white bg-agri-600 hover:bg-agri-700 rounded-lg font-medium shadow-sm"
                >
                  Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldManager;