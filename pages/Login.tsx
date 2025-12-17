import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle2, Sprout, Leaf, CloudSun, AlertCircle } from 'lucide-react';

const Login = () => {
  // Pre-fill default credentials as requested
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useFarm();
  const navigate = useNavigate();

  // Restore saved email and redirect if already authenticated
  useEffect(() => {
    const savedEmail = localStorage.getItem('farmEmail');
    if (savedEmail) setEmail(savedEmail);
    const auth = localStorage.getItem('farmAuth');
    if (auth === 'true') {
      navigate('/');
    }
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for effect
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        // Reset fields after successful login
        setEmail('');
        setPassword('');
        // Persist auth/email based on "remember"
        localStorage.setItem('farmAuth', 'true');
        if (remember) {
          localStorage.setItem('farmEmail', email);
        } else {
          localStorage.removeItem('farmEmail');
        }
        setLoading(false);
        navigate('/');
      } else {
        // Clear any stale auth flag
        localStorage.removeItem('farmAuth');
        setError('Thông tin đăng nhập không chính xác.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="signin-container">
      <style>{`
        :root {
            --primary-blue: #0066FF;
            --primary-blue-light: #3385FF;
            --primary-blue-dark: #0052CC;
            --gradient-start: #0066FF;
            --gradient-end: #00C9FF;
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --text-light: #999999;
            --bg-white: #ffffff;
            --border-color: #e5e7eb;
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .signin-container {
            position: relative;
            display: flex;
            min-height: 100vh;
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f4ff 100%);
            overflow: hidden;
            font-family: 'Inter', sans-serif;
        }

        /* Background Orbs */
        .background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            overflow: hidden;
            pointer-events: none;
        }

        .gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
            animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, var(--primary-blue), var(--gradient-end));
            top: -10%;
            right: -10%;
            animation-delay: 0s;
        }

        .orb-2 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            bottom: -10%;
            left: -10%;
            animation-delay: -7s;
        }

        .orb-3 {
            width: 350px;
            height: 350px;
            background: linear-gradient(135deg, #f093fb, #f5576c);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-delay: -14s;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        /* Branding Section */
        .signin-brand {
            flex: 1;
            padding: 4rem 6rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            z-index: 1;
            max-width: 50%;
        }

        .brand-logo {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 3rem;
        }

        .brand-logo img {
            height: 48px;
            width: auto;
        }

        .brand-name {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary-blue-dark), var(--primary-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .brand-title {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }

        .brand-description {
            font-size: 1.25rem;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 3rem;
            max-width: 90%;
        }

        .brand-features {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .feature-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(255, 255, 255, 0.5);
            padding: 1rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .feature-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: white;
            color: var(--primary-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .feature-text strong {
            display: block;
            font-size: 1rem;
            color: var(--text-primary);
        }
        
        .feature-text p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* Form Section */
        .signin-form-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
            z-index: 1;
        }

        .signin-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 3rem;
            width: 100%;
            max-width: 480px;
            box-shadow: var(--shadow-2xl);
            border: 1px solid white;
            animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .form-header {
            text-align: center;
            margin-bottom: 2.5rem;
        }

        .form-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .form-subtitle {
            color: var(--text-secondary);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            font-weight: 600;
            font-size: 0.9375rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .input-wrapper {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-light);
        }

        .form-input {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: white;
            outline: none;
        }

        .form-input:focus {
            border-color: var(--primary-blue);
            box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
        }

        .toggle-password {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-light);
            cursor: pointer;
        }

        .submit-button {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);
        }

        .submit-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 102, 255, 0.4);
        }
        
        .submit-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .error-message {
            background-color: #fef2f2;
            color: #ef4444;
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
            border: 1px solid #fee2e2;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 1024px) {
            .signin-container {
                flex-direction: column;
                height: auto;
                min-height: 100vh;
            }
            .signin-brand {
                max-width: 100%;
                padding: 3rem 2rem;
                align-items: center;
                text-align: center;
            }
            .brand-title { font-size: 2.5rem; }
            .brand-features { display: none; }
            .signin-form-container { padding: 2rem; }
        }
      `}</style>

      {/* Background Animation */}
      <div className="background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
      </div>

      {/* Brand Section */}
      <div className="signin-brand">
          <div className="brand-logo">
               <div className="w-12 h-12 rounded-xl  flex items-center justify-center">
                  <img 
                    src="https://i.postimg.cc/vZDFNY5J/CPH_LOGO_1.png" 
                    alt="CPHACO Logo" 
                    className="h-8 w-auto" 
                  />
               </div>
               <span className="brand-name">CPHACO FARM</span>
          </div>
          
          <h1 className="brand-title">
            Nông Nghiệp <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Thông Minh 4.0</span>
          </h1>
          
          <p className="brand-description">
              Hệ thống quản lý toàn diện giúp tối ưu hóa quy trình canh tác, 
              giám sát mùa vụ và nâng cao năng suất với công nghệ AI tiên tiến.
          </p>

          <div className="brand-features">
               <div className="feature-item">
                   <div className="feature-icon">
                     <CloudSun size={20} />
                   </div>
                   <div className="feature-text">
                       <strong>Dự báo thời tiết & Mùa vụ</strong>
                       <p>Cập nhật chính xác điều kiện canh tác tại Bình Dương.</p>
                   </div>
               </div>
               <div className="feature-item">
                   <div className="feature-icon">
                     <Leaf size={20} />
                   </div>
                   <div className="feature-text">
                       <strong>Chẩn đoán sâu bệnh AI</strong>
                       <p>Phát hiện sớm và đề xuất giải pháp xử lý sinh học.</p>
                   </div>
               </div>
               <div className="feature-item">
                   <div className="feature-icon">
                     <Sprout size={20} />
                   </div>
                   <div className="feature-text">
                       <strong>Quản lý quy trình khép kín</strong>
                       <p>Từ lúc xuống giống đến khi thu hoạch và báo cáo.</p>
                   </div>
               </div>
          </div>
      </div>

      {/* Form Section */}
      <div className="signin-form-container">
          <div className="signin-card">
              <div className="form-header">
                  <h2 className="form-title">Chào Mừng</h2>
                  <p className="form-subtitle">Đăng nhập để quản lý nông trại Hoa Viên</p>
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                  <div className="form-group">
                      <label className="form-label">Email đăng nhập</label>
                      <div className="input-wrapper">
                          <div className="input-icon">
                              <Mail size={20} />
                          </div>
                          <input 
                              type="email" 
                              className="form-input" 
                              placeholder="trietphu@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                          />
                      </div>
                  </div>

                  <div className="form-group">
                      <label className="form-label">Mật khẩu</label>
                      <div className="input-wrapper">
                          <div className="input-icon">
                              <Lock size={20} />
                          </div>
                          <input 
                              type={showPassword ? "text" : "password"} 
                              className="form-input" 
                              placeholder="Nhập mật khẩu"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                          />
                          <button 
                              type="button"
                              className="toggle-password"
                              onClick={() => setShowPassword(!showPassword)}
                          >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                      </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                          />
                          <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                      </label>
                      <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Quên mật khẩu?</a>
                  </div>

                  <button type="submit" className="submit-button" disabled={loading}>
                      {loading ? 'Đang xử lý...' : (
                        <>Đăng Nhập <ArrowRight size={20} /></>
                      )}
                  </button>
              </form>
          </div>
      </div>
    </div>
  );
};

export default Login;