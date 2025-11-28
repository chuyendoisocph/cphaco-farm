
import React from 'react';
import { CloudRain, Sun, Cloud, Droplets, Thermometer, Wind } from 'lucide-react';
import { getSeason } from '../constants';
import { Season } from '../types';

const WeatherWidget = () => {
  const currentSeason = getSeason();
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });

  // Mock weather for Binh Duong (would be API in real app)
  const isRainySeason = currentSeason === Season.RAINY;
  const temp = isRainySeason ? 28 : 33;
  const humidity = isRainySeason ? 85 : 60;
  
  return (
    <div className="bg-gradient-to-br from-agri-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01] duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
        <Cloud size={150} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Bình Dương</h2>
            <p className="text-blue-50 text-sm font-medium opacity-90">{today}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
            isRainySeason ? 'bg-blue-800 text-blue-200' : 'bg-yellow-400 text-yellow-900'
          }`}>
            {currentSeason}
          </span>
        </div>

        <div className="flex items-center gap-6 my-4">
          <div className="text-5xl font-extrabold flex items-center">
            {isRainySeason ? <CloudRain size={48} className="mr-4 text-blue-200" /> : <Sun size={48} className="mr-4 text-yellow-300" />}
            {temp}°C
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-blue-50 font-medium">
              <Droplets size={16} /> Độ ẩm: {humidity}%
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-50 font-medium">
              <Wind size={16} /> Gió: 15 km/h
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
          <p className="text-sm leading-relaxed">
            <span className="font-bold text-yellow-200">Khuyến nghị:</span> {isRainySeason 
              ? "Dự báo có mưa chiều. Hạn chế tưới nước, chú ý thoát nước cho rãnh trồng rau."
              : "Trời nắng gắt. Nên tưới nước vào sáng sớm hoặc chiều mát để giữ ẩm cho đất."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;