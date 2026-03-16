import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Columns, 
  Rows, 
  Table as TableIcon, 
  Plus,
  Database
} from 'lucide-react';
import { ComponentType } from '../types';
import { cn } from './Icons';

interface SidebarProps {
  onDragStart: (type: ComponentType) => void;
  onDragEnd: () => void;
  onAddPage: () => void;
  t: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ onDragStart, onDragEnd, onAddPage, t }) => {
  return (
    <aside className="w-20 border-r bg-white flex flex-col items-center py-6 gap-6 shrink-0 shadow-sm z-10">
      <ToolboxItem type="text" icon={<Type />} label={t.text} onDragStart={() => onDragStart('text')} onDragEnd={onDragEnd} />
      <ToolboxItem type="image" icon={<ImageIcon />} label={t.image} onDragStart={() => onDragStart('image')} onDragEnd={onDragEnd} />
      <div className="w-10 h-px bg-slate-100 my-1" />
      <ToolboxItem type="horizontal" icon={<Columns />} label={t.hLayout} onDragStart={() => onDragStart('horizontal')} onDragEnd={onDragEnd} />
      <ToolboxItem type="vertical" icon={<Rows />} label={t.vLayout} onDragStart={() => onDragStart('vertical')} onDragEnd={onDragEnd} />
      <ToolboxItem type="table" icon={<TableIcon />} label={t.table} onDragStart={() => onDragStart('table')} onDragEnd={onDragEnd} />
      
      <div className="mt-auto">
        <button 
          onClick={onAddPage}
          className="group flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-200 border border-indigo-100">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">{t.addPage}</span>
        </button>
      </div>
    </aside>
  );
};

function ToolboxItem({ type, icon, label, onDragStart, onDragEnd }: { type: ComponentType, icon: React.ReactNode, label: string, onDragStart: () => void, onDragEnd: () => void }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('componentType', type);
    onDragStart();
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="group flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-transparent group-hover:border-indigo-100">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <span className="text-[10px] font-medium text-slate-400 group-hover:text-indigo-600">{label}</span>
    </div>
  );
}
