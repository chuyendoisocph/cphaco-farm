
import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tractor, BarChart3, Bot, Menu, X, Cloud, CloudOff, Settings, User, LogOut } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isCloudConnected, userProfile, logout } = useFarm();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Tổng Quan' },
    { to: '/fields', icon: <Tractor size={20} />, label: 'Luống Trồng' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'Báo Cáo' },
    { to: '/assistant', icon: <Bot size={20} />, label: 'Trợ Lý AI' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Cài Đặt' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-agri-600 to-cyan-500 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center">
          <img 
            src="https://i.postimg.cc/vZDFNY5J/CPH_LOGO_1.png" 
            alt="CPHACO Logo" 
            className="h-10 w-auto object-contain bg-white/90 rounded-md p-1" 
          />
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-xl md:shadow-none flex flex-col
      `}>
        <div className="p-6 hidden md:flex justify-center items-center border-b border-slate-50">
           <img 
            src="https://i.postimg.cc/vZDFNY5J/CPH_LOGO_1.png" 
            alt="CPHACO Logo" 
            className="h-24 w-auto object-contain hover:scale-105 transition-transform duration-300" 
          />
        </div>

        <nav className="p-4 space-y-2 flex-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-agri-50 text-agri-700 border-l-4 border-agri-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-agri-600'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
           {/* Cloud Status Indicator */}
           <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${isCloudConnected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {isCloudConnected ? <Cloud size={14}/> : <CloudOff size={14}/>}
                {isCloudConnected ? 'Cloud Online' : 'Local Mode'}
           </div>

          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-agri-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
              {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full"/> : <User size={20} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-500 truncate">{userProfile.role}</p>
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth bg-[#f8f9fa]">
        <Outlet />
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
