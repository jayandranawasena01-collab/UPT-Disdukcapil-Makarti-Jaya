import React, { useState, useMemo } from "react";
import { BerkasRecord } from "../types";
import { KELURAHAN_LIST, DRIVE_LINKS } from "../data";

interface UploadBerkasProps {
  berkasDB: Record<string, BerkasRecord[]>;
  onUpload: (category: string, item: Omit<BerkasRecord, "id" | "rowNumber">) => void;
  onDeleteBerkas: (category: string, rowNumber: number) => void;
  userRole: "admin" | "user";
}

export default function UploadBerkas({ berkasDB, onUpload, onDeleteBerkas, userRole }: UploadBerkasProps) {
  const [category, setCategory] = useState<"KK" | "AKL" | "AKM" | "SKPWNI" | "AKW" | "ARSIP" | "IKD">("KK");
  const [tanggal, setTanggal] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [desa, setDesa] = useState("");
  const [nama, setNama] = useState("");
  const [noDoc, setNoDoc] = useState("");
  const [nik, setNik] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filter lists inside
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const resetDropzone = () => {
    setSelectedFile(null);
  };

  const isArsip = category === "ARSIP";

  // Dynamic label configs
  const docLabel = useMemo(() => {
    if (category === "KK") return "No KK";
    if (category === "AKL") return "No Akta Kelahiran";
    if (category === "AKM") return "No Akta Kematian";
    if (category === "SKPWNI") return "No SKPWNI";
    if (category === "AKW") return "No Akta Perkawinan";
    if (category === "IKD") return "No HP Pemohon";
    if (category === "ARSIP") return "Kode / No Arsip";
    return "No Dokumen";
  }, [category]);

  const namaLabel = useMemo(() => {
    if (category === "AKL") return "Nama Lengkap Anak";
    if (category === "AKM") return "Nama Almarhum/ah";
    if (category === "ARSIP") return "Keterangan / Judul Arsip";
    return "Nama Lengkap Pemohon";
  }, [category]);

  const nikLabel = useMemo(() => {
    if (category === "AKL") return "NIK Anak / NIK Ortu";
    if (category === "ARSIP") return "Asal Unit Arsip";
    return "NIK Pemohon (16 digit)";
  }, [category]);

  // Grid list computation
  const currentList = useMemo(() => {
    const list = berkasDB[category] || [];
    return list.filter((item) => {
      if (filterStart && item.tanggal < filterStart) return false;
      if (filterEnd && item.tanggal > filterEnd) return false;
      return true;
    });
  }, [berkasDB, category, filterStart, filterEnd]);

  // Handle Drag & Drop
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Submit triggers upload simulation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Silahkan unggah file dokumen pemohon terleblih dahulu (tarik atau klik upload).");
      return;
    }

    onUpload(category, {
      tanggal,
      nama: nama.toUpperCase(),
      noDokumen: noDoc,
      nik: nik.toUpperCase(),
      kelurahan: isArsip ? "-" : desa.toUpperCase(),
      fileName: selectedFile.name,
      fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
      fileUrl: DRIVE_LINKS[category] || "#",
      category
    });

    // Reset Form Input controls
    setNama("");
    setNoDoc("");
    setNik("");
    setDesa("");
    setSelectedFile(null);
    alert("🚀 Berkas berhasil diunggah dan disinkronisasikan ke google drive!");
  };

  const handleDelete = (rowNum: number) => {
    if (window.confirm("Hapus rekaman berkas ini beserta file aslinya di Google Drive?")) {
      onDeleteBerkas(category, rowNum);
    }
  };

  // Print Form Receipt
  const handleCetakTandaTerima = (item: BerkasRecord) => {
    const formattedDate = new Date(item.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    // Simple textual layout wrapped as safe downloaded receipt HTML file
    const receiptHTML = `
      <html>
      <head>
        <title>Tanda Terima Upload Berkas</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; margin: 40px; color: #333; }
          .receipt { border: 2px dashed #000; padding: 25px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: bold; }
          .row { display: flex; margin-bottom: 10px; font-size: 14px; }
          .label { width: 180px; font-weight: bold; }
          .value { flex: 1; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; font-style: italic; border-top: 1px dashed #777; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="title">TANDA TERIMA UPLOAD ARSIP BERKAS</div>
            <div>UPTD DUKCAPIL KECAMATAN MAKARTI JAYA</div>
            <div style="font-size: 11px;">KABUPATEN BANYUASIN, SUMATERA SELATAN</div>
          </div>
          <div class="row">
            <div class="label">Kategori Berkas:</div>
            <div class="value">${item.category}</div>
          </div>
          <div class="row">
            <div class="label">Tanggal Upload:</div>
            <div class="value">${formattedDate}</div>
          </div>
          <div class="row">
            <div class="label">Nama Pemilik:</div>
            <div class="value">${item.nama}</div>
          </div>
          <div class="row">
            <div class="label">No Dokumen:</div>
            <div class="value">${item.noDokumen}</div>
          </div>
          <div class="row">
            <div class="label">NIK / Identitas:</div>
            <div class="value">${item.nik}</div>
          </div>
          <div class="row">
            <div class="label">Asal Desa/Unit:</div>
            <div class="value">${item.kelurahan}</div>
          </div>
          <div class="row">
            <div class="label">Nama File:</div>
            <div class="value">${item.fileName} (${item.fileSize || "1.0 MB"})</div>
          </div>
          <div class="footer">
            Sistem Arsip Terintegrasi Cloud Drive. Dokumen Anda tersimpan aman.<br>
            Dicetak otomatis pada tanggal ${new Date().toLocaleDateString("id-ID")}.
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Tanda_Terima_Unggah_${item.nama.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="sec-berkas" className="animate-fade-in relative z-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          Arsip & Upload Dokumentasi Berkas
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Unggah pindaian berkas fisik pemohon langsung ke direktori Cloud Drive yang sesuai.
        </p>
      </div>

      {/* Categories box and open folder anchor */}
      <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 mb-6 sm:mb-8 flex flex-col md:flex-row items-end justify-between gap-4 shadow-sm border border-slate-100">
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Kategori Berkas Unggah
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as any);
              resetDropzone();
            }}
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="KK">Kartu Keluarga (KK)</option>
            <option value="AKL">Akta Kelahiran (AKL)</option>
            <option value="AKM">Akta Kematian (AKM)</option>
            <option value="SKPWNI">Surat Keterangan Pindah WNI (SKPWNI)</option>
            <option value="AKW">Akta Perkawinan (AKW)</option>
            <option value="IKD">Aktivasi IKD (IKD)</option>
            {userRole === "admin" && <option value="ARSIP">Arsip Internal</option>}
          </select>
        </div>
        <a
          href={DRIVE_LINKS[category]}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto text-center bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-blue-200 shadow-sm cursor-pointer"
        >
          📂 Buka Folder Cloud Drive
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Upload Form View */}
        <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 shadow-sm border border-slate-100 lg:col-span-1 h-fit border-t-4 border-t-blue-600">
          <div className="border-b border-slate-150 pb-4 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              ☁️
            </div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">Form Pengunggahan</h3>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1.5">Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                  required
                />
              </div>
              {!isArsip && (
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1.5">Desa/Kelurahan</label>
                  <select
                    value={desa}
                    onChange={(e) => setDesa(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                    required
                  >
                    <option value="" disabled>Pilih Desa</option>
                    {KELURAHAN_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0) + d.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1.5">{namaLabel}</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Ketik nama berkas/pemilik"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1.5">{docLabel}</label>
                <input
                  type="text"
                  value={noDoc}
                  onChange={(e) => setNoDoc(e.target.value)}
                  placeholder="Ketik kode/no"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1.5">{nikLabel}</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="NIK 16 digit/Asal"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Custom drag-drop panel */}
            <div className="pt-2">
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-2">Unggah Salinan Dokumen</label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer relative group flex flex-col items-center justify-center min-h-[120px] ${
                  dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-300 hover:border-blue-500 hover:bg-slate-50"
                }`}
                onClick={() => document.getElementById("fileDropInput")?.click()}
              >
                <input
                  type="file"
                  id="fileDropInput"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />

                {!selectedFile ? (
                  <div>
                    <span className="text-2xl mb-2 block">📄</span>
                    <p className="text-xs font-bold text-slate-700">Tarik & Lepas file PDF di sini</p>
                    <p className="text-[10px] text-slate-500 mt-1">atau <span className="text-blue-600 font-semibold">klik untuk pilih file</span></p>
                    <span className="text-[9px] text-slate-400 mt-2 block">Disarankan format PDF, PNG atau JPG</span>
                  </div>
                ) : (
                  <div className="w-full">
                    <span className="text-2xl mb-1 block">✅</span>
                    <p className="text-xs font-bold text-slate-800 truncate px-2">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-[9px] font-bold text-rose-500 border border-rose-200 px-2 py-1 rounded bg-rose-50 mt-2 hover:bg-rose-100"
                    >
                      Batal Ganti File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              🚀 Unggah Berkas Arsip
            </button>
          </form>
        </div>

        {/* Database records listed */}
        <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 lg:col-span-2 shadow-sm border border-slate-100 overflow-hidden flex flex-col h-fit">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              📂 Daftar Berkas Terunggah
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
              <span className="text-xs text-slate-400">s/d</span>
              <input
                type="date"
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
                className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
              <thead className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 font-bold">No</th>
                  <th className="px-3 py-3 font-bold">Nama / Keterangan</th>
                  <th className="px-3 py-3 font-bold">{docLabel}</th>
                  <th className="px-3 py-3 font-bold">{nikLabel}</th>
                  {!isArsip && <th className="px-3 py-3 font-bold">Desa</th>}
                  <th className="px-3 py-3 font-bold">Arsip File</th>
                  <th className="px-3 py-3 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Belum ada file diunggah dalam kategori "{category}" pada rentang terpilih.
                    </td>
                  </tr>
                ) : (
                  currentList.map((item, idx) => (
                    <tr key={item.id + idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 font-medium">{idx + 1}</td>
                      <td className="px-3 py-3 font-bold text-slate-800 uppercase">{item.nama}</td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-xs">{item.noDokumen}</td>
                      <td className="px-3 py-3 text-slate-500 font-mono text-xs">{item.nik}</td>
                      {!isArsip && <td className="px-3 py-3 text-xs font-semibold">{item.kelurahan}</td>}
                      <td className="px-3 py-3 text-xs max-w-[120px] truncate" title={item.fileName}>
                        📄 {item.fileName}
                      </td>
                      <td className="px-3 py-3 text-center text-xs">
                        <div className="flex justify-center gap-1">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-50 text-blue-600 p-1.5 hover:bg-blue-600 hover:text-white rounded transition-colors"
                            title="Buka Drive"
                          >
                            🔗
                          </a>
                          <button
                            onClick={() => handleCetakTandaTerima(item)}
                            className="bg-emerald-50 text-emerald-600 p-1.5 hover:bg-emerald-600 hover:text-white rounded transition-colors cursor-pointer"
                            title="Cetak Resi"
                          >
                            🖨️
                          </button>
                          <button
                            onClick={() => handleDelete(item.rowNumber)}
                            className="bg-rose-50 text-rose-600 p-1.5 hover:bg-rose-600 hover:text-white rounded transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
