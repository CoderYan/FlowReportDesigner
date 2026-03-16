import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Trash2
} from 'lucide-react';
import { ReportNode, ComponentType } from '../types';
import { cn, ComponentIcon } from './Icons';

interface StructureTreeProps {
  report: ReportNode;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  onMoveNode: (nodeId: string, targetParentId: string, index?: number) => void;
  draggedNodeId: string | null;
  setDraggedNodeId: (id: string | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  t: any;
}

export const StructureTree: React.FC<StructureTreeProps> = ({
  report,
  selectedIds,
  onSelect,
  onDelete,
  onMoveNode,
  draggedNodeId,
  setDraggedNodeId,
  isCollapsed,
  setIsCollapsed,
  t
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      <TreeNode 
        node={report} 
        selectedIds={selectedIds} 
        onSelect={onSelect} 
        onDelete={onDelete}
        onMoveNode={onMoveNode}
        draggedNodeId={draggedNodeId}
        setDraggedNodeId={setDraggedNodeId}
        report={report}
      />
    </div>
  );
};

interface TreeNodeProps {
  node: ReportNode;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  onMoveNode: (nodeId: string, targetParentId: string, index?: number) => void;
  draggedNodeId: string | null;
  setDraggedNodeId: (id: string | null) => void;
  report: ReportNode;
  depth?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  selectedIds, 
  onSelect, 
  onDelete, 
  onMoveNode,
  draggedNodeId,
  setDraggedNodeId,
  report,
  depth = 0 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isOver, setIsOver] = useState(false);
  const isSelected = selectedIds.includes(node.id);
  const isContainer = ['horizontal', 'vertical', 'table', 'header', 'footer', 'body', 'table-cell'].includes(node.type) && !(node as any).isMerged;

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedNodeId(node.id);
    e.dataTransfer.setData('nodeId', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (draggedNodeId && draggedNodeId !== node.id) {
      e.preventDefault();
      e.stopPropagation();
      setIsOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId && nodeId !== node.id) {
      if (isContainer) {
        onMoveNode(nodeId, node.id);
      } else {
        const parentId = getParentId(report, node.id);
        if (parentId) {
          onMoveNode(nodeId, parentId);
        }
      }
    }
    setDraggedNodeId(null);
  };

  return (
    <div 
      className={cn(
        "select-none",
        isOver && "bg-indigo-100 rounded"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        draggable={node.id !== 'root' && node.type !== 'table-cell'}
        onDragStart={handleDragStart}
        className={cn(
          "flex items-center gap-1 py-1 px-2 rounded cursor-pointer text-sm transition-colors group",
          isSelected ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-slate-50 text-slate-600"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={(e) => onSelect(node.id, e.shiftKey || e.ctrlKey || e.metaKey)}
      >
        <div className="w-4 h-4 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
          {node.children ? (isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />) : null}
        </div>
        <ComponentIcon type={node.type} className="w-3.5 h-3.5 opacity-70" isMerged={(node as any).isMerged} />
        <span className="truncate flex-1">{node.name}</span>
        {isSelected && !['root', 'header', 'footer', 'body', 'table-cell'].includes(node.type) && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-slate-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      {isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              selectedIds={selectedIds} 
              onSelect={onSelect} 
              onDelete={onDelete} 
              onMoveNode={onMoveNode}
              draggedNodeId={draggedNodeId}
              setDraggedNodeId={setDraggedNodeId}
              report={report}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const getParentId = (root: ReportNode, childId: string): string | undefined => {
  const findRecursive = (parent: ReportNode): string | undefined => {
    if (parent.children) {
      for (const child of parent.children) {
        if (child.id === childId) return parent.id;
        const found = findRecursive(child);
        if (found) return found;
      }
    }
    return undefined;
  };
  return findRecursive(root);
};
