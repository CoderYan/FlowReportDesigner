import React, { useState } from 'react';
import { DataSourceTable, DataSourceColumn } from '../types';
import { X, GripVertical, Check } from 'lucide-react';
import { cn } from './Icons';

interface TableDropDialogProps {
  table: DataSourceTable;
  onConfirm: (selectedColumns: DataSourceColumn[]) => void;
  onCancel: () => void;
  t: any;
}

export const TableDropDialog: React.FC<TableDropDialogProps> = ({ table, onConfirm, onCancel, t }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(table.columns.map(c => c.id));
  const [columns, setColumns] = useState<DataSourceColumn[]>(table.columns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleColumn = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...columns];
    const draggedItem = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedItem);
    
    setColumns(newColumns);
    setDraggedIndex(index);
  };

  const handleConfirm = () => {
    const selectedColumns = columns.filter(c => selectedIds.includes(c.id));
    onConfirm(selectedColumns);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800">{t.selectColumns || 'Select Columns'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{table.name}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {columns.map((col, index) => (
            <div 
              key={col.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                draggedIndex === index ? "opacity-50 bg-slate-50 border-indigo-200" : "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-sm",
                selectedIds.includes(col.id) ? "border-indigo-100 bg-indigo-50/30" : ""
              )}
            >
              <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded">
                <GripVertical className="w-4 h-4 text-slate-300" />
              </div>
              
              <button 
                onClick={() => toggleColumn(col.id)}
                className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                  selectedIds.includes(col.id) ? "bg-indigo-600 border-indigo-600 shadow-sm" : "border-slate-300 bg-white"
                )}
              >
                {selectedIds.includes(col.id) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{col.name}</div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">{col.id} · {col.type}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-slate-50 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {t.cancel || 'Cancel'}
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-indigo-200"
          >
            {t.confirm || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
