export type ServiceType =
  | "Penerbitan KK"
  | "SKP WNI"
  | "Penerbitan Akta Kelahiran"
  | "Penerbitan Akta Kematian"
  | "Penerbitan Akta Perkawinan"
  | "Rekam KTP-EL"
  | "Aktivasi IKD";

export interface PelayananRecord {
  id: string;
  tanggal: string;
  nama: string;
  noDokumen: string;
  nik: string;
  kelurahan: string;
  rowNumber: number;
}

export interface BerkasRecord {
  id: string;
  rowNumber: number;
  tanggal: string;
  nama: string;
  noDokumen: string;
  nik: string;
  kelurahan: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  category: "KK" | "AKL" | "AKM" | "SKPWNI" | "AKW" | "ARSIP" | "IKD";
}

export type MenuSection =
  | "sec-dashboard"
  | "sec-input"
  | "sec-manage"
  | "sec-berkas"
  | "sec-cek-pengajuan"
  | "sec-live-sheet"
  | "sec-laporan-harian"
  | "sec-recap-skp"
  | "sec-laporan-perekaman"
  | "sec-view-laporan-sheet"
  | "sec-recap"
  | "sec-persyaratan";

export interface UserSession {
  success: boolean;
  role: "admin" | "user";
  nama: string;
}
