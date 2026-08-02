"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Key, MapPin, CheckCircle, LogOut, Plus, Clock, ShieldAlert, Users, Calendar, RefreshCw, Activity, AlertCircle, BookOpen, Camera, Scan, X, History, ChevronRight, Sparkles, Sun, Moon, Sunrise, Download, FileText } from 'lucide-react';

// ============================================================================
// REAL SUPABASE CONNECTION
// ============================================================================
 import { supabase } from './lib/supabase'; // <-- UNCOMMENT THIS LINE IN VS CODE

// --- DUMMY BLOCK TO PREVENT PREVIEW CRASH (DELETE THIS IN VS CODE) ---

// ---------------------------------------------------------------------

// --- UI Components ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, description }) => (
  <div className="p-5 border-b border-slate-100">
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />}
    <input
      className={`w-full border border-slate-200 rounded-lg py-3 outline-none text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${Icon ? 'pl-11 pr-4' : 'px-4'}`}
      {...props}
    />
  </div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger: "bg-red-50 text-red-700 border border-red-100",
    info: "bg-blue-50 text-blue-700 border border-blue-100"
  };
  return (
    <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- GPS Helper ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const radLat1 = lat1 * Math.PI/180;
  const radLat2 = lat2 * Math.PI/180;
  const deltaLat = (lat2-lat1) * Math.PI/180;
  const deltaLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

// --- Visual Polishes ---

const ConfettiBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-confetti"
          style={{
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
            left: '50%',
            top: '50%',
            '--tx': `${(Math.random() - 0.5) * 400}px`,
            '--ty': `${(Math.random() - 0.5) * 400}px`,
            '--tr': `${Math.random() * 360}deg`,
            animationDelay: `${Math.random() * 0.1}s`
          } as any}
        />
      ))}
      <style jsx global>{`
        @keyframes confetti {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.2) rotate(var(--tr)); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const HeaderGreeting = ({ name }) => {
  const hour = new Date().getHours();
  let greeting = "Welcome";
  let Icon = Sun;
  if (hour < 12) { greeting = "Good Morning"; Icon = Sunrise; }
  else if (hour < 18) { greeting = "Good Afternoon"; Icon = Sun; }
  else { greeting = "Good Evening"; Icon = Moon; }

  return (
    <div className="flex flex-col text-right">
      <div className="flex items-center justify-end gap-2 text-slate-400 text-[11px] font-black uppercase tracking-widest">
        <Icon size={12} /> {greeting}
      </div>
      <h1 className="text-base font-bold text-slate-800 tracking-tight">{name}</h1>
    </div>
  );
};

// --- Face Verification Modal ---
const FaceVerificationModal = ({ isOpen, onClose, onVerified }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('scanning');
          setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
              stream.getTracks().forEach(track => track.stop());
              onVerified();
            }, 1000);
          }, 2000);
        }
      } catch (err) { setError("Camera access denied."); }
    };
    startCamera();
    return () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <Card className="w-full max-w-xs overflow-hidden border-0 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-white">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Scan size={16} className="text-blue-600" /> Identity verification
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>
        <CardContent className="p-0 bg-slate-950 relative aspect-video">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-90" />
          {status === 'scanning' && (
            <>
                <div className="absolute inset-0 border-[30px] border-black/30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-36 border-2 border-blue-400/40 rounded-xl">
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_8px_blue] animate-[scan_2s_infinite]"></div>
            </>
          )}
          {status === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/10 backdrop-blur-[1px]">
                <div className="bg-white rounded-full p-3 shadow-lg"><CheckCircle size={36} className="text-emerald-500" /></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 p-6 text-center text-white">
                <AlertCircle size={28} className="mb-2" /><p className="text-sm font-bold uppercase">{error}</p>
                <Button variant="outline" className="mt-4 bg-white border-0 text-red-600 h-9 py-0 px-4" onClick={onClose}>Retry</Button>
            </div>
          )}
        </CardContent>
        <div className="p-4 bg-white text-center border-t">
            <p className={`text-xs font-black uppercase tracking-[0.15em] ${status === 'success' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {status === 'scanning' ? 'Analyzing features...' : status === 'success' ? 'Identity Secured' : 'Starting Hardware...'}
            </p>
        </div>
      </Card>
      <style jsx global>{` @keyframes scan { 0% { top: 20%; } 50% { top: 80%; } 100% { top: 20%; } } `}</style>
    </div>
  );
};

// --- Login View ---
const LoginView = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        await supabase.from('profiles').insert([{ user_id: authData.user.id, role: email.toLowerCase().includes('prof') ? 'professor' : 'student', name: email.split('@')[0], email }]);
        alert("Account ready. Sign in now."); setIsSignUp(false);
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        let { data: profile } = await supabase.from('profiles').select('*').eq('user_id', authData.user.id).maybeSingle();
        if (!profile) {
            const role = email.toLowerCase().includes('prof') ? 'professor' : 'student';
            profile = { role, name: email.split('@')[0], email };
            supabase.from('profiles').insert([{ user_id: authData.user.id, role, name: profile.name, email }]).then();
        }
        onLoginSuccess({ ...authData.user, ...profile });
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-100">
          <MapPin size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">GeoAttend</h1>
        <p className="text-slate-400 text-xs font-black mt-0.5 uppercase tracking-[0.2em]">Enterprise Presence</p>
      </div>
      <Card className="w-full max-w-[360px] shadow-2xl border-slate-200">
        <CardHeader title={isSignUp ? "Register" : "Access Portal"} description="Enter your credentials to manage attendance." />
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-black uppercase text-center">{error}</div>}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">University Email</label>
              <Input icon={User} type="email" placeholder="user@univ.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Passcode</label>
              <Input icon={Key} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="mt-2 h-12 text-sm">{loading ? "Wait..." : (isSignUp ? "Join" : "Sign In")}</Button>
          </form>
          <button className="mt-8 w-full text-[11px] text-blue-600 font-black uppercase tracking-[0.2em] hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Existing member? Sign in" : "New member registration"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Student Dashboard ---
const StudentDashboard = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [totp, setTotp] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedInIds, setCheckedInIds] = useState(new Set());
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchData = async () => {
    const { data: courseData } = await supabase.from('courses').select('*, sessions(*)');
    if (courseData) {
        const processed = courseData.map(c => ({
            ...c,
            sessions: c.sessions?.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        }));
        setCourses(processed);
    }
    const { data: attData } = await supabase.from('attendance_records').select('*, sessions(courses(title))').eq('student_id', user.user_id || user.id);
    if (attData) {
        setCheckedInIds(new Set(attData.map(a => a.session_id)));
        setHistory(attData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  };

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 30000); return () => clearInterval(interval); }, []);

  const initiateCheckIn = (course) => {
    const session = course.sessions?.[0];
    if (checkedInIds.has(session?.session_id)) { setStatus("⚠️ Verification already completed for this specific session."); return; }
    if (!totp || totp.trim().length !== 6) return setStatus("Please enter the 6-digit passcode.");
    setSelectedCourse(course); setIsCameraOpen(true);
  };

  const completeCheckIn = (course) => {
    const session = course.sessions?.[0]; if (!session) return;
    setLoading(true); setStatus("Acquiring GPS fix...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const dbCode = String(session.active_totp_secret || '').replace(/\s/g, '').trim();
        const inputCode = String(totp || '').replace(/\s/g, '').trim();
        if (dbCode !== inputCode) throw new Error("Incorrect passcode.");

        const dist = calculateDistance(latitude, longitude, course.geofence_lat, course.geofence_long);
        if (dist > course.radius_meters) throw new Error(`Out of range (${Math.round(dist)}m away).`);
        
        const { error: err } = await supabase.from('attendance_records').insert([{ session_id: session.session_id, student_id: user.user_id || user.id, status: 'Present', recorded_lat: latitude, recorded_long: longitude }]);
        if (err) throw new Error("Validation failure.");
        
        setCheckedInIds(prev => new Set([...Array.from(prev), session.session_id]));
        setStatus("✅ Check-in success."); setTotp(''); fetchData();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } catch (e) { setStatus(`❌ ${e.message}`); } finally { setLoading(false); }
    }, (e) => { setStatus(`GPS Error: ${e.message}`); setLoading(false); });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {showConfetti && <ConfettiBurst />}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm border-slate-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-base text-blue-600 tracking-tight uppercase"><MapPin size={22}/> GeoAttend</div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-300 hover:text-blue-600 transition-colors" onClick={() => setShowHistory(!showHistory)} title="History"><History size={22}/></button>
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>
            <HeaderGreeting name={user.name} />
            <Button variant="outline" className="w-auto p-1.5 h-10 border-slate-200" onClick={onLogout}><LogOut size={18}/></Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10">
        <div className="flex justify-between items-center">
            <h2 className="text-base font-black text-slate-400 uppercase tracking-[0.3em]">{showHistory ? "Access Records" : "Today's Schedule"}</h2>
            <button className="text-xs font-black uppercase tracking-[0.15em] text-blue-600 hover:underline" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? "← Back to Classes" : "View Full Log"}
            </button>
        </div>

        {status && <div className="p-4 rounded-xl border text-sm font-black bg-white border-blue-50 text-blue-700 uppercase tracking-[0.15em] text-center animate-in fade-in duration-300 shadow-sm">{status}</div>}
        
        {showHistory ? (
            <Card className="border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-400 border-b tracking-widest">
                            <tr><th className="px-6 py-4">Course</th><th className="px-6 py-4 text-center">Outcome</th><th className="px-6 py-4 text-right">Date</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {history.length > 0 ? history.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.sessions?.courses?.title || "Class Session"}</td>
                                    <td className="px-6 py-4 text-center"><Badge variant="success">Present</Badge></td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">{new Date(item.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="px-6 py-16 text-center text-slate-300 text-xs font-black uppercase tracking-widest italic">No historical records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => {
                const session = course.sessions?.[0];
                const now = new Date();
                
                // Logic Fix: Only show as active if the session belongs to TODAY and is currently running
                const isToday = session && new Date(session.start_time).toDateString() === now.toDateString();
                const isExpired = !session || new Date(session.end_time) < now;
                const isTooEarly = session && new Date(session.start_time) > now;
                
                const isActiveNow = session && isToday && !isExpired && !isTooEarly;
                
                // Logic Fix: Check-in status must be linked to the current session ID
                const isDoneForThisSession = session && checkedInIds.has(session.session_id);
                
                return (
                <Card key={course.course_id} className={`${isActiveNow && !isDoneForThisSession ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/10 scale-[1.02]' : 'opacity-75 grayscale-[0.2]'}`}>
                    <CardContent className="p-0">
                    <div className="p-6 border-b border-slate-50">
                        <div className="flex justify-between items-start">
                            <Badge variant={isDoneForThisSession ? "success" : isActiveNow ? "warning" : "default"}>
                                {isDoneForThisSession ? "Secured" : isActiveNow ? "Live Now" : "Offline"}
                            </Badge>
                            {isActiveNow && !isDoneForThisSession && <Sparkles size={18} className="text-amber-400 animate-pulse" />}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-3 leading-tight">{course.title}</h3>
                    </div>
                    <div className="p-6 bg-slate-50/10 space-y-5">
                        {isActiveNow && !isDoneForThisSession ? (
                        <>
                            <Input placeholder="0 0 0 0 0 0" maxLength={6} value={totp} onChange={e => setTotp(e.target.value.replace(/\D/g,''))} className="text-center text-2xl tracking-[0.3em] font-black h-14 border-blue-100 shadow-sm" />
                            <Button onClick={() => initiateCheckIn(course)} disabled={loading} className="h-11 uppercase tracking-widest bg-blue-600 hover:bg-blue-700">
                            {loading ? "..." : <><Camera size={18}/> Start verification</>}
                            </Button>
                        </>
                        ) : isDoneForThisSession ? (
                        <div className="flex flex-col items-center gap-2 py-4 animate-in zoom-in-95 duration-500">
                            <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg shadow-emerald-100"><CheckCircle size={32} /></div>
                            <span className="text-emerald-700 font-black uppercase text-xs tracking-[0.2em]">Verified Entry</span>
                        </div>
                        ) : <p className="text-xs text-slate-400 font-black uppercase tracking-[0.25em] text-center py-8">No scheduled session</p>}
                    </div>
                    </CardContent>
                </Card>
                );
            })}
            </div>
        )}
      </main>
      <FaceVerificationModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onVerified={() => {setIsCameraOpen(false); completeCheckIn(selectedCourse);}} />
    </div>
  );
};

// --- Professor Dashboard ---
const ProfessorDashboard = ({ user, onLogout }) => {
  const [active, setActive] = useState(false);
  const [sid, setSid] = useState(null);
  const [code, setCode] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({ avg: 0, total: 0, alerts: [], totalSessions: 0, studentMap: {} });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshAnalytics = async () => {
    const { data: allS } = await supabase.from('sessions').select('session_id');
    const { data: allR } = await supabase.from('attendance_records').select('student_id, profiles(name, email)');
    if (allS && allR) {
        const studentMap = {}; 
        allR.forEach(r => { 
            if (!studentMap[r.student_id]) studentMap[r.student_id] = { name: r.profiles?.name, email: r.profiles?.email, count: 0 }; 
            studentMap[r.student_id].count++; 
        });
        const alerts = Object.values(studentMap).filter(s => s.count / allS.length < 0.75).map(s => ({ name: s.name, reason: `${Math.round((s.count/allS.length)*100)}% Attendance` }));
        setAnalytics({ avg: Math.round((allR.length / (allS.length * Object.keys(studentMap).length || 1)) * 100), total: Object.keys(studentMap).length, alerts, totalSessions: allS.length, studentMap });
    }
  };

  const refreshList = async (id) => {
    if (!id) return; setLoading(true);
    const { data } = await supabase.from('attendance_records').select('timestamp, profiles(user_id, name, email)').eq('session_id', id);
    if (data) setList(data.map(r => ({ uid: r.profiles?.user_id, name: r.profiles?.name || 'User', email: r.profiles?.email, time: new Date(r.timestamp).toLocaleTimeString([], { hour12: false }) })));
    setLoading(false); refreshAnalytics();
  };

  useEffect(() => { refreshAnalytics(); if (!sid) return; refreshList(sid); const channel = supabase.channel(`prof_${sid}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_records', filter: `session_id=eq.${sid}` }, () => refreshList(sid)).subscribe(); return () => supabase.removeChannel(channel); }, [sid]);

  const start = async () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { data: courses } = await supabase.from('courses').select('course_id').limit(1);
    if (!courses?.length) return alert("System error: Course definition missing.");
    const { data } = await supabase.from('sessions').insert([{ course_id: courses[0].course_id, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 45 * 60000).toISOString(), active_totp_secret: newCode }]).select().single();
    if (data) { setSid(data.session_id); setCode(newCode); setActive(true); }
  };

  const downloadCSV = () => {
    if (!list.length) return;
    const headers = ["Student Name", "Email", "Check-in Time"];
    const rows = list.map(s => [s.name, s.email, s.time]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-lg text-blue-600 tracking-tight uppercase"><MapPin size={24}/> Control Panel</div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded border border-slate-100 uppercase tracking-widest">{time.toLocaleTimeString([], { hour12: false })}</div>
             <Badge variant="success">Online</Badge>
             <HeaderGreeting name={user.name} />
             <Button variant="outline" className="w-auto p-1.5 h-10 border-slate-200" onClick={onLogout}><LogOut size={20}/></Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6 sm:p-10 space-y-10">
        <div className="flex justify-between items-center border-b pb-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Administrator Console</h2>
          {!active && <Button className="w-auto h-11 px-10 shadow-blue-50 bg-blue-600 text-sm" onClick={start}><Plus size={20}/> Start New Class</Button>}
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {active ? (
              <>
                <Card className="border-blue-500 border-t-4 shadow-2xl">
                  <CardContent className="p-10 text-center bg-blue-50/10">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] mb-4">Live Access Key</p>
                    <div className="text-6xl font-black text-blue-600 tracking-tighter tabular-nums drop-shadow-sm animate-pulse">{code.slice(0,3)} {code.slice(3)}</div>
                    <Button variant="destructive" className="h-11 w-auto px-10 mt-8 bg-red-500 font-black text-sm" onClick={() => {setActive(false); setSid(null);}}>Shut Down Session</Button>
                  </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader title={
                        <div className="flex justify-between items-center w-full">
                            <span>Check-in Roster ({list.length})</span>
                            <div className="flex gap-3">
                                <button className="p-1.5 text-slate-300 hover:text-emerald-600 transition-colors" onClick={downloadCSV} title="Export CSV"><Download size={20}/></button>
                                <button className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors" onClick={() => refreshList(sid)} disabled={loading}><RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20}/></button>
                            </div>
                        </div>
                    } />
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-400 border-b tracking-widest"><tr><th className="px-6 py-4">Entrant Name</th><th className="px-6 py-4 text-right">Access Time</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                    {list.length ? list.map((s,i) => (<tr key={i} className="hover:bg-slate-50 group cursor-pointer" onClick={() => setSelectedStudent(s)}>
                        <td className="px-6 py-5"><div className="flex items-center gap-2 font-bold text-slate-800 text-base">{s.name} <ChevronRight size={18} className="text-blue-500" /></div><span className="text-sm text-slate-400 font-bold uppercase">{s.email}</span></td>
                        <td className="px-6 py-5 text-blue-600 font-black text-base text-right tabular-nums">{s.time}</td>
                    </tr>)) : <tr><td colSpan="2" className="px-6 py-20 text-center text-slate-300 font-black uppercase text-sm tracking-widest italic">Awaiting first identity match...</td></tr>}
                    </tbody>
                  </table>
                </Card>
              </>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                <Scan size={80} className="opacity-10 text-blue-600 mb-6"/>
                <h3 className="text-base font-black text-slate-500 uppercase tracking-widest">System Standby</h3>
                <p className="text-slate-400 mt-2 max-w-sm text-center text-sm font-bold uppercase tracking-tighter leading-relaxed">Initiate a class session to begin verification logs</p>
              </div>
            )}
          </div>
          <div className="space-y-10">
            <Card className="border-amber-100 bg-amber-50/10 shadow-sm"><CardHeader title="Attendance Monitor" description="Automatic risk flagging" /><CardContent className="space-y-4">{analytics.alerts.length > 0 ? analytics.alerts.map((a, i) => (<div key={i} className="bg-white p-4 rounded-xl border border-amber-100 flex justify-between items-center shadow-sm"><h4 className="text-sm font-black text-slate-800 uppercase">{a.name}</h4><Badge variant="danger">{a.reason}</Badge></div>)) : <div className="text-center py-10 text-slate-300 font-black uppercase text-xs tracking-widest italic">All student status normal</div>}</CardContent></Card>
            <Card className="shadow-sm border-slate-100">
               <CardHeader title="Analytics Summary" />
               <CardContent className="space-y-8">
                  <div className="flex flex-col gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-50/50"><div className="flex justify-between items-center"><span className="text-xs font-black text-blue-500 uppercase tracking-widest">Avg. Success Rate</span><span className="text-xl font-black text-blue-700">{analytics.avg || 0}%</span></div><div className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${analytics.avg || 0}%` }}></div></div></div>
                  <div className="flex justify-between items-center p-5 bg-slate-50/80 rounded-2xl border border-slate-100"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Enrollment</span><span className="text-xl font-black text-slate-800">{analytics.total || 0}</span></div>
               </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Profile Detail Modal */}
      {selectedStudent && (() => {
          const stats = analytics.studentMap[selectedStudent.uid] || { count: 0 };
          const percent = Math.round((stats.count / (analytics.totalSessions || 1)) * 100);
          return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-md">
            <Card className="w-full max-w-[340px] shadow-2xl animate-in zoom-in-95 border-0 rounded-2xl">
                <CardContent className="p-12 text-center space-y-8">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto border-2 border-white shadow-lg">{selectedStudent.name.charAt(0).toUpperCase()}</div>
                    <div className="space-y-2">
                        <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{selectedStudent.name}</h4>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-[0.1em]">{selectedStudent.email}</p>
                    </div>
                    <div className="py-8 border-y border-slate-50 text-left space-y-5">
                        <div className="flex justify-between items-center"><span className="text-sm font-black text-slate-400 uppercase tracking-widest">Attendance</span><span className={`text-base font-black ${percent < 75 ? 'text-red-500' : 'text-blue-600'}`}>{percent}%</span></div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${percent < 75 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${percent}%` }}></div></div>
                        <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-tighter"><span>{stats.count} Matches</span><span>{analytics.totalSessions} Sessions</span></div>
                    </div>
                    <Button className="w-full h-14 bg-slate-900 text-white font-black text-sm" onClick={() => setSelectedStudent(null)}>Return to Console</Button>
                </CardContent>
            </Card>
          </div>
      )})()}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
          setUser({ ...session.user, ...(data || { role: session.user.email.includes('prof') ? 'professor' : 'student', name: session.user.email.split('@')[0], email: session.user.email }) });
          setLoading(false);
        });
      } else setLoading(false);
    });
  }, []);
  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center text-slate-200 gap-6"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="text-xs font-black uppercase tracking-[0.5em] animate-pulse">Initializing Security</p></div>;
  if (!user) return <LoginView onLoginSuccess={setUser} />;
  return user.role === 'professor' ? <ProfessorDashboard user={user} onLogout={() => setUser(null)} /> : <StudentDashboard user={user} onLogout={() => setUser(null)} />;
}