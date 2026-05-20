import { useState, useMemo } from "react";
import { ServiceType, PelayananRecord } from "../types";

interface RekapCetakProps {
  pelayananDB: Record<ServiceType, PelayananRecord[]>;
}

export default function RekapCetak({ pelayananDB }: RekapCetakProps) {
  const d = new Date();
  const beginningOfYear = `${d.getFullYear()}-01-01`;
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(beginningOfYear);
  const [endDate, setEndDate] = useState(todayStr);
  const [kepalaNama, setKepalaNama] = useState("ALI SODIKIN, S.Ag., M.Si");
  const [kepalaNIP, setKepalaNIP] = useState("197110182007011018");
  const [showPreview, setShowPreview] = useState(false);

  // Dynamic status counters for chosen period range
  const periodCounts = useMemo(() => {
    const counts: Record<ServiceType, number> = {
      "Penerbitan KK": 0,
      "SKP WNI": 0,
      "Penerbitan Akta Kelahiran": 0,
      "Penerbitan Akta Kematian": 0,
      "Penerbitan Akta Perkawinan": 0,
      "Rekam KTP-EL": 0,
      "Aktivasi IKD": 0
    };

    (Object.keys(pelayananDB) as ServiceType[]).forEach((srv) => {
      const records = pelayananDB[srv] || [];
      counts[srv] = records.filter((r) => {
        if (startDate && r.tanggal < startDate) return false;
        if (endDate && r.tanggal > endDate) return false;
        return true;
      }).length;
    });

    return counts;
  }, [pelayananDB, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="sec-recap" className="animate-fade-in relative z-10 print:p-0">
      {/* Parameter configuration - hidden during printing */}
      <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 mb-6 sm:mb-8 max-w-3xl shadow-sm border border-slate-100 print:hidden">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <span className="text-xl">⚙️</span>
          <h3 className="font-bold text-slate-800 text-base sm:text-lg">Konfigurasi Parameter Laporan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Pejabat (Kepala UPTD / Kabid)</label>
            <input
              type="text"
              value={kepalaNama}
              onChange={(e) => setKepalaNama(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800"
              placeholder="Contoh: Ali Sodikin, S.Ag., M.Si"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NIP Pejabat</label>
            <input
              type="text"
              value={kepalaNIP}
              onChange={(e) => setKepalaNIP(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800 font-mono"
              placeholder="Masukkan NIP"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            👁️ Tampilkan Pratinjau Dokumen
          </button>
          {showPreview && (
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
            >
              🖨️ Cetak Resume
            </button>
          )}
        </div>
      </div>

      {/* LEGAL REPORT SPECIMEN SHEETS PREVIEW */}
      {showPreview && (
        <div id="recapPreviewArea" className="pb-16 animate-fade-in print:p-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="bg-white p-6 sm:p-12 relative min-w-[750px] print:min-w-0 print:p-2 shadow-sm border border-slate-100 print:shadow-none print:border-none font-serif text-slate-900">
              {/* official national logo with header section */}
              <div className="relative mb-6 border-b-[4px] border-double border-slate-900 pb-4 flex items-center justify-center">
                <div className="text-center w-full">
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider">UPTD DUKCAPIL KECAMATAN MAKARTI JAYA</h2>
                  <h3 className="text-sm sm:text-base font-bold uppercase mt-1">Dinas Kependudukan dan Pencatatan Sipil Dinas Banyuasin</h3>
                  <p className="text-[11px] font-sans text-slate-600 mt-1">Jln. Hayam Wuruk, Kelurahan Makarti Jaya, Kec. Makarti Jaya, Kab. Banyuasin Provinsi Sumatera Selatan</p>
                </div>
              </div>

              <div className="mb-4 text-xs font-sans font-semibold text-slate-700 p-2 bg-slate-50 inline-block rounded border border-slate-200 print:hidden">
                Rentang Rekapitulasi: <span className="text-slate-950 font-bold">{startDate} s/d {endDate}</span>
              </div>

              {/* Legal matrix block */}
              <table className="w-full text-xs text-left border-collapse border border-slate-900 text-slate-950">
                <thead className="bg-slate-100 uppercase text-center font-bold font-sans">
                  <tr>
                    <th className="border border-slate-900 p-2 w-10">No</th>
                    <th className="border border-slate-900 p-2 w-48 text-left">Nama Satuan Kerja</th>
                    <th className="border border-slate-900 p-2 w-48 text-left">Tugas & Fungsi Operasional</th>
                    <th className="border border-slate-900 p-2 text-left">Cakupan Indeks Layanan</th>
                    <th className="border border-slate-900 p-2 w-24">Jumlah</th>
                    <th className="border border-slate-900 p-2 w-20">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {/* GROUP A */}
                  <tr>
                    <td className="border border-slate-900 p-2 text-center" rowSpan={14}>1</td>
                    <td className="border border-slate-900 p-2 font-bold vertical-top" rowSpan={14}>
                      UPTD Kecamatan Makarti Jaya, Kabupaten Banyuasin
                    </td>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50/50" rowSpan={5}>
                      A. Bidang Pencatatan & Registrasi Penduduk
                    </td>
                    <td className="border border-slate-900 p-2">1. Pencatatan Biodata Penduduk</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Aktif</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">2. Penerbitan Kartu Keluarga (KK)</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-blue-700 bg-blue-50/20">{periodCounts["Penerbitan KK"]}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Lengkap</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">3. Penerbitan Kartu Identitas Anak (KIA)</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Nol</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">4. Penerbitan KTP-EL (Cetak Luar Domisili)</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Pusat</td>
                  </tr>
                  <tr className="border-b-2 border-slate-900">
                    <td className="border border-slate-900 p-2">5. Surat Pindah Datang WNI (SKPWNI)</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-blue-700 bg-blue-50/20">{periodCounts["SKP WNI"]}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Lengkap</td>
                  </tr>

                  {/* GROUP B */}
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-emerald-50/20" rowSpan={8}>
                      B. Bidang Pencatatan Sipil Aktiva
                    </td>
                    <td className="border border-slate-900 p-2">1. Register Akta Kelahiran</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-emerald-700 bg-emerald-50/20">{periodCounts["Penerbitan Akta Kelahiran"]}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Lengkap</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">2. Register Akta Kematian</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-emerald-700 bg-emerald-50/20">{periodCounts["Penerbitan Akta Kematian"]}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Lengkap</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">3. Register Akta Perkawinan Non-Muslim</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-emerald-700 bg-emerald-50/20">{periodCounts["Penerbitan Akta Perkawinan"]}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Lengkap</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">4. Catatan Pinggir Perubahan Nama</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Nol</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">5. Catatan Perceraian</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Nol</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">6. Legalisir Dokumen Kependudukan</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Pusat</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2">7. Pengakuan Pengesahan Anak</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Nol</td>
                  </tr>
                  <tr className="border-b-2 border-slate-900">
                    <td className="border border-slate-900 p-2">8. Peristiwa penting lainnya</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-400 font-bold">-</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Nol</td>
                  </tr>

                  {/* GROUP C */}
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-amber-50/20">
                      C. Pelayanan Non-Fisik Lainnya
                    </td>
                    <td className="border border-slate-900 p-2 font-semibold">
                      1. Perekaman Biodata KTP Elektronik (KTP-EL)
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-amber-700 bg-amber-55/20">{periodCounts["Rekam KTP-EL"]}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px]">Jiwa</td>
                  </tr>

                  {/* SPECIAL REPORT INCLUSION FOR AKTIVASI IKD - DOCK BLOCK */}
                  <tr className="border-t-2 border-slate-900 font-bold bg-blue-50/10">
                    <td className="border border-slate-900 p-2 text-center">2</td>
                    <td className="border border-slate-900 p-2 uppercase font-extrabold text-blue-900">UPTD DUKCAPIL DIGITAL</td>
                    <td className="border border-slate-900 p-2 font-bold text-blue-900">D. Layanan Identitas Digital Kependudukan</td>
                    <td className="border border-slate-900 p-2 text-blue-950 font-bold text-xs">
                      Aktivasi Akun / Registrasi Identitas Kependudukan Digital (IKD)
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-black text-blue-800 bg-blue-100/40 text-sm">
                      {periodCounts["Aktivasi IKD"]}
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-[10px] text-blue-600">Terdaftar</td>
                  </tr>
                </tbody>
              </table>

              {/* Authoritative signing frame list */}
              <div className="flex justify-end mt-12">
                <div className="text-center w-72 text-sm">
                  <p className="mb-1">Makarti Jaya, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="font-bold mb-20 text-slate-900">Mengetahui,<br />Kepala UPTD Kecamatan Makarti Jaya</p>
                  <p className="font-extrabold underline decoration-1 underline-offset-4 uppercase text-slate-950">
                    {kepalaNama}
                  </p>
                  <p className="font-mono mt-1 text-xs">
                    NIP. {kepalaNIP || "..........................."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
