import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';

/** Render a Lucide icon by name; falls back to LayoutDashboard. */
export function ShortcutIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (LucideIcons as any)[name] || LayoutDashboard;
  return <Cmp className={className} />;
}
