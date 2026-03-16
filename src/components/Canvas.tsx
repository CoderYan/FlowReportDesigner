import React, { useState } from 'react';
import { ReportNode, ComponentType, PAGE_DIMENSIONS, ComponentStyles } from '../types';
import { cn, ComponentIcon } from './Icons';

interface CanvasProps {
  report: ReportNode;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onAdd: (parentId: string, type: ComponentType, initialData?: any) => void;
  onDropNode: (parentId: string, type: ComponentType, initialData?: any) => void;
  onDropTable: (table: any, parentId: string, isExistingTable: boolean) => void;
  onUpdateNode: (id: string, updates: any) => void;
  isPreview: boolean;
  zoom: number;
  draggedType: ComponentType | null;
  setDraggedType: (t: ComponentType | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  report,
  selectedIds,
  onSelect,
  onAdd,
  onDropNode,
  onDropTable,
  onUpdateNode,
  isPreview,
  zoom,
  draggedType,
  setDraggedType
}) => {
  return (
    <main 
      className={cn(
        "flex-1 overflow-auto bg-slate-100 flex justify-center items-start relative transition-all",
        isPreview ? "p-0 bg-white" : "p-16"
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        // Only trigger if dropped directly on the main canvas background
        if (e.target !== e.currentTarget) return;
        
        if (draggedType) {
          if (draggedType === 'page') {
            onAdd('root', 'page');
          } else if (report.children && report.children.length > 0) {
            const firstPage = report.children[0];
            const body = (firstPage as any).children?.find((c: any) => c.type === 'body');
            if (body) onAdd(body.id, draggedType);
          }
        }
      }}
    >
      <div 
        style={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: 'top center',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          paddingBottom: '100px'
        }}
      >
        {report.children?.map(page => {
          const pSize = (page as any).pageSize || 'A4';
          const pOrient = (page as any).orientation || 'portrait';
          return (
            <div 
              key={page.id}
              style={{ 
                width: pOrient === 'portrait' ? `${PAGE_DIMENSIONS[pSize].width}mm` : `${PAGE_DIMENSIONS[pSize].height}mm`,
                height: pOrient === 'portrait' ? `${PAGE_DIMENSIONS[pSize].height}mm` : `${PAGE_DIMENSIONS[pSize].width}mm`
              }}
              className={cn(
                "bg-white transition-all",
                isPreview ? "shadow-none" : "shadow-2xl rounded-sm relative overflow-hidden"
              )}
            >
              <CanvasNode 
                node={page} 
                report={report}
                selectedIds={isPreview ? [] : selectedIds} 
                onSelect={onSelect} 
                onAdd={onAdd}
                onDropNode={onDropNode}
                onDropTable={onDropTable}
                onUpdateNode={onUpdateNode}
                isPreview={isPreview}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
};

interface CanvasNodeProps {
  node: ReportNode;
  report: ReportNode;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onAdd: (parentId: string, type: ComponentType, initialData?: any) => void;
  onDropNode: (parentId: string, type: ComponentType, initialData?: any) => void;
  onDropTable: (table: any, parentId: string, isExistingTable: boolean) => void;
  onUpdateNode: (id: string, updates: any) => void;
  isPreview: boolean;
}

const formatStyleValue = (value: any) => {
  if (typeof value !== 'string' || !value) return value;
  return value.split(/\s+/).map(part => {
    if (/^\d+(\.\d+)?$/.test(part)) {
      return `${part}pt`;
    }
    return part;
  }).join(' ');
};

const ptProperties: (keyof ComponentStyles)[] = [
  'padding', 'margin', 'width', 'height', 'minHeight', 
  'fontSize', 'borderWidth', 'borderRadius', 'gap'
];

const getFormattedStyles = (styles: ComponentStyles) => {
  const formatted: any = { ...styles };
  ptProperties.forEach(prop => {
    const value = formatted[prop];
    if (value) {
      if ((prop === 'width' || prop === 'height') && (value === '*' || /^\d+\*$/.test(value))) {
        formatted[prop] = '100%';
      } else {
        formatted[prop] = formatStyleValue(value);
      }
    }
  });
  return formatted;
};

import { getComponentDefinition } from '../registry';

const CanvasNode: React.FC<CanvasNodeProps> = ({ node, report, selectedIds, onSelect, onAdd, onDropNode, onDropTable, onUpdateNode, isPreview }) => {
  const isSelected = selectedIds.includes(node.id);
  const isMerged = (node as any).isMerged;
  const def = getComponentDefinition(node.type);
  const isContainer = def.isContainer && !isMerged;
  const [isOver, setIsOver] = useState(false);

  const parseWidth = (w?: string) => {
    if (!w) return undefined;
    if (w === '*') return '1 1 0%';
    const match = w.match(/^(\d+)\*$/);
    if (match) return `${match[1]} ${match[1]} 0%`;
    return undefined;
  };

  const flexStyle = parseWidth(node.styles.width);

  const layoutStyles: React.CSSProperties = {
    ...(flexStyle ? { flex: flexStyle } : {}),
    ...(node.type === 'table-cell' ? { 
      gridColumn: `${((node as any).colIndex || 0) + 1} / span ${((node as any).colSpan || 1)}`,
      gridRow: `${((node as any).rowIndex || 0) + 1} / span ${((node as any).rowSpan || 1)}`,
      display: isMerged ? 'none' : undefined
    } : {
      ...((node as any).colSpan ? { gridColumn: `span ${(node as any).colSpan}` } : {}),
      ...((node as any).rowSpan ? { gridRow: `span ${(node as any).rowSpan}` } : {}),
    }),
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    onSelect(node.id, e.shiftKey || e.ctrlKey || e.metaKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isContainer || node.type === 'text' || node.type === 'image' || node.type === 'table') {
      e.preventDefault();
      e.stopPropagation();
      setIsOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const getNearestTableDataSource = (root: ReportNode, nodeId: string): string | undefined => {
    let currentId = nodeId;
    while (currentId) {
      const node = findNodeById(root, currentId);
      if (node?.type === 'table') {
        return (node as any).dataSource;
      }
      currentId = getParentId(root, currentId) || '';
    }
    return undefined;
  };

  const findNodeById = (root: ReportNode, id: string): ReportNode | undefined => {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return undefined;
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    const dataSourceTableStr = e.dataTransfer.getData('dataSourceTable');
    if (dataSourceTableStr) {
      const table = JSON.parse(dataSourceTableStr);
      
      // If dropped on table-cell or something inside it, bind to the parent table
      let currentId = node.id;
      let currentNode: ReportNode | undefined = node;
      
      while (currentNode) {
        if (currentNode.type === 'table') {
          onDropTable(table, currentNode.id, true);
          return;
        }
        if (currentNode.type === 'table-cell') {
          const parentTableId = getParentId(report, currentNode.id);
          if (parentTableId) {
            onDropTable(table, parentTableId, true);
            return;
          }
        }
        const parentId = getParentId(report, currentId);
        if (!parentId) break;
        currentId = parentId;
        currentNode = findNodeById(report, currentId);
      }

      onDropTable(table, node.id, node.type === 'table');
      return;
    }

    let dataSourceField = e.dataTransfer.getData('dataSourceField');
    if (dataSourceField) {
      // Simplify if inside a table with dataSource
      const tableDataSource = getNearestTableDataSource(report, node.id);
      if (tableDataSource) {
        const prefix = `{${tableDataSource}.`;
        if (dataSourceField.startsWith(prefix)) {
          dataSourceField = '{' + dataSourceField.substring(prefix.length);
        }
      }

      if (node.type === 'text') {
        onUpdateNode(node.id, { content: dataSourceField });
      } else if (node.type === 'image') {
        onUpdateNode(node.id, { src: dataSourceField });
      } else if (isContainer) {
        onDropNode(node.id, 'text', { content: dataSourceField });
      }
      return;
    }

    if (isContainer) {
      const type = e.dataTransfer.getData('componentType') as ComponentType;
      if (type) onDropNode(node.id, type);
    }
  };

  const renderContent = () => {
    const formattedStyles = getFormattedStyles(node.styles);
    const combinedStyles: React.CSSProperties = {
      ...formattedStyles,
      // Granular border support
      ...(formattedStyles.borderWidth ? { borderWidth: formattedStyles.borderWidth } : {}),
      ...(formattedStyles.borderStyle ? { borderStyle: formattedStyles.borderStyle } : {}),
      ...(formattedStyles.borderColor ? { borderColor: formattedStyles.borderColor } : {}),
    };

    return def.render({
      node,
      report,
      combinedStyles,
      selectedIds,
      onSelect,
      onAdd,
      onDropNode,
      onDropTable,
      onUpdateNode,
      isPreview,
      isOver,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      CanvasNode
    });
  };

  return (
    <div 
      className={cn(
        "relative group transition-all",
        !isPreview && isSelected && "ring-2 ring-indigo-500 ring-offset-2 z-10",
        !isPreview && !isSelected && "hover:ring-1 hover:ring-indigo-300",
        isMerged && "hidden"
      )}
      style={layoutStyles}
      onClick={handleClick}
    >
      {renderContent()}
      {!isPreview && isSelected && (
        <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-t font-medium flex items-center gap-1">
          <ComponentIcon type={node.type} className="w-3 h-3" isMerged={(node as any).isMerged} />
          {node.name}
        </div>
      )}
    </div>
  );
};
