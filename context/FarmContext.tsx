
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Field, CropCycle, Task, HarvestLog, CropPreset, PestReport, Pest, UserProfile } from '../types';
import { MOCK_FIELDS, MOCK_CYCLES, CROP_CATALOG as DEFAULT_CROPS, PEST_CATALOG as DEFAULT_PESTS } from '../constants';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

interface FarmContextType {
  // Auth
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  userProfile: UserProfile;
  fields: Field[];
  cycles: CropCycle[];
  pestReports: PestReport[];
  cropPresets: CropPreset[];
  pestPresets: Pest[];
  
  // User Ops
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Field Ops
  addField: (field: Field) => void;
  updateField: (id: string, updatedField: Partial<Field>) => void;
  deleteField: (id: string) => void;
  
  // Cycle Ops
  addCycle: (cycle: CropCycle, presetId?: string) => void;
  updateCycle: (id: string, updatedCycle: Partial<CropCycle>) => void;
  endCycle: (cycleId: string) => void;
  
  // Task Ops
  addTask: (task: Task) => void;
  updateTask: (cycleId: string, taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (cycleId: string, taskId: string) => void;
  updateTaskStatus: (cycleId: string, taskId: string, status: 'pending' | 'completed') => void;
  
  // Harvest Ops
  addHarvest: (harvest: HarvestLog) => void;
  
  // Pest Report Ops
  addPestReport: (report: PestReport) => void;
  updatePestReport: (id: string, updatedReport: Partial<PestReport>) => void;
  
  // Admin Preset Ops
  addCropPreset: (preset: CropPreset) => void;
  deleteCropPreset: (id: string) => void;
  addPestPreset: (pest: Pest) => void;
  deletePestPreset: (id: string) => void;

  // Utils
  getFormattedCurrency: (amount: number) => string;
  isCloudConnected: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Data State initialization
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Nông Dân Ba',
    role: 'Chủ trang trại',
    joinDate: new Date().toISOString()
  });

  const [fields, setFields] = useState<Field[]>([]);
  const [cycles, setCycles] = useState<CropCycle[]>([]);
  const [pestReports, setPestReports] = useState<PestReport[]>([]);
  
  // Presets State (Dynamic)
  const [cropPresets, setCropPresets] = useState<CropPreset[]>(DEFAULT_CROPS);
  const [pestPresets, setPestPresets] = useState<Pest[]>(DEFAULT_PESTS);

  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Check Auth on Mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('cphaco_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Initial Load Effect (Data)
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      setIsCloudConnected(true);
      
      // Load User Profile (Singleton for demo)
      getDoc(doc(db, "users", "current_user")).then(docSnap => {
          if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
          }
      }).catch(err => console.error("Error fetching user:", err));

      // Real-time Sync for Fields
      const unsubFields = onSnapshot(collection(db, "fields"), (snapshot) => {
        const fieldsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Field));
        setFields(fieldsData);
      }, (error) => {
        if (error.code === 'not-found' || error.message.includes('does not exist')) {
            console.warn("Database chưa được tạo. Chuyển về chế độ Local.");
            setIsCloudConnected(false);
            loadLocalData();
        } else {
            console.error("Lỗi đồng bộ Fields:", error);
            setIsCloudConnected(false);
        }
      });

      // Real-time Sync for Cycles
      const unsubCycles = onSnapshot(collection(db, "cycles"), (snapshot) => {
        const cyclesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CropCycle));
        setCycles(cyclesData);
      }, (error) => console.error("Lỗi đồng bộ Cycles:", error));

      // Real-time Sync for Pest Reports
      const unsubPests = onSnapshot(collection(db, "pest_reports"), (snapshot) => {
        const pestData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PestReport));
        setPestReports(pestData);
      }, (error) => console.error("Lỗi đồng bộ Pest Reports:", error));

      // Real-time Sync for Presets
       const unsubCropPresets = onSnapshot(collection(db, "presets_crops"), (snapshot) => {
          if (!snapshot.empty) {
             const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CropPreset));
             setCropPresets(data);
          }
       }, () => {});

       const unsubPestPresets = onSnapshot(collection(db, "presets_pests"), (snapshot) => {
          if (!snapshot.empty) {
             const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Pest));
             setPestPresets(data);
          }
       }, () => {});


      return () => {
        unsubFields();
        unsubCycles();
        unsubPests();
        unsubCropPresets();
        unsubPestPresets();
      };
    } else {
      loadLocalData();
    }
  }, []);

  const loadLocalData = () => {
      setIsCloudConnected(false);
      const savedUser = localStorage.getItem('agri_bd_user');
      const savedFields = localStorage.getItem('agri_bd_fields');
      const savedCycles = localStorage.getItem('agri_bd_cycles');
      const savedPests = localStorage.getItem('agri_bd_pests');
      const savedCropPresets = localStorage.getItem('agri_bd_crop_presets');
      const savedPestPresets = localStorage.getItem('agri_bd_pest_presets');

      if (savedUser) setUserProfile(JSON.parse(savedUser));
      setFields(savedFields ? JSON.parse(savedFields) : MOCK_FIELDS);
      setCycles(savedCycles ? JSON.parse(savedCycles) : MOCK_CYCLES);
      setPestReports(savedPests ? JSON.parse(savedPests) : []);
      if (savedCropPresets) setCropPresets(JSON.parse(savedCropPresets));
      if (savedPestPresets) setPestPresets(JSON.parse(savedPestPresets));
  };

  // LocalStorage Persistence (Only in Offline Mode for Data)
  useEffect(() => {
    if (!isCloudConnected) {
      localStorage.setItem('agri_bd_user', JSON.stringify(userProfile));
      localStorage.setItem('agri_bd_fields', JSON.stringify(fields));
      localStorage.setItem('agri_bd_cycles', JSON.stringify(cycles));
      localStorage.setItem('agri_bd_pests', JSON.stringify(pestReports));
      localStorage.setItem('agri_bd_crop_presets', JSON.stringify(cropPresets));
      localStorage.setItem('agri_bd_pest_presets', JSON.stringify(pestPresets));
    }
  }, [userProfile, fields, cycles, pestReports, cropPresets, pestPresets, isCloudConnected]);


  // --- Auth Actions ---
  const login = (email: string, pass: string): boolean => {
    // Authenticate against strict hardcoded credentials
    if (email === 'trietphu@gmail.com' && pass === '12345678') {
      setIsAuthenticated(true);
      localStorage.setItem('cphaco_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cphaco_auth');
  };

  // --- Data Actions ---

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
      if (isCloudConnected && db) {
          await setDoc(doc(db, "users", "current_user"), { ...userProfile, ...profile }, { merge: true });
      }
      setUserProfile(prev => ({ ...prev, ...profile }));
  };

  const addField = async (field: Field) => {
    if (isCloudConnected && db) {
      await setDoc(doc(db, "fields", field.id), field);
    } else {
      setFields([...fields, field]);
    }
  };

  const updateField = async (id: string, updatedField: Partial<Field>) => {
    if (isCloudConnected && db) {
      const fieldRef = doc(db, "fields", id);
      await updateDoc(fieldRef, updatedField);
    } else {
      setFields(prev => prev.map(f => f.id === id ? { ...f, ...updatedField } : f));
    }
  };

  const deleteField = async (id: string) => {
    if (isCloudConnected && db) {
      await deleteDoc(doc(db, "fields", id));
    } else {
      setFields(prev => prev.filter(f => f.id !== id));
    }
  };

  const addCycle = async (cycle: CropCycle, presetId?: string) => {
    let newCycle = { ...cycle };

    // Auto-generate tasks using the dynamic cropPresets
    if (presetId) {
      const preset = cropPresets.find(p => p.id === presetId);
      if (preset) {
        const startDateObj = new Date(cycle.startDate);
        const autoTasks: Task[] = preset.defaultTasks.map(dt => {
           const taskDate = new Date(startDateObj);
           taskDate.setDate(taskDate.getDate() + dt.dayOffset);
           return {
             id: Math.random().toString(36).substr(2, 9),
             cycleId: cycle.id,
             type: dt.type,
             date: taskDate.toISOString().split('T')[0],
             description: dt.description,
             status: 'pending'
           };
        });
        newCycle.tasks = [...newCycle.tasks, ...autoTasks];
      }
    }

    if (isCloudConnected && db) {
      await setDoc(doc(db, "cycles", newCycle.id), newCycle);
      if (newCycle.status === 'active') {
         const fieldRef = doc(db, "fields", newCycle.fieldId);
         await updateDoc(fieldRef, { currentCropId: newCycle.id });
      }
    } else {
      setCycles([...cycles, newCycle]);
      if (newCycle.status === 'active') {
         setFields(prev => prev.map(f => f.id === newCycle.fieldId ? { ...f, currentCropId: newCycle.id } : f));
      }
    }
  };

  const updateCycle = async (id: string, updatedCycle: Partial<CropCycle>) => {
    if (isCloudConnected && db) {
      await updateDoc(doc(db, "cycles", id), updatedCycle);
    } else {
      setCycles(prev => prev.map(c => c.id === id ? { ...c, ...updatedCycle } : c));
    }
  };

  const endCycle = async (cycleId: string) => {
    if (isCloudConnected && db) {
      await updateDoc(doc(db, "cycles", cycleId), { status: 'completed' });
      const cycle = cycles.find(c => c.id === cycleId);
      if (cycle) {
        await updateDoc(doc(db, "fields", cycle.fieldId), { currentCropId: null as any });
      }
    } else {
      setCycles(prev => prev.map(c => c.id === cycleId ? { ...c, status: 'completed' } : c));
      const cycle = cycles.find(c => c.id === cycleId);
      if (cycle) {
        setFields(prev => prev.map(f => f.id === cycle.fieldId ? { ...f, currentCropId: undefined } : f));
      }
    }
  };

  // Helper for deep updates
  const updateCycleDeep = async (updatedCycle: CropCycle) => {
      if (isCloudConnected && db) {
          await setDoc(doc(db, "cycles", updatedCycle.id), updatedCycle);
      } else {
          setCycles(prev => prev.map(c => c.id === updatedCycle.id ? updatedCycle : c));
      }
  };

  const addTask = (task: Task) => {
    const cycle = cycles.find(c => c.id === task.cycleId);
    if (cycle) {
        const updatedCycle = { ...cycle, tasks: [...cycle.tasks, task] };
        updateCycleDeep(updatedCycle);
    }
  };

  const updateTask = (cycleId: string, taskId: string, updatedTask: Partial<Task>) => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (cycle) {
        const updatedCycle = {
          ...cycle,
          tasks: cycle.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t)
        };
        updateCycleDeep(updatedCycle);
    }
  };

  const deleteTask = (cycleId: string, taskId: string) => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (cycle) {
        const updatedCycle = {
          ...cycle,
          tasks: cycle.tasks.filter(t => t.id !== taskId)
        };
        updateCycleDeep(updatedCycle);
    }
  };

  const addHarvest = (harvest: HarvestLog) => {
    const cycle = cycles.find(c => c.id === harvest.cycleId);
    if (cycle) {
        const updatedCycle = { ...cycle, harvests: [...cycle.harvests, harvest] };
        updateCycleDeep(updatedCycle);
    }
  };

  const updateTaskStatus = (cycleId: string, taskId: string, status: 'pending' | 'completed') => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (cycle) {
        const updatedCycle = {
          ...cycle,
          tasks: cycle.tasks.map(t => t.id === taskId ? { ...t, status } : t)
        };
        updateCycleDeep(updatedCycle);
    }
  };

  const addPestReport = async (report: PestReport) => {
    if (isCloudConnected && db) {
        await setDoc(doc(db, "pest_reports", report.id), report);
    } else {
        setPestReports(prev => [...prev, report]);
    }
  };

  const updatePestReport = async (id: string, updatedReport: Partial<PestReport>) => {
      if (isCloudConnected && db) {
          await updateDoc(doc(db, "pest_reports", id), updatedReport);
      } else {
          setPestReports(prev => prev.map(r => r.id === id ? { ...r, ...updatedReport } : r));
      }
  };

  // --- Admin Preset Operations ---

  const addCropPreset = async (preset: CropPreset) => {
      if (isCloudConnected && db) {
          await setDoc(doc(db, "presets_crops", preset.id), preset);
      } else {
          setCropPresets(prev => [...prev, preset]);
      }
  };

  const deleteCropPreset = async (id: string) => {
      if (isCloudConnected && db) {
          await deleteDoc(doc(db, "presets_crops", id));
      } else {
          setCropPresets(prev => prev.filter(p => p.id !== id));
      }
  };

  const addPestPreset = async (pest: Pest) => {
      if (isCloudConnected && db) {
          await setDoc(doc(db, "presets_pests", pest.id), pest);
      } else {
          setPestPresets(prev => [...prev, pest]);
      }
  };

  const deletePestPreset = async (id: string) => {
      if (isCloudConnected && db) {
          await deleteDoc(doc(db, "presets_pests", id));
      } else {
          setPestPresets(prev => prev.filter(p => p.id !== id));
      }
  };


  const getFormattedCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <FarmContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      userProfile,
      fields,
      cycles,
      pestReports,
      cropPresets,
      pestPresets,
      updateUserProfile,
      addField,
      updateField,
      deleteField,
      addCycle,
      updateCycle,
      endCycle,
      addTask,
      updateTask,
      deleteTask,
      addHarvest,
      updateTaskStatus,
      addPestReport,
      updatePestReport,
      addCropPreset,
      deleteCropPreset,
      addPestPreset,
      deletePestPreset,
      getFormattedCurrency,
      isCloudConnected
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within a FarmProvider');
  return context;
};
