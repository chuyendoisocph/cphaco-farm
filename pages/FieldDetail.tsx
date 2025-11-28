
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { TaskType, Task, CropCycle, CropType, SoilType, Field, PestReport } from '../types';
import { PEST_CATALOG } from '../constants';
import { CheckCircle2, Circle, Clock, Plus, Shovel, Sprout, TrendingUp, Edit, Trash2, X, BrainCircuit, Loader2, Archive, CalendarDays, Droplets, ArrowRight, AlertTriangle, MapPin, MousePointerClick, Bug, Camera, AlertOctagon, User, History } from 'lucide-react';
import { getGeminiAdvice } from '../services/geminiService';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, CircleMarker } from 'react-leaflet';
import * as L from 'leaflet';
import ReactMarkdown from 'react-markdown';

// Helper component to handle map clicks in Edit Modal
const LocationMarker = ({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (pos: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <CircleMarker center={[position.lat, position.lng]} radius={8} pathOptions={{ color: '#0066FF', fillColor: '#0066FF', fillOpacity: 0.5 }} /> : null;
};

// --- Helper Component to Fix Map Rendering in Modals ---
const MapFix = () => {
  const map = useMapEvents({});
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const FieldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fields, cycles, pestReports, cropPresets, pestPresets, addTask, updateTask, deleteTask, updateTaskStatus, addCycle, addHarvest, updateField, deleteField, endCycle, updateCycle, addPestReport, updatePestReport, getFormattedCurrency } = useFarm();
  
  // Set active tab based on query param or default to overview
  const initialTab = searchParams.get('tab') as 'overview' | 'tasks' | 'harvest' | 'pests' | 'history' || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'harvest' | 'pests' | 'history'>(initialTab);
  
  // Modal states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState<'add' | 'edit'>('add');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [showEditFieldModal, setShowEditFieldModal] = useState(false);
  const [showEditCycleModal, setShowEditCycleModal] = useState(false);
  const [showStartCycleModal, setShowStartCycleModal] = useState(false);
  const [showPestModal, setShowPestModal] = useState(false);
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      type: 'delete_field' | 'end_cycle' | 'delete_task' | 'harvest_end';
      title: string;
      message: string;
      onConfirm: () => void;
  }>({
      isOpen: false,
      type: 'delete_field',
      title: '',
      message: '',
      onConfirm: () => {},
  });

  // AI Advice State
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const field = fields.find(f => f.id === id);
  const currentCycle = cycles.find(c => c.fieldId === id && c.status === 'active');
  const historyCycles = cycles.filter(c => c.fieldId === id && c.status === 'completed').sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const fieldPestReports = pestReports.filter(p => currentCycle && p.cycleId === currentCycle.id);
  
  // Field Edit State
  const [editFieldData, setEditFieldData] = useState<Partial<Field>>({});
  
  // Cycle Edit State
  const [editCycleData, setEditCycleData] = useState<Partial<CropCycle>>({});

  // Start Cycle Form State
  const [newCycleData, setNewCycleData] = useState<{
      presetId: string;
      cropName: string;
      cropType: CropType;
      startDate: string;
      growthDays: number;
  }>({
      presetId: '',
      cropName: '',
      cropType: CropType.LEAFY,
      startDate: new Date().toISOString().split('T')[0],
      growthDays: 30
  });

  // Task Form State (for both add and edit)
  const [taskFormData, setTaskFormData] = useState<Partial<Task>>({
      type: TaskType.OTHER,
      date: new Date().toISOString().split('T')[0],
      description: ''
  });

  // Pest Form State
  const [pestFormData, setPestFormData] = useState<{
      severity: 'low' | 'medium' | 'high';
      notes: string;
      suspectedId: string;
  }>({
      severity: 'low',
      notes: '',
      suspectedId: ''
  });

  // Default center for Map Picker (Binh Duong)
  const defaultCenter = { lat: 11.05, lng: 106.66 };

  if (!field) return <div>Không tìm thấy luống trồng (hoặc đã bị xóa)</div>;

  const handleEditFieldClick = () => {
    setEditFieldData({
      name: field.name,
      area: field.area,
      soilType: field.soilType,
      location: field.location,
      assignedTo: field.assignedTo,
      coordinates: field.coordinates
    });
    setShowEditFieldModal(true);
  };

  const handleEditCycleClick = () => {
    if (!currentCycle) return;
    setEditCycleData({
      cropName: currentCycle.cropName,
      startDate: currentCycle.startDate,
      estimatedHarvestDate: currentCycle.estimatedHarvestDate,
    });
    setShowEditCycleModal(true);
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    updateField(field.id, editFieldData);
    setShowEditFieldModal(false);
  };

  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCycle) {
      updateCycle(currentCycle.id, editCycleData);
      setShowEditCycleModal(false);
    }
  };

  // Safe Delete with Navigation First
  const handleDeleteField = () => {
      setConfirmModal({
          isOpen: true,
          type: 'delete_field',
          title: 'Xóa Luống Trồng?',
          message: 'Bạn có chắc chắn muốn xóa luống này? Mọi dữ liệu liên quan sẽ bị ẩn.',
          onConfirm: () => {
             navigate('/fields');
             // Small delay to ensure navigation happens before state update to prevent UI crash
             setTimeout(() => deleteField(field.id), 10);
          }
      });
  };

  const handleEndCycle = () => {
    setConfirmModal({
        isOpen: true,
        type: 'end_cycle',
        title: 'Kết Thúc Vụ Mùa?',
        message: 'Luống sẽ chuyển sang trạng thái nghỉ. Bạn có thể xem lại trong báo cáo.',
        onConfirm: () => {
            if (currentCycle) endCycle(currentCycle.id);
        }
    });
  };

  const openTaskModal = (mode: 'add' | 'edit', task?: Task) => {
      setTaskFormMode(mode);
      if (mode === 'edit' && task) {
          setSelectedTask(task);
          setTaskFormData({
              type: task.type,
              date: task.date,
              description: task.description
          });
      } else {
          setSelectedTask(null);
          setTaskFormData({
              type: TaskType.OTHER,
              date: new Date().toISOString().split('T')[0],
              description: ''
          });
      }
      setShowTaskForm(true);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle) return;
    
    if (taskFormMode === 'add') {
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            cycleId: currentCycle.id,
            type: taskFormData.type as TaskType,
            date: taskFormData.date as string,
            description: taskFormData.description as string,
            status: 'pending'
        };
        addTask(newTask);
    } else if (taskFormMode === 'edit' && selectedTask) {
        updateTask(currentCycle.id, selectedTask.id, {
            type: taskFormData.type as TaskType,
            date: taskFormData.date as string,
            description: taskFormData.description as string
        });
    }
    setShowTaskForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
      setConfirmModal({
        isOpen: true,
        type: 'delete_task',
        title: 'Xóa công việc?',
        message: 'Bạn có chắc muốn xóa công việc này không?',
        onConfirm: () => {
             if (currentCycle) deleteTask(currentCycle.id, taskId);
        }
      });
  };

  const handleHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle) return;
    const form = e.target as HTMLFormElement;
    
    // Check if this is the final harvest
    const isFinal = (form.elements.namedItem('isFinal') as HTMLInputElement).checked;
    
    const qty = Number((form.elements.namedItem('qty') as HTMLInputElement).value);
    const rev = Number((form.elements.namedItem('rev') as HTMLInputElement).value);

    addHarvest({
        id: Math.random().toString(36).substr(2, 9),
        cycleId: currentCycle.id,
        date: new Date().toISOString().split('T')[0],
        quantityKg: qty,
        quality: 'A',
        revenue: rev,
    });

    setShowHarvestForm(false);

    if (isFinal) {
        setConfirmModal({
            isOpen: true,
            type: 'harvest_end',
            title: 'Kết Thúc Mùa Vụ',
            message: 'Bạn đã đánh dấu đây là đợt thu hoạch cuối. Bạn có muốn đóng vụ mùa này ngay bây giờ không?',
            onConfirm: () => endCycle(currentCycle.id)
        });
    }
  };

  const handleStartCycle = (e: React.FormEvent) => {
      e.preventDefault();
      
      const startDate = new Date(newCycleData.startDate);
      const estDate = new Date(startDate);
      estDate.setDate(startDate.getDate() + newCycleData.growthDays);

      addCycle({
          id: Math.random().toString(36).substr(2, 9),
          fieldId: field.id,
          cropName: newCycleData.cropName,
          cropType: newCycleData.cropType,
          startDate: newCycleData.startDate,
          estimatedHarvestDate: estDate.toISOString().split('T')[0],
          status: 'active',
          tasks: [],
          harvests: []
      }, newCycleData.presetId === 'custom' ? undefined : newCycleData.presetId); 

      setShowStartCycleModal(false);
  };

  const handlePresetChange = (presetId: string) => {
      if (presetId === 'custom') {
          setNewCycleData(prev => ({
              ...prev,
              presetId: 'custom',
              cropName: '',
              growthDays: 30
              // Keep previous cropType or default
          }));
          return;
      }

      const preset = cropPresets.find(p => p.id === presetId);
      if (preset) {
          setNewCycleData(prev => ({
              ...prev,
              presetId: preset.id,
              cropName: preset.name,
              cropType: preset.type,
              growthDays: preset.growthDays
          }));
      } else {
           setNewCycleData(prev => ({ ...prev, presetId: '' }));
      }
  };

  const askForRotationAdvice = async () => {
    setLoadingAdvice(true);
    setAiAdvice(null);
    try {
        const prompt = currentCycle 
            ? `Tôi đang trồng ${currentCycle.cropName} trên đất ${field.soilType}. Sau khi thu hoạch xong vụ này, tôi nên trồng luân canh loại rau/cây gì tiếp theo để cải tạo đất và hạn chế sâu bệnh?`
            : `Đất của tôi là ${field.soilType}, tôi nên trồng loại rau gì phù hợp nhất hiện nay?`;
        
        const advice = await getGeminiAdvice(prompt, { field, cycle: currentCycle });
        setAiAdvice(advice);
    } catch (error) {
        setAiAdvice("Không thể lấy tư vấn lúc này.");
    } finally {
        setLoadingAdvice(false);
    }
  };
  
  const handlePestSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentCycle) return;

      const newReport: PestReport = {
          id: Math.random().toString(36).substr(2, 9),
          cycleId: currentCycle.id,
          date: new Date().toISOString().split('T')[0],
          severity: pestFormData.severity,
          observerNotes: pestFormData.notes,
          suspectedPestId: pestFormData.suspectedId || undefined,
          status: 'open'
      };

      addPestReport(newReport);
      setShowPestModal(false);
      setPestFormData({ severity: 'low', notes: '', suspectedId: '' });

      // Trigger AI Analysis
      const loadingToastId = 'analyzing...'; // Placeholder for toast
      try {
          const advice = await getGeminiAdvice("Phân tích báo cáo sâu bệnh này và đưa ra giải pháp.", {
              field, cycle: currentCycle, pestReport: newReport
          });
          updatePestReport(newReport.id, { aiDiagnosis: advice });
      } catch (err) {
          console.error("AI Error:", err);
      }
  };

  const selectedPresetInfo = cropPresets.find(p => p.id === newCycleData.presetId);
  const estimatedHarvestPreview = new Date(new Date(newCycleData.startDate).getTime() + (newCycleData.growthDays * 86400000)).toLocaleDateString('vi-VN');


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
            {/* Header Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-green-50 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                            {field.name}
                            </h1>
                            <div className="flex flex-col gap-1 text-slate-500">
                                <p>{field.location} • {field.area.toLocaleString()} m² • {field.soilType}</p>
                                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                    <User size={14}/> Phụ trách: {field.assignedTo || 'Chưa phân công'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {currentCycle && (
                                <>
                                <button onClick={handleEditCycleClick} className="p-2 text-agri-600 bg-white border border-agri-100 hover:bg-agri-50 rounded-lg transition-colors flex items-center gap-2" title="Chỉnh sửa ngày vụ mùa">
                                    <CalendarDays size={20} /> <span className="text-sm font-medium hidden sm:inline">Sửa vụ</span>
                                </button>
                                <button onClick={handleEndCycle} className="p-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2" title="Kết thúc vụ mùa">
                                    <Archive size={20} /> <span className="text-sm font-medium hidden sm:inline">Kết thúc vụ</span>
                                </button>
                                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                                </>
                            )}
                            
                            <button onClick={handleEditFieldClick} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa thông tin">
                                <Edit size={20} />
                            </button>
                            <button 
                                type="button"
                                onClick={handleDeleteField} 
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Xóa luống này"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-400 uppercase">Đang trồng</p>
                            <p className="font-bold text-green-700 text-lg flex items-center gap-2">
                                {currentCycle ? (
                                    <><Sprout size={20}/> {currentCycle.cropName}</>
                                ) : (
                                    <><Shovel size={20}/> Đang nghỉ đất</>
                                )}
                            </p>
                        </div>
                        {currentCycle && (
                            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-400 uppercase">Ngày xuống giống</p>
                                <p className="font-semibold text-slate-700">{new Date(currentCycle.startDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                        )}
                        {currentCycle && (
                            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-400 uppercase">Dự kiến thu hoạch</p>
                                <p className="font-semibold text-slate-700">{new Date(currentCycle.estimatedHarvestDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
                <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'overview' ? 'border-agri-600 text-agri-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                Nhật Ký & Công Việc
                </button>
                <button 
                onClick={() => setActiveTab('pests')}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'pests' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                Sâu Bệnh & Dịch Hại
                </button>
                <button 
                onClick={() => setActiveTab('harvest')}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'harvest' ? 'border-agri-600 text-agri-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                Thu Hoạch & Sản Lượng
                </button>
                <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                <History size={16}/> Lịch Sử Canh Tác
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800">Danh sách công việc</h3>
                        <div className="flex gap-2">
                        {/* Suggest Rotation AI Button */}
                        <button 
                            onClick={askForRotationAdvice}
                            disabled={loadingAdvice}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            {loadingAdvice ? <Loader2 size={16} className="animate-spin"/> : <BrainCircuit size={16} />}
                            Gợi ý luân canh
                        </button>
                        <button 
                            disabled={!currentCycle}
                            onClick={() => openTaskModal('add')}
                            className="bg-agri-600 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-agri-700">
                                <Plus size={16} /> Ghi việc mới
                            </button>
                        </div>
                    </div>

                    {aiAdvice && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-900 text-sm animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold flex items-center gap-2"><BrainCircuit size={16}/> Lời khuyên từ Kỹ sư AI:</h4>
                                <button onClick={() => setAiAdvice(null)} className="text-purple-400 hover:text-purple-700"><X size={16}/></button>
                            </div>
                            <div className="prose prose-sm prose-purple max-w-none">
                                <ReactMarkdown>{aiAdvice}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {currentCycle ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
                            {currentCycle.tasks.length > 0 ? currentCycle.tasks.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(task => (
                                <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 group">
                                    <button 
                                        onClick={() => updateTaskStatus(currentCycle.id, task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                        className={`flex-shrink-0 transition-colors ${task.status === 'completed' ? 'text-green-500' : 'text-slate-300 hover:text-green-500'}`}
                                        title={task.status === 'completed' ? "Đánh dấu chưa xong" : "Đánh dấu đã xong"}
                                    >
                                        {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                    </button>
                                    <div className="flex-1">
                                        <p className={`font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                            {task.type}: {task.description}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(task.date).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {task.status === 'completed' ? 'Xong' : 'Chờ'}
                                        </span>
                                        
                                        {/* Edit/Delete Actions - Visible on hover or always on mobile */}
                                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openTaskModal('edit', task)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-400">Chưa có nhật ký công việc cho vụ này.</div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-agri-500 shadow-sm">
                                <Sprout size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Luống đang nghỉ</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Đất đã sẵn sàng. Hãy bắt đầu vụ mùa mới để nhận kế hoạch chăm sóc tự động.</p>
                            <button 
                                onClick={() => {
                                    setNewCycleData({
                                        presetId: '',
                                        cropName: '',
                                        cropType: CropType.LEAFY,
                                        startDate: new Date().toISOString().split('T')[0],
                                        growthDays: 30
                                    });
                                    setShowStartCycleModal(true);
                                }} 
                                className="bg-agri-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-agri-700 shadow-sm shadow-agri-200 inline-flex items-center gap-2"
                            >
                                <Plus size={20}/> Bắt đầu vụ mùa mới
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'pests' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Quản lý Sâu bệnh</h3>
                            <p className="text-sm text-slate-500">Phát hiện sớm để xử lý kịp thời</p>
                        </div>
                        <button 
                            disabled={!currentCycle}
                            onClick={() => setShowPestModal(true)}
                            className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <AlertOctagon size={18} /> Báo sâu bệnh
                        </button>
                    </div>

                    {!currentCycle && (
                        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">
                            Cần bắt đầu vụ mùa để ghi nhận sâu bệnh.
                        </div>
                    )}

                    {currentCycle && (
                        <div className="space-y-4">
                            {fieldPestReports.length > 0 ? fieldPestReports.map(report => (
                                <div key={report.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-red-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                                <Bug size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    {report.suspectedPestId 
                                                        ? pestPresets.find(p => p.id === report.suspectedPestId)?.name || PEST_CATALOG.find(p => p.id === report.suspectedPestId)?.name || "Chưa xác định"
                                                        : "Chưa xác định"}
                                                </h4>
                                                <p className="text-xs text-slate-500">{new Date(report.date).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            report.severity === 'high' ? 'bg-red-100 text-red-700' :
                                            report.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            Mức độ: {report.severity === 'high' ? 'Nặng' : report.severity === 'medium' ? 'Vừa' : 'Nhẹ'}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-slate-700 text-sm mb-3">
                                            <strong>Triệu chứng:</strong> {report.observerNotes}
                                        </p>
                                        
                                        {report.aiDiagnosis ? (
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                                <h5 className="font-bold text-green-800 flex items-center gap-2 mb-1">
                                                    <BrainCircuit size={14} /> Phác đồ điều trị (AI):
                                                </h5>
                                                <div className="prose prose-sm prose-green max-w-none">
                                                    <ReactMarkdown>{report.aiDiagnosis}</ReactMarkdown>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                                                <Loader2 size={14} className="animate-spin" /> Đang chờ AI phân tích...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                        <Bug size={24}/>
                                    </div>
                                    <p className="text-slate-500">Chưa có ghi nhận sâu bệnh nào. Cây trồng đang khỏe mạnh!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'harvest' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800">Lịch sử thu hoạch (Vụ hiện tại)</h3>
                        <button 
                        disabled={!currentCycle}
                        onClick={() => setShowHarvestForm(true)}
                        className="bg-green-600 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-green-700">
                            <TrendingUp size={16} /> Ghi sản lượng
                        </button>
                    </div>
                    {currentCycle && currentCycle.harvests.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="p-4">Ngày</th>
                                        <th className="p-4">Sản lượng (Kg)</th>
                                        <th className="p-4">Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentCycle.harvests.map(h => (
                                        <tr key={h.id}>
                                            <td className="p-4">{new Date(h.date).toLocaleDateString('vi-VN')}</td>
                                            <td className="p-4 font-semibold">{h.quantityKg} kg</td>
                                            <td className="p-4 text-green-600 font-bold">{getFormattedCurrency(h.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-400">Chưa có dữ liệu thu hoạch.</div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800">Lịch sử các vụ mùa đã qua</h3>
                    {historyCycles.length > 0 ? (
                        <div className="space-y-4">
                            {historyCycles.map(cycle => {
                                const totalYield = cycle.harvests.reduce((sum, h) => sum + h.quantityKg, 0);
                                const totalRevenue = cycle.harvests.reduce((sum, h) => sum + h.revenue, 0);
                                return (
                                    <div key={cycle.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800">{cycle.cropName}</h4>
                                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{cycle.cropType}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                <CalendarDays size={14} className="inline mr-1"/>
                                                {new Date(cycle.startDate).toLocaleDateString('vi-VN')} - {new Date(cycle.estimatedHarvestDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{getFormattedCurrency(totalRevenue)}</p>
                                            <p className="text-xs text-slate-500">{totalYield} kg</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <History size={32} className="mx-auto text-slate-300 mb-2"/>
                            <p className="text-slate-500">Chưa có lịch sử canh tác nào trên luống này.</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Map Column (Right) */}
        <div className="lg:col-span-1">
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-[300px] sticky top-6">
                {field.coordinates ? (
                     <MapContainer 
                        key={field.id}
                        center={[field.coordinates.lat, field.coordinates.lng]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%' }}
                     >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <MapFix />
                        <CircleMarker center={[field.coordinates.lat, field.coordinates.lng]} radius={8} pathOptions={{ color: '#0066FF', fillColor: '#0066FF', fillOpacity: 0.5 }}>
                            <Popup>{field.name}</Popup>
                        </CircleMarker>
                     </MapContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-6 text-center">
                        <MapPin size={40} className="mb-2 opacity-50"/>
                        <p className="text-sm">Chưa có tọa độ bản đồ.</p>
                        <button onClick={handleEditFieldClick} className="text-agri-600 text-xs font-medium mt-2 hover:underline">
                            Cập nhật vị trí
                        </button>
                    </div>
                )}
             </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 transform scale-100 transition-transform">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.type.includes('delete') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
                    <p className="text-slate-500">
                        {confirmModal.message}
                    </p>
                    <div className="flex gap-3 w-full mt-2">
                        <button 
                            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={() => {
                                confirmModal.onConfirm();
                                setConfirmModal({ ...confirmModal, isOpen: false });
                            }}
                            className={`flex-1 py-2.5 text-white font-bold rounded-lg transition-colors shadow-lg ${
                                confirmModal.type.includes('delete') 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                                    : 'bg-agri-600 hover:bg-agri-700 shadow-agri-200'
                            }`}
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Pest Report Modal */}
      {showPestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-red-50 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-red-700 flex items-center gap-2">
                          <AlertOctagon size={20}/> Báo Cáo Sâu Bệnh
                      </h3>
                      <button onClick={() => setShowPestModal(false)}><X size={20} className="text-red-400"/></button>
                  </div>
                  <form onSubmit={handlePestSubmit} className="p-5 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                          <div className="flex gap-2">
                              {['low', 'medium', 'high'].map((level) => (
                                  <button
                                      key={level}
                                      type="button"
                                      onClick={() => setPestFormData({ ...pestFormData, severity: level as any })}
                                      className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                                          pestFormData.severity === level 
                                          ? (level === 'high' ? 'bg-red-100 border-red-500 text-red-700' : level === 'medium' ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-yellow-100 border-yellow-500 text-yellow-700')
                                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      {level === 'high' ? 'Nặng' : level === 'medium' ? 'Vừa' : 'Nhẹ'}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nghi ngờ loại (nếu biết)</label>
                          <select 
                              className="w-full p-2.5 border border-slate-300 rounded-lg"
                              value={pestFormData.suspectedId}
                              onChange={(e) => setPestFormData({...pestFormData, suspectedId: e.target.value})}
                          >
                              <option value="">-- Chọn danh mục --</option>
                              {pestPresets.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả triệu chứng <span className="text-red-500">*</span></label>
                          <textarea 
                              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400"
                              rows={3}
                              placeholder="VD: Lá bị đốm vàng, xoăn lại..."
                              value={pestFormData.notes}
                              onChange={(e) => setPestFormData({...pestFormData, notes: e.target.value})}
                              required
                          />
                      </div>
                      
                      {/* Fake Photo Upload */}
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors">
                          <Camera size={24} className="mb-2"/>
                          <span className="text-xs">Chụp ảnh hoặc tải lên (Demo)</span>
                      </div>

                      <div className="pt-2">
                          <button 
                              type="submit" 
                              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                              <BrainCircuit size={18}/> Lưu & Nhận Tư Vấn AI
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Start Cycle Modal */}
      {showStartCycleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-agri-50">
                      <div>
                          <h3 className="font-bold text-lg text-agri-900">Bắt đầu vụ mùa mới</h3>
                          <p className="text-xs text-agri-700">Tại {field.name}</p>
                      </div>
                      <button onClick={() => setShowStartCycleModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleStartCycle} className="p-6 space-y-5">
                      {/* Crop Selection */}
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Chọn cây trồng (Theo danh mục)</label>
                          <select 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agri-500 bg-white"
                            value={newCycleData.presetId}
                            onChange={(e) => handlePresetChange(e.target.value)}
                            required
                          >
                              <option value="">-- Chọn loại rau màu --</option>
                              {cropPresets.map(crop => (
                                  <option key={crop.id} value={crop.id}>{crop.name} ({crop.growthDays} ngày)</option>
                              ))}
                              <option value="custom">Khác (Tự nhập)</option>
                          </select>
                      </div>

                      {/* Manual Name Input (if Custom or needed to edit) */}
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tên hiển thị</label>
                          <input 
                              type="text"
                              className="w-full p-2.5 border border-slate-300 rounded-lg"
                              value={newCycleData.cropName}
                              onChange={(e) => setNewCycleData({...newCycleData, cropName: e.target.value})}
                              placeholder="VD: Cải xanh L1"
                              required
                          />
                      </div>

                      {/* Crop Type (Visible only for custom) */}
                      {newCycleData.presetId === 'custom' && (
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm cây trồng</label>
                              <select 
                                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                                  value={newCycleData.cropType}
                                  onChange={(e) => setNewCycleData({...newCycleData, cropType: e.target.value as CropType})}
                              >
                                  {Object.values(CropType).map(t => (
                                      <option key={t} value={t}>{t}</option>
                                  ))}
                              </select>
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày xuống giống</label>
                              <input 
                                  type="date"
                                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                                  value={newCycleData.startDate}
                                  onChange={(e) => setNewCycleData({...newCycleData, startDate: e.target.value})}
                                  required
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian (ngày)</label>
                              <input 
                                  type="number"
                                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                                  value={newCycleData.growthDays}
                                  onChange={(e) => setNewCycleData({...newCycleData, growthDays: Number(e.target.value)})}
                              />
                          </div>
                      </div>

                      {/* Info Panel based on selection */}
                      {selectedPresetInfo && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2 text-sm">
                              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                                  <BrainCircuit size={14}/> Thông tin kỹ thuật:
                              </h4>
                              <p className="text-blue-700"><strong>Đặc điểm:</strong> {selectedPresetInfo.description}</p>
                              <div className="flex gap-4 mt-2">
                                  <span className="flex items-center gap-1 text-blue-600"><Clock size={14}/> {selectedPresetInfo.growthDays} ngày</span>
                                  <span className="flex items-center gap-1 text-blue-600"><Droplets size={14}/> Nước: {selectedPresetInfo.waterNeeds}</span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                  <p className="text-blue-800 font-medium mb-1">Lịch thu hoạch dự kiến:</p>
                                  <div className="flex items-center gap-2 text-lg font-bold text-blue-900">
                                      <CalendarDays size={20}/> {estimatedHarvestPreview}
                                  </div>
                                  <p className="text-xs text-blue-500 mt-1">*Hệ thống sẽ tự động tạo {selectedPresetInfo.defaultTasks.length} công việc mẫu.</p>
                              </div>
                          </div>
                      )}

                      <div className="pt-2 flex justify-end gap-3">
                          <button 
                              type="button" 
                              onClick={() => setShowStartCycleModal(false)}
                              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                          >
                              Hủy
                          </button>
                          <button 
                              type="submit" 
                              className="px-6 py-2 text-white bg-agri-600 hover:bg-agri-700 rounded-lg font-medium shadow-sm flex items-center gap-2"
                          >
                              Lên kế hoạch <ArrowRight size={16}/>
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Edit Field Modal */}
      {showEditFieldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-lg">Chỉnh sửa thông tin</h3>
                    <button onClick={() => setShowEditFieldModal(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <form onSubmit={handleSaveField} className="space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên luống</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-agri-500"
                            value={editFieldData.name}
                            onChange={e => setEditFieldData({...editFieldData, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium mb-1">Diện tích (m²)</label>
                             <input 
                                type="number"
                                className="w-full p-2.5 border rounded-lg"
                                value={editFieldData.area}
                                onChange={e => setEditFieldData({...editFieldData, area: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Loại đất</label>
                            <select 
                                className="w-full p-2.5 border rounded-lg bg-white"
                                value={editFieldData.soilType}
                                onChange={e => setEditFieldData({...editFieldData, soilType: e.target.value as SoilType})}
                            >
                                {Object.values(SoilType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Vị trí (Mô tả)</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg"
                            value={editFieldData.location}
                            onChange={e => setEditFieldData({...editFieldData, location: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Người phụ trách</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg"
                            value={editFieldData.assignedTo || ''}
                            onChange={e => setEditFieldData({...editFieldData, assignedTo: e.target.value})}
                        />
                    </div>
                    
                    {/* Interactive Map Picker */}
                    <div className="space-y-2">
                         <label className="block text-sm font-medium text-slate-700">Ghim vị trí trên bản đồ</label>
                         <div className="h-48 rounded-lg overflow-hidden border border-slate-300 relative">
                             <MapContainer 
                                key={showEditFieldModal ? "map-open" : "map-closed"}
                                center={editFieldData.coordinates || defaultCenter} 
                                zoom={13} 
                                style={{ height: '100%', width: '100%' }}
                             >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                <MapFix />
                                <LocationMarker 
                                    position={editFieldData.coordinates || null} 
                                    setPosition={(pos) => setEditFieldData({...editFieldData, coordinates: pos})} 
                                />
                             </MapContainer>
                             
                             {!editFieldData.coordinates && (
                                <div className="absolute inset-0 bg-black/10 z-[400] pointer-events-none flex items-center justify-center">
                                    <div className="bg-white/90 px-3 py-1 rounded shadow-sm text-xs font-medium text-slate-600 flex items-center gap-1">
                                        <MousePointerClick size={14} /> Click bản đồ để ghim
                                    </div>
                                </div>
                             )}
                         </div>
                         <div className="flex gap-2 text-xs text-slate-500">
                            <span className="w-1/2 p-2 bg-slate-50 border rounded truncate">Lat: {editFieldData.coordinates?.lat || '...'}</span>
                            <span className="w-1/2 p-2 bg-slate-50 border rounded truncate">Lng: {editFieldData.coordinates?.lng || '...'}</span>
                         </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 shrink-0">
                        <button type="button" onClick={() => setShowEditFieldModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-agri-600 text-white rounded-lg">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Edit Cycle Modal */}
      {showEditCycleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Chỉnh sửa vụ mùa</h3>
                    <button onClick={() => setShowEditCycleModal(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <form onSubmit={handleSaveCycle} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên cây trồng</label>
                        <input 
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-agri-500"
                            value={editCycleData.cropName || ''}
                            onChange={e => setEditCycleData({...editCycleData, cropName: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Ngày xuống giống</label>
                         <input 
                            type="date"
                            className="w-full p-2.5 border rounded-lg"
                            value={editCycleData.startDate || ''}
                            onChange={e => setEditCycleData({...editCycleData, startDate: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Ngày thu hoạch dự kiến</label>
                         <input 
                            type="date"
                            className="w-full p-2.5 border rounded-lg"
                            value={editCycleData.estimatedHarvestDate || ''}
                            onChange={e => setEditCycleData({...editCycleData, estimatedHarvestDate: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setShowEditCycleModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-agri-600 text-white rounded-lg">Cập nhật</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Task Modal (Add & Edit) */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">
                    {taskFormMode === 'add' ? 'Thêm công việc mới' : 'Chỉnh sửa công việc'}
                </h3>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Loại công việc</label>
                        <select 
                            value={taskFormData.type}
                            onChange={(e) => setTaskFormData({...taskFormData, type: e.target.value as TaskType})}
                            className="w-full p-2 border rounded-lg bg-white"
                        >
                            <option value={TaskType.WATER}>Tưới nước</option>
                            <option value={TaskType.FERTILIZE}>Bón phân</option>
                            <option value={TaskType.PESTICIDE}>Phun thuốc</option>
                            <option value={TaskType.PREPARE}>Làm đất</option>
                            <option value={TaskType.SOW}>Gieo trồng</option>
                            <option value={TaskType.HARVEST}>Thu hoạch</option>
                            <option value={TaskType.OTHER}>Khác</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ngày thực hiện</label>
                        <input 
                            type="date" 
                            className="w-full p-2 border rounded-lg" 
                            value={taskFormData.date}
                            onChange={(e) => setTaskFormData({...taskFormData, date: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Chi tiết</label>
                         <input 
                            type="text" 
                            placeholder="VD: Bón NPK 20-20-15" 
                            className="w-full p-2 border rounded-lg" 
                            required 
                            value={taskFormData.description}
                            onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                         />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-agri-600 text-white rounded-lg">
                            {taskFormMode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Harvest Modal */}
      {showHarvestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="font-bold text-lg mb-4">Ghi nhận thu hoạch</h3>
                <form onSubmit={handleHarvest} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Sản lượng (Kg)</label>
                        <input name="qty" type="number" className="w-full p-2 border rounded-lg" required min="0" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Doanh thu ước tính (VND)</label>
                        <input name="rev" type="number" className="w-full p-2 border rounded-lg" required min="0" step="1000" />
                    </div>

                    <div className="flex items-center gap-3 mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                        <input type="checkbox" id="isFinal" name="isFinal" className="w-5 h-5 text-agri-600 rounded focus:ring-agri-500 border-slate-300" />
                        <label htmlFor="isFinal" className="text-sm font-medium text-slate-800">Đây là đợt thu hoạch cuối (Kết thúc vụ)</label>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setShowHarvestForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default FieldDetail;