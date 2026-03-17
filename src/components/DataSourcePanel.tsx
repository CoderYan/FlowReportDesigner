import React, { useState } from 'react';
import { DataSource, DataSourceTable } from '../types';
import { Database, ChevronRight, ChevronDown, Settings, Table as TableIcon, List, ArrowRight } from 'lucide-react';
import { cn } from './Icons';

interface DataSourcePanelProps {
  dataSource: DataSource;
  onFetch: (url: string) => void;
  t: any;
}

export const DataSourcePanel: React.FC<DataSourcePanelProps> = ({ dataSource, onFetch, t }) => {
  const [url, setUrl] = useState(dataSource.url);
  const [expandedTables, setExpandedTables] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['tables', 'system']);

  const toggleTable = (id: string) => {
    setExpandedTables(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.dataSourceUrl}
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
          />
          <button
            onClick={() => onFetch(url)}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center"
            title={t.fetchData}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Tables Section */}
        <div className="mb-4">
          <button 
            onClick={() => toggleSection('tables')}
            className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
          >
            {expandedSections.includes('tables') ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            <Database className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-700">{t.tables}</span>
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
              {dataSource.tables.length}
            </span>
          </button>
          
          {expandedSections.includes('tables') && (
            <div className="mt-1 ml-4 space-y-1">
              {dataSource.tables.map(table => (
                <div key={table.id} className="rounded-lg overflow-hidden">
                  <button 
                    onClick={() => toggleTable(table.id)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('dataSourceTable', JSON.stringify(table));
                    }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 transition-colors text-left cursor-grab active:cursor-grabbing"
                  >
                    {expandedTables.includes(table.id) ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                    <TableIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-slate-600">{table.name}</span>
                  </button>
                  
                  {expandedTables.includes(table.id) && (
                    <div className="ml-6 border-l border-slate-100 pl-2 py-1 space-y-1">
                      {table.columns.map(col => (
                        <div 
                          key={col.id} 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('dataSourceField', `{${table.name || table.id}.${col.name || col.id}}`);
                            e.dataTransfer.setData('dataSourceLabel', col.name);
                          }}
                          className="flex items-center gap-2 p-1.5 text-[11px] text-slate-500 hover:text-indigo-600 transition-colors cursor-grab active:cursor-grabbing group"
                        >
                          <List className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                          <span className="font-mono">{col.id}</span>
                          <span className="text-slate-300">|</span>
                          <span>{col.name}</span>
                          <span className="ml-auto text-[9px] text-slate-400 bg-slate-50 px-1 rounded uppercase">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {dataSource.tables.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs italic">
                  No tables loaded
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Fields Section */}
        <div>
          <button 
            onClick={() => toggleSection('system')}
            className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
          >
            {expandedSections.includes('system') ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            <Settings className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">{t.systemFields}</span>
          </button>
          
          {expandedSections.includes('system') && (
            <div className="mt-1 ml-4 space-y-1">
              {dataSource.systemFields.map(field => (
                <div 
                  key={field.id} 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('dataSourceField', `{${field.id}}`);
                    e.dataTransfer.setData('dataSourceLabel', field.name);
                  }}
                  className="flex items-center gap-2 p-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-grab active:cursor-grabbing group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="font-mono text-indigo-600">{`{${field.id}}`}</span>
                  <span className="text-slate-400">-</span>
                  <span>{field.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
