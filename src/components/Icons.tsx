import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Columns, 
  Rows, 
  Table as TableIcon, 
  FileCode, 
  Layout, 
  Maximize, 
  MousePointer2,
  Square,
  Grid
} from 'lucide-react';
import { ComponentType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ComponentIcon({ type, className, isMerged }: { type: ComponentType, className?: string, isMerged?: boolean }) {
  switch (type) {
    case 'text': return <Type className={className} />;
    case 'image': return <ImageIcon className={className} />;
    case 'horizontal': return <Columns className={className} />;
    case 'vertical': return <Rows className={className} />;
    case 'table': return <TableIcon className={className} />;
    case 'table-cell': return isMerged ? <Grid className={cn(className, "opacity-50")} /> : <Square className={className} />;
    case 'page': return <FileCode className={className} />;
    case 'header': return <Layout className={className} />;
    case 'footer': return <Layout className={cn(className, "rotate-180")} />;
    case 'body': return <Maximize className={className} />;
    default: return <MousePointer2 className={className} />;
  }
}
