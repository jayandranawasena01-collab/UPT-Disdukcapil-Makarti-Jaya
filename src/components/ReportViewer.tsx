import { useState, useMemo } from "react";
import { ServiceType, PelayananRecord } from "../types";
import { SERVICE_LABELS } from "../data";

interface ReportViewerProps {
  activeSection: "sec-laporan-harian" | "sec-recap-skp" | "sec-laporan-perekaman" | "sec-view-laporan-sheet";
  pelayananDB: Record<ServiceType, PelayananRecord[]>;
}

export default function ReportViewer({ activeSection, pelayananDB }: ReportViewerProps) {
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  // Local dates state controls
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonthSKP, setSelectedMonthSKP] = useState(currentMonthStr);
  const [selectedMonthRekam, setSelectedMonthRekam] = useState(currentMonthStr);
  const [selectedMonthSheet, setSelectedMonthSheet] = useState(currentMonthStr);

  // Government officials values
  const [pejabatNama] = useState("PUTU BAYU KRISNA JAYA, S.Pd");
  const [pejabatNIP] = useState("");

  // Indonesian translation helpers
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // ==========================================
  // SECTION 1: LAPORAN HARIAN CALCULATION
  // ==========================================
  const harianCounts = useMemo(() => {
    const counts: Record<ServiceType, number> = {
      "Penerbitan KK": 0,
      "SKP WNI": 0,
      "Penerbitan Akta Kelahiran": 0,
      "Penerbitan Akta Kematian": 0,
      "Penerbitan Akta Perkawinan": 0,
      "Rekam KTP-EL": 0,
      "Aktivasi IKD": 0,
    };

    (Object.keys(pelayananDB) as ServiceType[]).forEach((srv) => {
      const records = pelayananDB[srv] || [];
      counts[srv] = records.filter(r => r.tanggal === selectedDate).length;
    });

    return counts;
  }, [pelayananDB, selectedDate]);

  const displaySelectedDateIndo = useMemo(() => {
    const parseDate = new Date(selectedDate);
    if (isNaN(parseDate.getTime())) return "...";
    return `${dayNames[parseDate.getDay()]}, ${parseDate.getDate()} ${monthNames[parseDate.getMonth()]} ${parseDate.getFullYear()}`;
  }, [selectedDate]);

  // ==========================================
  // SECTION 2: LAPORAN BULAN SKP
  // ==========================================
  const skpMonthlyData = useMemo(() => {
    const [year, month] = selectedMonthSKP.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const recordsKK = pelayananDB["Penerbitan KK"] || [];
    const recordsSKP = pelayananDB["SKP WNI"] || [];

    const daysRows: {
      dayNo: number;
      dayName: string;
      dateLabel: string;
      countKK: number;
      countSKP: number;
    }[] = [];

    let totalKK = 0;
    let totalSKP = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const isoDateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const countKK = recordsKK.filter(r => r.tanggal === isoDateStr).length;
      const countSKP = recordsSKP.filter(r => r.tanggal === isoDateStr).length;

      totalKK += countKK;
      totalSKP += countSKP;

      daysRows.push({
        dayNo: day,
        dayName: dayNames[currentDate.getDay()],
        dateLabel: `${String(day).padStart(2, "0")} ${monthNames[month - 1]} ${year}`,
        countKK,
        countSKP
      });
    }

    return { rows: daysRows, totalKK, totalSKP, monthLabel: `${monthNames[month - 1]} ${year}` };
  }, [pelayananDB, selectedMonthSKP]);

  // ==========================================
  // SECTION 3: LAPORAN PEREKAMAN (KTP-EL)
  // ==========================================
  const rekamMonthlyData = useMemo(() => {
    const [year, month] = selectedMonthRekam.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const recordsRekam = pelayananDB["Rekam KTP-EL"] || [];

    const counts: number[] = [];
    let total = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const isoDateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const count = recordsRekam.filter(r => r.tanggal === isoDateStr).length;
      counts.push(count);
      total += count;
    }

    return { counts, total, daysInMonth, monthLabel: `${monthNames[month - 1]} ${year}` };
  }, [pelayananDB, selectedMonthRekam]);

  // ==========================================
  // SECTION 4: LIVE DATA SHEET RECORD
  // ==========================================
  const sheetMonthlyData = useMemo(() => {
    const [year, month] = selectedMonthSheet.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const recordsKK = pelayananDB["Penerbitan KK"] || [];
    const recordsSKP = pelayananDB["SKP WNI"] || [];

    const daysRows: {
      dayNo: number;
      dayName: string;
      dateLabel: string;
      countKK: number;
      countSKP: number;
    }[] = [];

    let totalKK = 0;
    let totalSKP = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const isoDateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const countKK = recordsKK.filter(r => r.tanggal === isoDateStr).length;
      const countSKP = recordsSKP.filter(r => r.tanggal === isoDateStr).length;

      totalKK += countKK;
      totalSKP += countSKP;

      daysRows.push({
        dayNo: day,
        dayName: dayNames[currentDate.getDay()],
        dateLabel: `${String(day).padStart(2, "0")} ${monthNames[month - 1]} ${year}`,
        countKK,
        countSKP
      });
    }

    return { rows: daysRows, totalKK, totalSKP, monthLabel: `${monthNames[month - 1]} ${year}` };
  }, [pelayananDB, selectedMonthSheet]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative z-10">
      {/* ----------------- LAPORAN HARIAN VIEWER ----------------- */}
      {activeSection === "sec-laporan-harian" && (
        <div id="sec-laporan-harian" className="animate-fade-in print:p-0">
          <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                Laporan Harian Pelayanan
              </h2>
              <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
                Pratinjau dan cetak rekapitulasi data layanan berdasarkan tanggal yang dipilih.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-end">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-48 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium shadow-sm focus:outline-none"
                />
              </div>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
              >
                🖨️ Cetak Laporan
              </button>
            </div>
          </div>

          {/* Page-print structured layout sheet */}
          <div className="bg-white rounded-[1.5rem] p-6 sm:p-12 max-w-2xl mx-auto shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-2 font-mono text-slate-900">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-lg sm:text-xl font-bold uppercase leading-snug">
                LAPORAN HARIAN PELAYANAN
              </h1>
              <h2 className="text-sm sm:text-base font-bold uppercase leading-snug">
                UPTD DUKCAPIL KECAMATAN MAKARTI JAYA
              </h2>
              <p className="text-xs mt-1">KABUPATEN BANYUASIN, PROVINSI SUMATERA SELATAN</p>
            </div>

            <div className="space-y-3 font-semibold text-sm">
              <div className="flex border-b border-dashed border-slate-300 pb-1">
                <span className="w-56 text-slate-600 font-bold uppercase">Hari / Tanggal</span>
                <span className="mr-2">:</span>
                <span className="font-bold flex-1">{displaySelectedDateIndo}</span>
              </div>
              <div className="flex border-b border-dashed border-slate-200 pb-1">
                <span className="w-56 text-slate-600">Penerbitan KK</span>
                <span className="mr-2">:</span>
                <span className="font-bold">{harianCounts["Penerbitan KK"]} dokumen</span>
              </div>
              <div className="flex border-b border-dashed border-slate-200 pb-1">
                <span className="w-56 text-slate-600">SKP WNI</span>
                <span className="mr-2">:</span>
                <span className="font-bold">{harianCounts["SKP WNI"]} dokumen</span>
              </div>
              <div className="flex border-b border-dashed border-slate-200 pb-1">
                <span className="w-56 text-slate-600">Akta Kelahiran</span>
                <span className="mr-2">:</span>
                <span className="font-bold">{harianCounts["Penerbitan Akta Kelahiran"]} dokumen</span>
              </div>
              <div className="flex border-b border-dashed border-slate-200 pb-1">
                <span className="w-56 text-slate-600">Akta Kematian</span>
                <span className="mr-2">:</span>
                <span className="font-bold">{harianCounts["Penerbitan Akta Kematian"]} dokumen</span>
              </div>
              <div className="flex border-b border-dashed border-slate-200 pb-1">
                <span className="w-56 text-slate-600">Akta Perkawinan</span>
                <span className="mr-2">:</span>
                <span className="font-bold">{harianCounts["Penerbitan Akta Perkawinan"]} dokumen</span>
              </div>
              <div className="flex border-b border-dashed border-slate-200 pb-1">
                <span className="w-56 text-slate-600">Perekaman KTP-EL</span>
                <span className="mr-2">:</span>
                <span className="font-bold">{harianCounts["Rekam KTP-EL"]} jiwa</span>
              </div>

              {/* INTEGRATING THE NEW AKTIVASI IKD REGISTER */}
              <div className="flex text-blue-700 bg-blue-50/50 p-1 rounded border-b border-dashed border-blue-200 pb-1">
                <span className="w-56 uppercase font-bold text-blue-600">Aktivasi IKD (Baru)</span>
                <span className="mr-2">:</span>
                <span className="font-black">{harianCounts["Aktivasi IKD"]} akun terdaftar</span>
              </div>

              <div className="my-4 text-center text-slate-400">---------------------------------------</div>

              <div className="flex">
                <span className="w-56 text-slate-600">Blangko KTP Keluar</span>
                <span className="mr-2">:</span>
                <span>{harianCounts["Rekam KTP-EL"]} keping</span>
              </div>
              <div className="flex">
                <span className="w-56 text-slate-600">Sisa Stok Blangko</span>
                <span className="mr-2">:</span>
                <span>150 keping</span>
              </div>
            </div>

            {/* Official Signature print block */}
            <div className="mt-16 flex justify-end">
              <div className="text-left w-64 text-sm font-semibold">
                <p className="mb-1">Makarti Jaya, {new Date(selectedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="mb-20">Petugas UPTD Kec. Makarti Jaya</p>
                <p className="font-bold underline uppercase">{pejabatNama}</p>
                <p className="text-xs text-slate-400">{pejabatNIP || "NIP. -"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- LAPORAN BULAN SKP ----------------- */}
      {activeSection === "sec-recap-skp" && (
        <div id="sec-recap-skp" className="animate-fade-in">
          <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                Laporan Bulanan SKP & KK
              </h2>
              <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
                Kompilasi harian register KK lama & Surat Pindah WNI selama 1 bulan.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-end">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Bulan</label>
                <input
                  type="month"
                  value={selectedMonthSKP}
                  onChange={(e) => setSelectedMonthSKP(e.target.value)}
                  className="w-full sm:w-48 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium shadow-sm focus:outline-none"
                />
              </div>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
              >
                🖨️ Cetak Matriks
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 sm:p-12 max-w-6xl mx-auto shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-2">
            <div className="text-center mb-6 pb-2 border-b-2 border-black">
              <h1 className="text-lg font-bold uppercase tracking-wider">PEMERINTAH KABUPATEN BANYUASIN</h1>
              <h2 className="text-sm font-semibold uppercase">DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL</h2>
              <p className="text-xs uppercase font-medium">UPTD KECAMATAN MAKARTI JAYA, PROVINSI SUMATERA SELATAN</p>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-sm font-bold uppercase underline">LAPORAN MATRIKS REGISTER BULANAN (KK & SKPWNI)</h3>
              <p className="text-xs font-bold uppercase text-slate-500 mt-1">PERIODE: {skpMonthlyData.monthLabel.toUpperCase()}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-[11px] sm:text-xs text-center text-slate-950">
                <thead className="bg-slate-100 uppercase">
                  <tr>
                    <th className="border border-slate-900 p-2 rowspan-2 w-16" rowSpan={2}>No</th>
                    <th className="border border-slate-900 p-2 rowspan-2 w-28 text-left" rowSpan={2}>Hari</th>
                    <th className="border border-slate-900 p-2 rowspan-2 text-left pr-4" rowSpan={2}>Tanggal Register</th>
                    <th className="border border-slate-900 p-2" colSpan={2}>Jumlah Pelayanan Terbit</th>
                    <th className="border border-slate-900 p-2" colSpan={2}>Jumlah Arsip Sistem</th>
                  </tr>
                  <tr>
                    <th className="border border-slate-900 p-1 w-36">Kartu Keluarga (KK)</th>
                    <th className="border border-slate-900 p-1 w-36">SKP WNI</th>
                    <th className="border border-slate-900 p-1 w-36">Kartu Keluarga (KK)</th>
                    <th className="border border-slate-900 p-1 w-36">SKP WNI</th>
                  </tr>
                </thead>
                <tbody>
                  {skpMonthlyData.rows.map((row) => (
                    <tr key={row.dayNo} className="hover:bg-slate-50">
                      <td className="border border-slate-900 p-1.5 font-bold">{row.dayNo}</td>
                      <td className="border border-slate-900 p-1.5 text-left font-medium">{row.dayName}</td>
                      <td className="border border-slate-900 p-1.5 text-left font-medium">{row.dateLabel}</td>
                      <td className="border border-slate-900 p-1.5 font-bold text-blue-700">{row.countKK || "-"}</td>
                      <td className="border border-slate-900 p-1.5 font-bold text-emerald-700">{row.countSKP || "-"}</td>
                      <td className="border border-slate-900 p-1.5 font-bold text-blue-700">{row.countKK || "-"}</td>
                      <td className="border border-slate-900 p-1.5 font-bold text-emerald-700">{row.countSKP || "-"}</td>
                    </tr>
                  ))}
                  <tr className="font-extrabold bg-slate-50">
                    <td className="border border-slate-900 p-2.5 text-right uppercase" colSpan={3}>Jumlah Total:</td>
                    <td className="border border-slate-900 p-2.5 text-blue-700 text-sm font-black">{skpMonthlyData.totalKK}</td>
                    <td className="border border-slate-900 p-2.5 text-emerald-700 text-sm font-black">{skpMonthlyData.totalSKP}</td>
                    <td className="border border-slate-900 p-2.5 text-blue-700 text-sm font-black">{skpMonthlyData.totalKK}</td>
                    <td className="border border-slate-900 p-2.5 text-emerald-700 text-sm font-black">{skpMonthlyData.totalSKP}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-12 flex justify-end print:mt-8">
              <div className="text-left w-64 text-sm font-semibold">
                <p className="mb-1">Makarti Jaya, {skpMonthlyData.monthLabel}</p>
                <p className="mb-20">Petugas UPTD Kec. Makarti Jaya</p>
                <p className="font-bold underline uppercase">{pejabatNama}</p>
                <p className="text-xs text-slate-400">{pejabatNIP || "NIP. -"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- LAPORAN PEREKAMAN ----------------- */}
      {activeSection === "sec-laporan-perekaman" && (
        <div id="sec-laporan-perekaman" className="animate-fade-in">
          <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                Laporan Harian Perekaman KTP-EL
              </h2>
              <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
                Distribusi total performa kuota perekaman KTP Elektronik per hari.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-end">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Bulan</label>
                <input
                  type="month"
                  value={selectedMonthRekam}
                  onChange={(e) => setSelectedMonthRekam(e.target.value)}
                  className="w-full sm:w-48 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium shadow-sm focus:outline-none"
                />
              </div>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
              >
                🖨️ Cetak Matriks
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-6 sm:p-12 max-w-full mx-auto shadow-sm border border-slate-100 overflow-x-auto print:shadow-none print:border-none print:p-2">
            <div className="min-w-[800px] print:min-w-0">
              <div className="text-center mb-6 pb-2 border-b-2 border-black">
                <h1 className="text-lg font-bold uppercase tracking-wider">PEMERINTAH KABUPATEN BANYUASIN</h1>
                <h2 className="text-sm font-semibold uppercase">DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL</h2>
                <p className="text-xs uppercase font-medium">UPTD KECAMATAN MAKARTI JAYA, PROVINSI SUMATERA SELATAN</p>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-sm font-bold uppercase underline">MATRIX RECORD DISTRIBUSI PEREKAMAN KTP-EL TERBARU</h3>
                <p className="text-xs font-bold uppercase text-slate-500 mt-1">PERIODE BULAN: {rekamMonthlyData.monthLabel.toUpperCase()}</p>
              </div>

              <table className="w-full border-collapse border border-slate-900 text-center text-slate-950 font-bold text-xs">
                <thead className="bg-slate-150 text-[10px] uppercase">
                  <tr>
                    <th className="border border-slate-900 p-2" rowSpan={2}>No</th>
                    <th className="border border-slate-900 p-2" rowSpan={2}>Kecamatan</th>
                    <th className="border border-slate-900 p-2" colSpan={rekamMonthlyData.daysInMonth}>Rentang Tanggal Matrix</th>
                    <th className="border border-slate-900 p-2 w-16" rowSpan={2}>Total</th>
                  </tr>
                  <tr>
                    {Array.from({ length: rekamMonthlyData.daysInMonth }, (_, index) => (
                      <th key={index + 1} className="border border-slate-900 p-1 w-6">{index + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-900 p-4">1</td>
                    <td className="border border-slate-900 p-4 text-left font-extrabold text-xs">MAKARTI JAYA</td>
                    {rekamMonthlyData.counts.map((count, index) => (
                      <td key={index + 1} className={`border border-slate-900 p-1 text-center font-bold ${count > 0 ? "bg-cyan-50 text-cyan-700" : "text-slate-400"}`}>
                        {count || "0"}
                      </td>
                    ))}
                    <td className="border border-slate-900 p-4 font-black text-sm text-blue-800 bg-slate-50">{rekamMonthlyData.total}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-12 flex justify-end">
                <div className="text-left w-64 text-sm font-semibold">
                  <p className="mb-1">Makarti Jaya, {rekamMonthlyData.monthLabel}</p>
                  <p className="mb-20">Petugas UPTD Kec. Makarti Jaya</p>
                  <p className="font-bold underline uppercase">{pejabatNama}</p>
                  <p className="text-xs text-slate-400">{pejabatNIP || "NIP. -"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- LIVE VIEW SHEET DATA ----------------- */}
      {activeSection === "sec-view-laporan-sheet" && (
        <div id="sec-view-laporan-sheet" className="animate-fade-in">
          <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                Live Data Matriks Laporan
              </h2>
              <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
                Tampilan real-time laporan bulan seksi pendaftaran kependudukan terintegrasi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-end">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Bulan</label>
                <input
                  type="month"
                  value={selectedMonthSheet}
                  onChange={(e) => setSelectedMonthSheet(e.target.value)}
                  className="w-full sm:w-48 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium shadow-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 mb-4">
              <span className="text-xl">📊</span>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg uppercase">
                BULAN: {sheetMonthlyData.monthLabel}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-center text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] sm:text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="border border-slate-200 p-2 rowspan-2" rowSpan={2}>No</th>
                    <th className="border border-slate-200 p-2 rowspan-2 text-left" rowSpan={2}>Hari</th>
                    <th className="border border-slate-200 p-2 rowspan-2 text-left" rowSpan={2}>Tanggal Pelayanan</th>
                    <th className="border border-slate-200 p-2" colSpan={2}>Volume Layanan</th>
                    <th className="border border-slate-200 p-2" colSpan={2}>Volume Arsip Digital</th>
                  </tr>
                  <tr>
                    <th className="border border-slate-250 p-1">Kartu Keluarga (KK)</th>
                    <th className="border border-slate-250 p-1">SKP WNI</th>
                    <th className="border border-slate-250 p-1">Kartu Keluarga (KK)</th>
                    <th className="border border-slate-250 p-1">SKP WNI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sheetMonthlyData.rows.map((row) => (
                    <tr key={row.dayNo} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-200 p-1.5 font-bold text-slate-800">{row.dayNo}</td>
                      <td className="border border-slate-200 p-1.5 text-left">{row.dayName}</td>
                      <td className="border border-slate-200 p-1.5 text-left font-medium">{row.dateLabel}</td>
                      <td className="border border-slate-200 p-1.5 font-bold text-blue-600">{row.countKK || "-"}</td>
                      <td className="border border-slate-200 p-1.5 font-bold text-emerald-600">{row.countSKP || "-"}</td>
                      <td className="border border-slate-200 p-1.5 font-bold text-blue-600">{row.countKK || "-"}</td>
                      <td className="border border-slate-200 p-1.5 font-bold text-emerald-600">{row.countSKP || "-"}</td>
                    </tr>
                  ))}
                  <tr className="font-extrabold bg-slate-50 text-slate-900 border-t-2 border-slate-300">
                    <td className="border-r border-slate-200 p-3 text-right uppercase" colSpan={3}>Jumlah Total:</td>
                    <td className="border-r border-slate-200 p-3 text-blue-700 text-sm font-black">{sheetMonthlyData.totalKK}</td>
                    <td className="border-r border-slate-200 p-3 text-emerald-700 text-sm font-black">{sheetMonthlyData.totalSKP}</td>
                    <td className="border-r border-slate-200 p-3 text-blue-700 text-sm font-black">{sheetMonthlyData.totalKK}</td>
                    <td className="p-3 text-emerald-700 text-sm font-black">{sheetMonthlyData.totalSKP}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
