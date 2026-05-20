import React, { useState, useEffect } from "react";
import {
  PelayananRecord,
  BerkasRecord,
  ServiceType,
  MenuSection,
  UserSession,
} from "./types";
import {
  INITIAL_MOCK_PELAYANAN,
  INITIAL_MOCK_BERKAS,
} from "./data";

// Subcomponents
import Dashboard from "./components/Dashboard";
import InputData from "./components/InputData";
import ManajemenData from "./components/ManajemenData";
import UploadBerkas from "./components/UploadBerkas";
import CekPengajuan from "./components/CekPengajuan";
import ReportViewer from "./components/ReportViewer";
import RekapCetak from "./components/RekapCetak";
import Persyaratan from "./components/Persyaratan";

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeMenu, setActiveMenu] = useState<MenuSection>("sec-dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form logins state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // DB States backed by localStorage persistent sync
  const [pelayananDB, setPelayananDB] = useState<Record<ServiceType, PelayananRecord[]>>(() => {
    const saved = localStorage.getItem("dukcapil_pelayanan_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse pelayanan DB", e);
      }
    }
    return INITIAL_MOCK_PELAYANAN;
  });

  const [berkasDB, setBerkasDB] = useState<Record<string, BerkasRecord[]>>(() => {
    const saved = localStorage.getItem("dukcapil_berkas_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse berkas DB", e);
      }
    }
    return INITIAL_MOCK_BERKAS;
  });

  // Sync back on state mutations
  useEffect(() => {
    localStorage.setItem("dukcapil_pelayanan_db", JSON.stringify(pelayananDB));
  }, [pelayananDB]);

  useEffect(() => {
    localStorage.setItem("dukcapil_berkas_db", JSON.stringify(berkasDB));
  }, [berkasDB]);

  // Session recovery
  useEffect(() => {
    const savedUser = localStorage.getItem("dukcapil_session");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("dukcapil_session");
      }
    }
  }, []);

  // Handle Logins
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const u = username.toLowerCase().trim();
    const p = password;

    if (u === "bayu" && p === "admin2311") {
      const session: UserSession = { success: true, role: "admin", nama: "Putu Bayu Krisna Jaya" };
      setUser(session);
      localStorage.setItem("dukcapil_session", JSON.stringify(session));
    } else if (u === "user" && p === "user") {
      const session: UserSession = { success: true, role: "user", nama: "Masyarakat" };
      setUser(session);
      localStorage.setItem("dukcapil_session", JSON.stringify(session));
    } else if (u === "admin" && p === "admin") {
      const session: UserSession = { success: true, role: "admin", nama: "Hery Story (Admin)" };
      setUser(session);
      localStorage.setItem("dukcapil_session", JSON.stringify(session));
    } else {
      setLoginError("Username atau password salah sesuai spreadsheet!");
    }
  };

  // Direct login shortcuts to speed up interactive assessment
  const handleShortcutLogin = (role: "admin" | "bayu" | "user") => {
    setLoginError("");
    let session: UserSession;
    if (role === "admin") {
      session = { success: true, role: "admin", nama: "Hery Story (Admin)" };
    } else if (role === "bayu") {
      session = { success: true, role: "admin", nama: "Putu Bayu Krisna Jaya" };
    } else {
      session = { success: true, role: "user", nama: "Masyarakat" };
    }
    setUser(session);
    localStorage.setItem("dukcapil_session", JSON.stringify(session));
    setActiveMenu("sec-dashboard");
  };

  const handleLogout = () => {
    if (window.confirm("Keluar dari sitem UPTD Dukcapil?")) {
      setUser(null);
      localStorage.removeItem("dukcapil_session");
      setUsername("");
      setPassword("");
    }
  };

  // ------------------------------------------
  // DATABASE HANDLERS
  // ------------------------------------------
  const handleSavePelayanan = (
    srv: ServiceType,
    newRecord: Omit<PelayananRecord, "id" | "rowNumber">
  ) => {
    const list = pelayananDB[srv] || [];
    const nextId = String(list.length > 0 ? Math.max(...list.map(r => parseInt(r.id) || 0)) + 1 : 1);
    const rowNumber = list.length + 2;

    const fullRecord: PelayananRecord = {
      ...newRecord,
      id: nextId,
      rowNumber
    };

    setPelayananDB((prev) => ({
      ...prev,
      [srv]: [...list, fullRecord]
    }));
  };

  const handleDeletePelayanan = (srv: ServiceType, rowNum: number) => {
    const list = pelayananDB[srv] || [];
    const filtered = list.filter(r => r.rowNumber !== rowNum);
    
    // Re-index rowNumber sequentially to preserve layout
    const reindexed = filtered.map((r, i) => ({
      ...r,
      rowNumber: i + 2
    }));

    setPelayananDB((prev) => ({
      ...prev,
      [srv]: reindexed
    }));
  };

  const handleUpdatePelayanan = (
    srv: ServiceType,
    rowNum: number,
    updated: Omit<PelayananRecord, "id" | "rowNumber">
  ) => {
    const list = pelayananDB[srv] || [];
    const updatedList = list.map((r) => {
      if (r.rowNumber === rowNum) {
        return {
          ...r,
          ...updated
        };
      }
      return r;
    });

    setPelayananDB((prev) => ({
      ...prev,
      [srv]: updatedList
    }));
  };

  const handleUploadBerkas = (
    cat: string,
    fileRec: Omit<BerkasRecord, "id" | "rowNumber">
  ) => {
    const list = berkasDB[cat] || [];
    const nextId = String(list.length + 1);
    const rowNumber = list.length + 1;

    const fullRecord: BerkasRecord = {
      ...fileRec,
      id: nextId,
      rowNumber,
      category: fileRec.category
    };

    setBerkasDB((prev) => ({
      ...prev,
      [cat]: [...list, fullRecord]
    }));
  };

  const handleDeleteBerkas = (cat: string, rowNum: number) => {
    const list = berkasDB[cat] || [];
    const filtered = list.filter(r => r.rowNumber !== rowNum);
    const reindexed = filtered.map((r, i) => ({
      ...r,
      rowNumber: i + 1
    }));

    setBerkasDB((prev) => ({
      ...prev,
      [cat]: reindexed
    }));
  };

  const triggerRefreshDashboard = () => {
    alert("🔄 Sinkronisasi dan pembaruan visual dashboard berhasil diselesaikan!");
  };

  // Reusable sub-menu logic (Laporan dropdown state)
  const [isLaporanOpen, setIsLaporanOpen] = useState(true);

  // If user session is empty, render beautiful slate login
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 select-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black">
        {/* Animated Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/25 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 bg-white/10 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl w-full max-w-[420px] border border-white/10">
          <div className="text-center mb-6">
            <div className="inline-block p-4 rounded-2xl bg-white/10 shadow-sm border border-white/10 mb-4 animate-bounce">
              <span className="text-4xl">🏛️</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              UPTD Dukcapil
            </h1>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest leading-none">
              Kecamatan Makarti Jaya
            </p>
            <p className="text-amber-400 text-[10px] font-extrabold uppercase tracking-wide mt-2">
              Kabupaten Banyuasin
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-blue-300/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all focus:border-transparent"
                required
                placeholder="Petugas loket / admin"
              />
            </div>
            <div>
              <label className="block text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-blue-300/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all focus:border-transparent"
                required
                placeholder="Sandi keamanan"
              />
            </div>

            {loginError && (
              <p className="text-rose-400 text-xs font-semibold text-center mt-1">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-400 transition-all cursor-pointer mt-4"
            >
              Masuk Sistem Pelayanan →
            </button>
          </form>

          {/* Quick Shortcuts Selector */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-3">
              Pintasan Akun Penguji
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleShortcutLogin("admin")}
                className="bg-white/5 hover:bg-white/10 text-blue-300 text-[10px] py-2 px-1 rounded-lg border border-white/10 font-bold transition-all cursor-pointer"
              >
                🦸 Admin
              </button>
              <button
                type="button"
                onClick={() => handleShortcutLogin("bayu")}
                className="bg-white/5 hover:bg-white/10 text-amber-300 text-[10px] py-2 px-1 rounded-lg border border-white/10 font-bold transition-all cursor-pointer"
              >
                👨 Bayu
              </button>
              <button
                type="button"
                onClick={() => handleShortcutLogin("user")}
                className="bg-white/5 hover:bg-white/10 text-emerald-300 text-[10px] py-2 px-1 rounded-lg border border-white/10 font-bold transition-all cursor-pointer"
              >
                👥 Loket
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-semibold">
              *Klik pintasan di atas untuk login cepat tanpa mengisi form!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active view dispatcher
  const renderActiveSection = () => {
    switch (activeMenu) {
      case "sec-dashboard":
        return <Dashboard pelayananDB={pelayananDB} onRefresh={triggerRefreshDashboard} />;
      case "sec-input":
        return <InputData onSave={handleSavePelayanan} pelayananDB={pelayananDB} />;
      case "sec-manage":
        return (
          <ManajemenData
            pelayananDB={pelayananDB}
            onDelete={handleDeletePelayanan}
            onUpdate={handleUpdatePelayanan}
          />
        );
      case "sec-berkas":
        return (
          <UploadBerkas
            berkasDB={berkasDB}
            onUpload={handleUploadBerkas}
            onDeleteBerkas={handleDeleteBerkas}
            userRole={user.role}
          />
        );
      case "sec-cek-pengajuan":
        return <CekPengajuan berkasDB={berkasDB} />;
      case "sec-live-sheet":
        return (
          <div id="sec-live-sheet" className="animate-fade-in relative z-10 flex flex-col h-[calc(100vh_-_120px)]">
            <div className="mb-4 shrink-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                Live Spreadsheet Laporan
              </h2>
              <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
                Tampilan real-time dan log sinkronisasi terpadu dari sistem Google Spreadsheet pusat.
              </p>
            </div>
            <div className="bg-white rounded-[1.5rem] overflow-hidden flex-1 shadow-sm border border-slate-150 p-2 relative">
              <iframe
                title="Spreadsheet"
                src="https://docs.google.com/spreadsheets/d/1_xL-i0D93irkqL8BO9TNrEIv4s8qCF6WPzWzalUJWic/edit?gid=1529160476&rm=minimal#gid=1529160476"
                className="absolute inset-x-2 inset-y-2 w-[calc(100%_-_16px)] h-[calc(100%_-_16px)] border-0 rounded-xl"
                allowFullScreen
              />
            </div>
          </div>
        );
      case "sec-laporan-harian":
      case "sec-recap-skp":
      case "sec-laporan-perekaman":
      case "sec-view-laporan-sheet":
        return <ReportViewer activeSection={activeMenu} pelayananDB={pelayananDB} />;
      case "sec-recap":
        return <RekapCetak pelayananDB={pelayananDB} />;
      case "sec-persyaratan":
        return <Persyaratan />;
      default:
        return <Dashboard pelayananDB={pelayananDB} onRefresh={triggerRefreshDashboard} />;
    }
  };

  return (
    <div id="view-app" className="flex h-screen overflow-hidden bg-slate-50 relative selection:bg-blue-200">
      
      {/* Mobile Sidebar overlay backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* LEFT SIDEBAR PANEL */}
      <aside
        className={`w-72 bg-slate-950 flex flex-col shadow-2xl z-50 transition-transform duration-300 absolute md:relative h-full ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 border-r border-slate-800 shrink-0 font-sans`}
      >
        {/* Top brand header */}
        <div className="p-6 flex items-center gap-4 border-b border-slate-900 relative">
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center justify-center text-xl">
            🏛️
          </div>
          <div>
            <h2 className="font-black text-lg text-white leading-none tracking-tight">
              UPTD Dukcapil
            </h2>
            <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest mt-1">
              Kec. Makarti Jaya
            </p>
          </div>
        </div>

        {/* Sidebar menu levels */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Dashboard menu */}
          <button
            onClick={() => {
              setActiveMenu("sec-dashboard");
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
              activeMenu === "sec-dashboard"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            📊 Dashboard
          </button>

          {/* Admin features */}
          {user.role === "admin" && (
            <>
              <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest px-4 pt-4 pb-2">
                Operator Panel
              </span>
              <button
                onClick={() => {
                  setActiveMenu("sec-input");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
                  activeMenu === "sec-input"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                ✏️ Registrasi Data
              </button>
              <button
                onClick={() => {
                  setActiveMenu("sec-manage");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
                  activeMenu === "sec-manage"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                🗄️ Manajemen Data
              </button>
              <button
                onClick={() => {
                  setActiveMenu("sec-berkas");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
                  activeMenu === "sec-berkas"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                ☁️ Upload Berkas
              </button>
            </>
          )}

          {/* Collapsible Dropdown Laporan - structured beautifully */}
          <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest px-4 pt-4 pb-1">
            Data Outputs
          </span>
          <div>
            <button
              onClick={() => setIsLaporanOpen(!isLaporanOpen)}
              className="w-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-slate-400 hover:bg-white/5 hover:text-white transition-colors tracking-wide"
            >
              <span>📁 Laporan Matriks</span>
              <span className="text-[10px]">{isLaporanOpen ? "▲" : "▼"}</span>
            </button>

            {isLaporanOpen && (
              <div className="mt-1 pl-3 space-y-1 border-l border-slate-900 ml-5">
                <button
                  onClick={() => {
                    setActiveMenu("sec-laporan-harian");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMenu === "sec-laporan-harian"
                      ? "bg-white/10 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  📄 Laporan Harian
                </button>
                <button
                  onClick={() => {
                    setActiveMenu("sec-recap-skp");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMenu === "sec-recap-skp"
                      ? "bg-white/10 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  📅 Laporan Bulan SKP
                </button>
                <button
                  onClick={() => {
                    setActiveMenu("sec-laporan-perekaman");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMenu === "sec-laporan-perekaman"
                      ? "bg-white/10 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  🪪 Laporan Perekaman
                </button>
                <button
                  onClick={() => {
                    setActiveMenu("sec-view-laporan-sheet");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMenu === "sec-view-laporan-sheet"
                      ? "bg-white/10 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  🟢 Live View Matriks
                </button>
                {user.role === "admin" && (
                  <button
                    onClick={() => {
                      setActiveMenu("sec-recap");
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left block px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      activeMenu === "sec-recap"
                        ? "bg-white/10 text-white font-bold"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    📈 Rekap Tahunan/Periodik
                  </button>
                )}
              </div>
            )}
          </div>

          <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest px-4 pt-4 pb-2">
            Public Services
          </span>
          <button
            onClick={() => {
              setActiveMenu("sec-cek-pengajuan");
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
              activeMenu === "sec-cek-pengajuan"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            🔍 Cek Pengajuan
          </button>
          <button
            onClick={() => {
              setActiveMenu("sec-persyaratan");
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
              activeMenu === "sec-persyaratan"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            📋 Persyaratan Berkas
          </button>
          <button
            onClick={() => {
              setActiveMenu("sec-live-sheet");
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
              activeMenu === "sec-live-sheet"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            📊 Live Spreadsheet
          </button>
        </nav>

        {/* Logged in agent panel footer card */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80">
          <div className="flex items-center gap-3.5 bg-white/5 border border-white/5 p-3 rounded-2xl relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 font-extrabold text-slate-950 flex items-center justify-center text-sm shadow-md">
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-100 truncate">{user.nama}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                {user.role === "admin" ? "Sistem Administrator" : "Petugas Loket / Tamu"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 mt-3.5 transition-all border border-rose-500/10 cursor-pointer"
          >
            🚪 Keluar Sesi Pelayanan
          </button>
        </div>
      </aside>

      {/* MASTER CONTENT WORKFLOW CANVAS */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
        {/* Mini header view for smaller viewport controls (Mobile toggle) - hidden in printing */}
        <header className="h-16 flex items-center px-4 md:hidden shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 justify-between print:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 focus:outline-none p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ☰
            </button>
            <div className="ml-3 flex items-center">
              <span className="text-xl">🏛️</span>
              <h1 className="font-extrabold text-slate-800 text-base ml-2">
                UPTD Dukcapil
              </h1>
            </div>
          </div>
          <div className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-bold">
            {user.role === "admin" ? "Admin" : "Loket"}
          </div>
        </header>

        {/* Scrollable workspace - handle prints safely on media selectors */}
        <div
          id="mainScrollArea"
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative scroll-smooth print:overflow-visible print:p-0 print:m-0"
        >
          {/* Subtle background ambient details */}
          <div className="absolute top-10 right-10 w-80 h-80 bg-blue-300/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Master views rendering */}
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}
