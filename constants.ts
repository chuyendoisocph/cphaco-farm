
import { Season, SoilType, Field, CropType, CropCycle, TaskType, CropPreset, Pest } from './types';

// Binh Duong specific logic
export const getSeason = (date: Date = new Date()): Season => {
  const month = date.getMonth() + 1;
  // Binh Duong Rainy season: May (5) to October (10)
  if (month >= 5 && month <= 10) {
    return Season.RAINY;
  }
  return Season.DRY;
};

export const SOIL_COLORS = {
  [SoilType.GRAY]: 'bg-gray-400',
  [SoilType.RED_YELLOW]: 'bg-red-500',
  [SoilType.ALLUVIAL]: 'bg-yellow-600',
};

// PEST CATALOG - Danh mục sâu bệnh phổ biến (Comprehensive)
export const PEST_CATALOG: Pest[] = [
  {
    id: 'sau-to',
    name: 'Sâu Tơ',
    type: 'insect',
    symptoms: 'Sâu non ăn lá tạo thành các lỗ thủng, chỉ chừa lại gân lá. Thường gặp ở mặt dưới lá.',
    affectedCrops: ['Cải Ngọt', 'Cải Xanh', 'Súp Lơ', 'Bắp Cải'],
    prevention: 'Luân canh với cây khác họ. Vệ sinh đồng ruộng.',
    treatmentBio: 'Sử dụng chế phẩm Bt (Bacillus thuringiensis) hoặc thuốc trừ sâu sinh học thảo mộc.',
    treatmentChem: 'Dùng thuốc gốc Abamectin hoặc Emamectin benzoate (cách ly kỹ).'
  },
  {
    id: 'bo-nhay',
    name: 'Bọ Nhảy',
    type: 'insect',
    symptoms: 'Lá rau bị thủng lỗ nhỏ li ti, cây còi cọc. Bọ nhảy di chuyển rất nhanh khi động vào.',
    affectedCrops: ['Cải Ngọt', 'Cải Xanh', 'Rau Muống'],
    prevention: 'Làm đất kỹ, phơi ải diệt ấu trùng. Phủ nilon hoặc rơm rạ.',
    treatmentBio: 'Bẫy dính màu vàng. Phun dung dịch tỏi ớt gừng.',
    treatmentChem: 'Thuốc có hoạt chất Permethrin.'
  },
  {
    id: 'benh-thoi-nhun',
    name: 'Bệnh Thối Nhũn',
    type: 'disease',
    symptoms: 'Vết bệnh ban đầu mọng nước, sau đó thối nhũn, có mùi hôi khó chịu. Thường gặp mùa mưa.',
    affectedCrops: ['Cải Ngọt', 'Xà Lách', 'Hành Lá', 'Bắp Cải'],
    prevention: 'Lên luống cao thoát nước tốt. Không trồng quá dày. Bón vôi cân đối.',
    treatmentBio: 'Nấm đối kháng Trichoderma tưới gốc.',
    treatmentChem: 'Dùng thuốc gốc đồng hoặc Kasugamycin.'
  },
  {
    id: 'ray-mem',
    name: 'Rầy Mềm (Rệp Muội)',
    type: 'insect',
    symptoms: 'Rệp bám dày đặc ở ngọn non, hút nhựa làm lá xoăn, cây vàng úa. Có thể thấy kiến cộng sinh.',
    affectedCrops: ['Dưa Leo', 'Đậu Que', 'Cải Xanh', 'Ớt'],
    prevention: 'Bảo vệ thiên địch (bọ rùa).',
    treatmentBio: 'Phun nước xà phòng loãng hoặc dầu khoáng nông nghiệp.',
    treatmentChem: 'Thuốc Imidacloprid (lưu ý thời gian cách ly).'
  },
  {
    id: 'sau-ve-bua',
    name: 'Sâu Vẽ Bùa',
    type: 'insect',
    symptoms: 'Sâu đục dưới biểu bì lá tạo thành các đường ngoằn ngoèo màu trắng bạc. Lá bị xoăn lại.',
    affectedCrops: ['Cà Chua', 'Dưa Leo', 'Bầu', 'Bí'],
    prevention: 'Chăm sóc cây khỏe, bón phân cân đối.',
    treatmentBio: 'Dùng dầu khoáng SK Enspray 99EC hoặc tinh dầu Neem.',
    treatmentChem: 'Thuốc gốc Cypermethrin.'
  },
  {
    id: 'nhen-do',
    name: 'Nhện Đỏ',
    type: 'insect',
    symptoms: 'Lá chuyển màu vàng loang lổ, mặt dưới có tơ mỏng. Nhện rất nhỏ, màu đỏ.',
    affectedCrops: ['Hoa Cúc', 'Dưa Leo', 'Cà Pháo', 'Đậu Bắp'],
    prevention: 'Tưới phun mưa để rửa trôi nhện. Giữ ẩm đất.',
    treatmentBio: 'Phun lưu huỳnh vôi hoặc dầu khoáng.',
    treatmentChem: 'Thuốc đặc trị nhện Ortus, Pegasus.'
  },
  {
    id: 'bo-tri',
    name: 'Bọ Trĩ (Bù Lạch)',
    type: 'insect',
    symptoms: 'Hút nhựa ở đọt non và hoa làm lá xoăn, hoa rụng, trái bị sẹo (da cám).',
    affectedCrops: ['Dưa Leo', 'Dưa Lưới', 'Ớt', 'Hành Lá'],
    prevention: 'Dùng bẫy dính màu xanh/vàng.',
    treatmentBio: 'Chế phẩm nấm xanh Metarhizium.',
    treatmentChem: 'Confidor hoặc Radiant.'
  },
  {
    id: 'ruoi-vang',
    name: 'Ruồi Vàng Đục Quả',
    type: 'insect',
    symptoms: 'Vết chích trên quả thối nâu, có dòi bên trong. Gây rụng quả hàng loạt.',
    affectedCrops: ['Khổ Qua', 'Bầu', 'Bí', 'Mướp'],
    prevention: 'Bao trái sớm. Vệ sinh vườn.',
    treatmentBio: 'Dùng bẫy Pheromone (Vizubon-D).',
    treatmentChem: 'Phun bả protein.'
  },
  {
    id: 'benh-suong-mai',
    name: 'Bệnh Sương Mai',
    type: 'disease',
    symptoms: 'Đốm vàng trên lá, mặt dưới có lớp mốc trắng hoặc xám. Lá khô cháy.',
    affectedCrops: ['Dưa Leo', 'Dưa Lưới', 'Cà Chua'],
    prevention: 'Tránh tưới nước lên lá vào chiều tối.',
    treatmentBio: 'Dùng hoạt chất Mancozeb phòng ngừa.',
    treatmentChem: 'Ridomil Gold hoặc Aliette.'
  },
  {
    id: 'benh-phan-trang',
    name: 'Bệnh Phấn Trắng',
    type: 'disease',
    symptoms: 'Lớp bột màu trắng bao phủ trên mặt lá, thân và cành. Cây quang hợp kém.',
    affectedCrops: ['Bầu', 'Bí', 'Dưa Leo', 'Hoa Hồng'],
    prevention: 'Cắt tỉa lá già, tạo thông thoáng.',
    treatmentBio: 'Phun dung dịch Baking soda pha loãng hoặc dầu Neem.',
    treatmentChem: 'Anvil hoặc Tilt Super.'
  },
  {
    id: 'benh-heo-xanh',
    name: 'Bệnh Héo Xanh Vi Khuẩn',
    type: 'disease',
    symptoms: 'Cây đang xanh tốt bỗng héo rũ đột ngột vào ban ngày, ban đêm tươi lại, sau đó chết hẳn. Cắt thân thấy dịch đục.',
    affectedCrops: ['Cà Chua', 'Ớt', 'Cà Tím', 'Khoai Tây'],
    prevention: 'Chọn giống kháng bệnh. Xử lý đất bằng vôi.',
    treatmentBio: 'Tưới gốc nấm đối kháng Trichoderma + Pseudomonas.',
    treatmentChem: 'Khó trị, chủ yếu dùng Kasuran để hạn chế lây lan.'
  },
  {
    id: 'benh-than-thu',
    name: 'Bệnh Thán Thư',
    type: 'disease',
    symptoms: 'Vết bệnh hình tròn đồng tâm, màu nâu đen, lõm xuống. Thường thấy trên trái ớt, xoài.',
    affectedCrops: ['Ớt', 'Đậu Que', 'Cà Chua'],
    prevention: 'Bón cân đối NPK, không bón thừa đạm.',
    treatmentBio: 'Dùng thuốc gốc đồng.',
    treatmentChem: 'Antracol hoặc Score.'
  }
];

// CROP CATALOG - Danh mục cây trồng chuẩn cho Bình Dương (Comprehensive)
export const CROP_CATALOG: CropPreset[] = [
  // --- RAU ĂN LÁ ---
  {
    id: 'raumuong',
    name: 'Rau Muống',
    type: CropType.LEAFY,
    growthDays: 25,
    waterNeeds: 'Nhiều',
    description: 'Ưa nước, lớn nhanh. Thích hợp đất phù sa hoặc đất thịt giữ ẩm tốt.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.PREPARE, description: 'Làm đất kỹ, bón lót phân chuồng hoai mục' },
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt hoặc cấy' },
      { dayOffset: 1, type: TaskType.WATER, description: 'Tưới nước 2 lần/ngày (sáng sớm, chiều mát)' },
      { dayOffset: 10, type: TaskType.FERTILIZE, description: 'Bón thúc lần 1 (Phân Urê hoặc hữu cơ)' },
      { dayOffset: 15, type: TaskType.PESTICIDE, description: 'Kiểm tra sâu ăn lá, rầy' }
    ]
  },
  {
    id: 'caingot',
    name: 'Cải Ngọt',
    type: CropType.LEAFY,
    growthDays: 30,
    waterNeeds: 'Trung bình',
    description: 'Dễ trồng, ngắn ngày. Cần đất tơi xốp, thoát nước tốt mùa mưa.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt, phủ rơm mỏng giữ ẩm' },
      { dayOffset: 7, type: TaskType.FERTILIZE, description: 'Tưới nhử phân loãng' },
      { dayOffset: 15, type: TaskType.FERTILIZE, description: 'Bón thúc NPK' },
      { dayOffset: 20, type: TaskType.PESTICIDE, description: 'Phòng trừ bọ nhảy, sâu tơ' }
    ]
  },
  {
    id: 'caixanh',
    name: 'Cải Bẹ Xanh',
    type: CropType.LEAFY,
    growthDays: 40,
    waterNeeds: 'Trung bình',
    description: 'Vị cay nồng, chịu nóng tốt, ít sâu bệnh hơn cải ngọt.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt' },
      { dayOffset: 10, type: TaskType.FERTILIZE, description: 'Bón thúc lần 1 (Phân đạm)' },
      { dayOffset: 20, type: TaskType.FERTILIZE, description: 'Bón thúc lần 2' },
      { dayOffset: 35, type: TaskType.HARVEST, description: 'Thu hoạch tỉa lá hoặc cả cây' }
    ]
  },
  {
    id: 'mongtoi',
    name: 'Mồng Tơi',
    type: CropType.LEAFY,
    growthDays: 35,
    waterNeeds: 'Nhiều',
    description: 'Ưa nhiệt, lớn nhanh, có thể thu hoạch nhiều đợt (ngắt ngọn).',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt (ngâm ủ trước)' },
      { dayOffset: 15, type: TaskType.FERTILIZE, description: 'Bón thúc phân hữu cơ/urê' },
      { dayOffset: 30, type: TaskType.HARVEST, description: 'Thu hoạch lứa đầu (ngắt ngọn)' }
    ]
  },
  {
    id: 'xalach',
    name: 'Xà Lách (Rau Salad)',
    type: CropType.LEAFY,
    growthDays: 45,
    waterNeeds: 'Trung bình',
    description: 'Ưa khí hậu mát mẻ, cần che lưới nếu nắng gắt. Đất tơi xốp, giàu mùn.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt khay hoặc sạ thẳng' },
      { dayOffset: 15, type: TaskType.OTHER, description: 'Tỉa thưa cây' },
      { dayOffset: 20, type: TaskType.FERTILIZE, description: 'Tưới phân NPK loãng' }
    ]
  },
  {
    id: 'rauden',
    name: 'Rau Dền',
    type: CropType.LEAFY,
    growthDays: 25,
    waterNeeds: 'Trung bình',
    description: 'Rất dễ trồng, chịu hạn tốt, ít sâu bệnh. Có loại dền đỏ và dền xanh.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt trộn tro bếp' },
      { dayOffset: 10, type: TaskType.FERTILIZE, description: 'Bón thúc Urê' },
      { dayOffset: 25, type: TaskType.HARVEST, description: 'Nhổ cả cây hoặc cắt ngọn' }
    ]
  },
  {
    id: 'hanhla',
    name: 'Hành Lá',
    type: CropType.LEAFY,
    growthDays: 45,
    waterNeeds: 'Trung bình',
    description: 'Ưa đất tơi xốp, thoát nước tốt. Trồng từ gốc hoặc hạt. Giá trị kinh tế cao.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Trồng gốc hành' },
      { dayOffset: 10, type: TaskType.FERTILIZE, description: 'Tưới phân urê loãng' },
      { dayOffset: 25, type: TaskType.FERTILIZE, description: 'Bón thúc kali + lân' },
      { dayOffset: 40, type: TaskType.HARVEST, description: 'Thu hoạch cả cây' }
    ]
  },
  {
    id: 'suplo',
    name: 'Súp Lơ (Bông Cải)',
    type: CropType.LEAFY,
    growthDays: 70,
    waterNeeds: 'Nhiều',
    description: 'Cần đất ẩm, mát. Khi ra hoa cần che lá để bông trắng đẹp.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Trồng cây con' },
      { dayOffset: 45, type: TaskType.OTHER, description: 'Che bông (bẻ lá che)' },
      { dayOffset: 20, type: TaskType.FERTILIZE, description: 'Bón thúc cây phát triển thân lá' }
    ]
  },

  // --- CỦ ---
  {
    id: 'carot',
    name: 'Cà Rốt',
    type: CropType.ROOT,
    growthDays: 90,
    waterNeeds: 'Trung bình',
    description: 'Cần đất cát pha hoặc thịt nhẹ, làm đất sâu để củ thẳng.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt (cần phủ rơm)' },
      { dayOffset: 20, type: TaskType.OTHER, description: 'Tỉa cây lần 1' },
      { dayOffset: 60, type: TaskType.FERTILIZE, description: 'Bón thúc Kali nuôi củ' }
    ]
  },
  {
    id: 'cucai',
    name: 'Củ Cải Trắng',
    type: CropType.ROOT,
    growthDays: 50,
    waterNeeds: 'Trung bình',
    description: 'Lớn nhanh. Không bón quá nhiều đạm để tránh nứt củ.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt theo hốc' },
      { dayOffset: 15, type: TaskType.OTHER, description: 'Vun gốc cho củ' },
      { dayOffset: 30, type: TaskType.PESTICIDE, description: 'Phòng rệp sáp và sâu xám' }
    ]
  },

  // --- QUẢ ---
  {
    id: 'dualeo',
    name: 'Dưa Leo',
    type: CropType.FRUIT,
    growthDays: 65,
    waterNeeds: 'Nhiều',
    description: 'Cần làm giàn. Thu hoạch kéo dài. Nhạy cảm với sương mai.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt vào bầu hoặc trực tiếp' },
      { dayOffset: 15, type: TaskType.OTHER, description: 'Làm giàn leo' },
      { dayOffset: 20, type: TaskType.FERTILIZE, description: 'Bón thúc ra hoa' },
      { dayOffset: 40, type: TaskType.HARVEST, description: 'Bắt đầu thu hoạch đợt đầu' }
    ]
  },
  {
    id: 'khoqua',
    name: 'Khổ Qua (Mướp Đắng)',
    type: CropType.FRUIT,
    growthDays: 55,
    waterNeeds: 'Trung bình',
    description: 'Ưa nắng, chịu nhiệt tốt. Cần làm giàn vững chắc.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt (bấm nhẹ vỏ)' },
      { dayOffset: 15, type: TaskType.OTHER, description: 'Cắm chà, làm giàn' },
      { dayOffset: 30, type: TaskType.PESTICIDE, description: 'Phòng ruồi vàng đục quả' }
    ]
  },
  {
    id: 'cachua',
    name: 'Cà Chua',
    type: CropType.FRUIT,
    growthDays: 75,
    waterNeeds: 'Trung bình',
    description: 'Cây ưa sáng. Tránh trồng đất vừa trồng họ Cà (ớt, khoai tây).',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Trồng cây con ra ruộng' },
      { dayOffset: 10, type: TaskType.OTHER, description: 'Cắm cọc đỡ cây' },
      { dayOffset: 25, type: TaskType.OTHER, description: 'Tỉa nhánh vô hiệu' }
    ]
  },
  {
    id: 'ot',
    name: 'Ớt Chỉ Thiên',
    type: CropType.FRUIT,
    growthDays: 70,
    waterNeeds: 'Trung bình',
    description: 'Cây gia vị, thu hoạch kéo dài. Tuyệt đối không để úng nước.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt vào bầu' },
      { dayOffset: 35, type: TaskType.FERTILIZE, description: 'Bón thúc lần 1' },
      { dayOffset: 60, type: TaskType.PESTICIDE, description: 'Phòng bệnh thán thư' }
    ]
  },
  {
    id: 'dauque',
    name: 'Đậu Que (Đậu Cove)',
    type: CropType.FRUIT,
    growthDays: 55,
    waterNeeds: 'Trung bình',
    description: 'Rễ có nốt sần cố định đạm, cải tạo đất rất tốt.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt theo hốc' },
      { dayOffset: 20, type: TaskType.OTHER, description: 'Cắm chà (làm giàn)' }
    ]
  },
  {
    id: 'daubap',
    name: 'Đậu Bắp',
    type: CropType.FRUIT,
    growthDays: 50,
    waterNeeds: 'Trung bình',
    description: 'Chịu hạn khá tốt. Thu hoạch trái non hàng ngày.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt trực tiếp' },
      { dayOffset: 30, type: TaskType.FERTILIZE, description: 'Bón thúc ra hoa' },
      { dayOffset: 45, type: TaskType.HARVEST, description: 'Thu hoạch mỗi ngày' }
    ]
  },
  {
    id: 'bau',
    name: 'Bầu',
    type: CropType.FRUIT,
    growthDays: 60,
    waterNeeds: 'Nhiều',
    description: 'Sinh trưởng mạnh, cần giàn lớn. Trái ra nhiều.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt bầu' },
      { dayOffset: 20, type: TaskType.OTHER, description: 'Làm giàn kiên cố' },
      { dayOffset: 40, type: TaskType.OTHER, description: 'Ngắt ngọn để đẻ nhánh' }
    ]
  },
  {
    id: 'bixanh',
    name: 'Bí Xanh (Bí Đao)',
    type: CropType.FRUIT,
    growthDays: 80,
    waterNeeds: 'Trung bình',
    description: 'Có thể để bò đất hoặc leo giàn. Trái bảo quản được lâu.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt' },
      { dayOffset: 25, type: TaskType.FERTILIZE, description: 'Bón thúc nuôi dây' },
      { dayOffset: 50, type: TaskType.FERTILIZE, description: 'Bón thúc nuôi quả' }
    ]
  },
  {
    id: 'bido',
    name: 'Bí Đỏ (Bí Ngô)',
    type: CropType.FRUIT,
    growthDays: 90,
    waterNeeds: 'Trung bình',
    description: 'Thường để bò đất. Cần thụ phấn bổ sung nếu ít ong bướm.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Gieo hạt theo hốc' },
      { dayOffset: 45, type: TaskType.OTHER, description: 'Thụ phấn bổ sung (buổi sáng)' }
    ]
  },

  // --- HOA ---
  {
    id: 'hoacuc',
    name: 'Hoa Cúc (Vàng/Đại đóa)',
    type: CropType.INDUSTRIAL, // Tạm xếp vào nhóm khác hoặc thêm type Hoa
    growthDays: 80,
    waterNeeds: 'Trung bình',
    description: 'Trồng lấy hoa cắt cành hoặc chậu. Cần chong đèn để điều khiển ra hoa.',
    defaultTasks: [
      { dayOffset: 0, type: TaskType.SOW, description: 'Trồng cây con' },
      { dayOffset: 15, type: TaskType.OTHER, description: 'Bấm ngọn tạo tán' },
      { dayOffset: 30, type: TaskType.OTHER, description: 'Chong đèn ban đêm' }
    ]
  }
];

// Mock Initial Data
export const MOCK_FIELDS: Field[] = [
  {
    id: 'f1',
    name: 'Luống A1 - Cải Ngọt',
    area: 50,
    soilType: SoilType.ALLUVIAL,
    location: 'Khu A, Ven Sông',
    assignedTo: 'Nông Dân Ba',
    coordinates: { lat: 11.053, lng: 106.666 },
  },
  {
    id: 'f2',
    name: 'Luống B2 - Dưa Leo',
    area: 80,
    soilType: SoilType.GRAY,
    location: 'Khu B, Gần Giếng',
    assignedTo: 'Chị Tư',
    coordinates: { lat: 11.058, lng: 106.670 },
  },
  {
    id: 'f3',
    name: 'Vườn Sầu Riêng Nhỏ',
    area: 1000,
    soilType: SoilType.RED_YELLOW,
    location: 'Vườn Đồi',
    assignedTo: 'Anh Năm',
    coordinates: { lat: 11.045, lng: 106.660 },
  },
];

export const MOCK_CYCLES: CropCycle[] = [
  {
    id: 'c1',
    fieldId: 'f1',
    cropName: 'Cải Xanh',
    cropType: CropType.LEAFY,
    startDate: '2023-10-01',
    estimatedHarvestDate: '2023-11-15',
    status: 'completed',
    tasks: [],
    harvests: [
      { id: 'h1', cycleId: 'c1', date: '2023-11-10', quantityKg: 50, quality: 'A', revenue: 500000 }
    ]
  },
  {
    id: 'c2',
    fieldId: 'f1',
    cropName: 'Dưa Leo',
    cropType: CropType.FRUIT,
    startDate: '2023-12-01',
    estimatedHarvestDate: '2024-02-01',
    status: 'active',
    tasks: [
      { id: 't1', cycleId: 'c2', type: TaskType.FERTILIZE, date: '2023-12-05', description: 'Bón lót NPK', status: 'completed', cost: 20000 },
      { id: 't2', cycleId: 'c2', type: TaskType.WATER, date: '2023-12-10', description: 'Tưới nhỏ giọt', status: 'completed', cost: 0 },
    ],
    harvests: []
  },
  {
    id: 'c3',
    fieldId: 'f3',
    cropName: 'Sầu Riêng',
    cropType: CropType.FRUIT,
    startDate: '2020-05-01',
    estimatedHarvestDate: '2024-06-01',
    status: 'active',
    tasks: [],
    harvests: []
  }
];