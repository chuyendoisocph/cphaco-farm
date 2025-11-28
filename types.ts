
export enum SoilType {
  GRAY = 'Đất Xám',
  RED_YELLOW = 'Đất Đỏ Vàng',
  ALLUVIAL = 'Đất Phù Sa',
}

export enum Season {
  RAINY = 'Mùa Mưa',
  DRY = 'Mùa Khô',
}

export enum CropType {
  LEAFY = 'Rau Ăn Lá',
  FRUIT = 'Cây Ăn Trái',
  ROOT = 'Cây Lấy Củ',
  INDUSTRIAL = 'Cây Công Nghiệp',
}

export enum TaskType {
  PREPARE = 'Làm Đất',
  SOW = 'Gieo Trồng',
  FERTILIZE = 'Bón Phân',
  PESTICIDE = 'Phun Thuốc',
  WATER = 'Tưới Nước',
  HARVEST = 'Thu Hoạch',
  OTHER = 'Khác',
}

export interface UserProfile {
  name: string;
  role: 'Chủ trang trại' | 'Kỹ sư' | 'Nhân công';
  email?: string;
  phone?: string;
  avatarUrl?: string;
  joinDate: string;
}

export interface CropPreset {
  id: string;
  name: string;
  type: CropType;
  growthDays: number; // Số ngày từ gieo đến thu hoạch
  waterNeeds: 'Ít' | 'Trung bình' | 'Nhiều';
  description: string;
  defaultTasks: {
    dayOffset: number; // Ngày thực hiện tính từ ngày gieo (VD: ngày 7)
    type: TaskType;
    description: string;
  }[];
}

export interface Pest {
  id: string;
  name: string;
  type: 'insect' | 'disease'; // Sâu hại hoặc Bệnh hại
  symptoms: string;
  affectedCrops: string[]; // VD: ['Cải ngọt', 'Rau muống']
  prevention: string;
  treatmentBio: string; // Biện pháp sinh học
  treatmentChem: string; // Biện pháp hóa học (nếu cần)
  imageUrl?: string;
}

export interface PestReport {
  id: string;
  cycleId: string;
  date: string;
  observerNotes: string; // Mô tả của nông dân
  severity: 'low' | 'medium' | 'high';
  suspectedPestId?: string; // ID nếu chọn từ danh mục
  photoUrl?: string; // URL ảnh chụp
  aiDiagnosis?: string; // Lời khuyên từ AI
  status: 'open' | 'resolved';
}

export interface Field {
  id: string;
  name: string;
  area: number; // in m2
  soilType: SoilType;
  location: string;
  assignedTo?: string; // Người phụ trách
  coordinates?: {
    lat: number;
    lng: number;
  };
  currentCropId?: string; // ID of the active crop cycle
}

export interface Task {
  id: string;
  cycleId: string;
  type: TaskType;
  date: string;
  description: string;
  status: 'pending' | 'completed';
  cost?: number;
}

export interface HarvestLog {
  id: string;
  cycleId: string;
  date: string;
  quantityKg: number;
  quality: 'A' | 'B' | 'C';
  revenue: number; // VND
}

export interface CropCycle {
  id: string;
  fieldId: string;
  cropName: string;
  cropType: CropType;
  startDate: string;
  estimatedHarvestDate: string;
  status: 'active' | 'completed' | 'cancelled';
  tasks: Task[];
  harvests: HarvestLog[];
  notes?: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  condition: string;
  date: string;
}