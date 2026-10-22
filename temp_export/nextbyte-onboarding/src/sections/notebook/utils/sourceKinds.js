/**
 * Jedno źródło prawdy dla ikony i etykiety każdego `fileKind`. Wcześniej te same
 * mapy były zduplikowane (i niespójne — np. brak wpisu `audio`) w Sidebar,
 * SourcePreviewModal i AddSourceModal osobno.
 */

import { FileText, FileSpreadsheet, Image as ImageIcon, FileCode, AudioLines, Globe, FileType, Presentation } from 'lucide-react';

export const KIND_META = {
  pdf: { icon: FileText, label: 'PDF' },
  xlsx: { icon: FileSpreadsheet, label: 'Excel' },
  csv: { icon: FileSpreadsheet, label: 'CSV' },
  html: { icon: FileCode, label: 'HTML' },
  image: { icon: ImageIcon, label: 'Obraz' },
  audio: { icon: AudioLines, label: 'Audio' },
  web: { icon: Globe, label: 'Strona WWW' },
  docx: { icon: FileType, label: 'Word' },
  pptx: { icon: Presentation, label: 'PowerPoint' },
  text: { icon: FileText, label: 'Tekst' },
};

export function getKindMeta(fileKind) {
  return KIND_META[fileKind] || KIND_META.text;
}

export function getKindIcon(fileKind) {
  return getKindMeta(fileKind).icon;
}

export function getKindLabel(fileKind) {
  return getKindMeta(fileKind).label;
}
