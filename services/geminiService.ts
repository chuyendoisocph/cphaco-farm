
import { GoogleGenAI } from "@google/genai";
import { Field, CropCycle, SoilType, Season, PestReport } from "../types";
import { getSeason } from "../constants";
import { log } from "console";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBhhDbuTmqJ2UIrT0GejOYxQfH0UA7Jvcw"});
console.log(ai);

const SYSTEM_INSTRUCTION = `
Bạn là một kỹ sư nông nghiệp AI chuyên gia (Agri-Expert) của công ty CPHACO, chuyên về nông nghiệp công nghệ cao và bền vững.
Bạn am hiểu sâu về thổ nhưỡng và khí hậu tỉnh Bình Dương.
Nhiệm vụ của bạn là tư vấn cho nông dân về kế hoạch trồng trọt, luân canh, xử lý sâu bệnh và dự báo mùa vụ.

Thông tin bối cảnh Bình Dương:
- Mùa mưa: Tháng 5 - Tháng 10.
- Mùa khô: Tháng 11 - Tháng 4.
- Đất đai: Đất xám (bạc màu, cần phân hữu cơ), Đất đỏ vàng (thích hợp cây công nghiệp, ăn trái), Đất phù sa (ven sông, tốt cho rau màu).

Hãy trả lời ngắn gọn, thiết thực, tập trung vào kỹ thuật và hiệu quả kinh tế. Định dạng câu trả lời dễ đọc (Markdown).
Xưng hô là "Kỹ sư CPHACO" hoặc "Tôi".
Nếu người dùng báo cáo sâu bệnh, hãy ưu tiên đưa ra biện pháp sinh học, an toàn trước, hóa học là giải pháp cuối cùng.
`;

export const getGeminiAdvice = async (
  prompt: string,
  contextData?: { field?: Field; cycle?: CropCycle; pestReport?: PestReport }
) => {
  try {
    let contextString = "";
    if (contextData?.field) {
      contextString += `\n[Thông tin luống trồng đang xét: Tên "${contextData.field.name}", Diện tích ${contextData.field.area}m2, Loại đất: ${contextData.field.soilType}, Vị trí: ${contextData.field.location}]`;
    }
    if (contextData?.cycle) {
      contextString += `\n[Mùa vụ hiện tại: Cây ${contextData.cycle.cropName}, Bắt đầu ${contextData.cycle.startDate}, Trạng thái: ${contextData.cycle.status}]`;
    }
    if (contextData?.pestReport) {
      contextString += `\n[BÁO CÁO SÂU BỆNH MỚI:
         - Ngày phát hiện: ${contextData.pestReport.date}
         - Mức độ: ${contextData.pestReport.severity}
         - Triệu chứng/Ghi chú của nông dân: "${contextData.pestReport.observerNotes}"
         - Nghi ngờ loại: ${contextData.pestReport.suspectedPestId || "Chưa rõ"}
      ]
      HÃY PHÂN TÍCH TRIỆU CHỨNG VÀ ĐƯA RA PHÁC ĐỒ ĐIỀU TRỊ CỤ THỂ CHO CÂY TRỒNG NÀY.`;
    }

    const currentSeason = getSeason();
    contextString += `\n[Thời điểm hiện tại: ${new Date().toLocaleDateString('vi-VN')} - ${currentSeason} tại Bình Dương]`;

    const fullPrompt = `${contextString}\n\nCâu hỏi/Yêu cầu của nông dân: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Xin lỗi, hiện tại hệ thống tư vấn đang bận. Vui lòng thử lại sau.";
  }
};