import React, { useState } from 'react';
import { StructureTree } from './StructureTree';
import { DataSourcePanel } from './DataSourcePanel';
import { ReportNode, DataSource } from '../types';
import { ListTree, Database, PanelLeftClose } from 'lucide-react';
import { cn } from './Icons';

interface LeftPanelProps {
  report: ReportNode;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  onMoveNode: (nodeId: string, targetParentId: string, index?: number) => void;
  draggedNodeId: string | null;
  setDraggedNodeId: (id: string | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  dataSource: DataSource;
  onFetchDataSource: (url: string) => void;
  t: any;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  report,
  selectedIds,
  onSelect,
  onDelete,
  onMoveNode,
  draggedNodeId,
  setDraggedNodeId,
  isCollapsed,
  setIsCollapsed,
  dataSource,
  onFetchDataSource,
  t
}) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'datasource'>('structure');

  if (isCollapsed) {
    return (
      <aside className="w-10 border-r bg-white flex flex-col items-center py-4 gap-4 shrink-0 overflow-hidden">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
        >
          <ListTree className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-r bg-white flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center border-b">
        <div className="flex flex-1">
          <button
            onClick={() => setActiveTab('structure')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
              activeTab === 'structure' 
                ? "text-indigo-600 border-indigo-600 bg-indigo-50/30" 
                : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <ListTree className="w-4 h-4" />
            {t.structure}
          </button>
          <button
            onClick={() => setActiveTab('datasource')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
              activeTab === 'datasource' 
                ? "text-indigo-600 border-indigo-600 bg-indigo-50/30" 
                : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Database className="w-4 h-4" />
            {t.dataSource}
          </button>
        </div>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="p-2 mr-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
          title={t.hidePanel || "Hide Panel"}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'structure' ? (
          <StructureTree
            report={report}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onDelete={onDelete}
            onMoveNode={onMoveNode}
            draggedNodeId={draggedNodeId}
            setDraggedNodeId={setDraggedNodeId}
            isCollapsed={false}
            setIsCollapsed={setIsCollapsed}
            t={t}
          />
        ) : (
          <DataSourcePanel
            dataSource={dataSource}
            onFetch={onFetchDataSource}
            t={t}
          />
        )}
      </div>
    </aside>
  );
};
