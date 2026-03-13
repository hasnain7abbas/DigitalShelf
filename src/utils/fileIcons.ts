const iconMap: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "#e74c3c" },
  doc: { label: "DOC", color: "#2b579a" },
  docx: { label: "DOCX", color: "#2b579a" },
  xls: { label: "XLS", color: "#217346" },
  xlsx: { label: "XLSX", color: "#217346" },
  ppt: { label: "PPT", color: "#d24726" },
  pptx: { label: "PPTX", color: "#d24726" },
  txt: { label: "TXT", color: "#888" },
  zip: { label: "ZIP", color: "#f0ad4e" },
  rar: { label: "RAR", color: "#f0ad4e" },
  "7z": { label: "7Z", color: "#f0ad4e" },
  mp3: { label: "MP3", color: "#1db954" },
  mp4: { label: "MP4", color: "#ff6b6b" },
  mkv: { label: "MKV", color: "#ff6b6b" },
  avi: { label: "AVI", color: "#ff6b6b" },
  js: { label: "JS", color: "#f7df1e" },
  ts: { label: "TS", color: "#3178c6" },
  py: { label: "PY", color: "#3776ab" },
  rs: { label: "RS", color: "#dea584" },
  html: { label: "HTML", color: "#e34f26" },
  css: { label: "CSS", color: "#1572b6" },
  json: { label: "JSON", color: "#999" },
  exe: { label: "EXE", color: "#888" },
};

export function getFileIcon(ext: string): { label: string; color: string } {
  return iconMap[ext.toLowerCase()] || { label: ext.toUpperCase() || "FILE", color: "#6366f1" };
}
