import { useState, useCallback, useEffect } from 'react';
import { 
  ComponentType, 
  ReportNode, 
  ComponentStyles, 
  PageSize, 
  Orientation,
  TableNode,
  TableCellNode,
  LayoutNode,
  HeaderNode,
  BodyNode,
  FooterNode,
  PageNode,
  TextNode,
  ImageNode,
  DataSource,
  DataSourceTable,
  DataSourceColumn
} from '../types';
import { jsonToXml, xmlToJson } from '../utils';

const INITIAL_REPORT: ReportNode = {
  id: 'root',
  type: 'report',
  name: 'Report Root',
  styles: {
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    padding: '40px'
  },
  children: [
    {
      id: 'page-1',
      type: 'page',
      name: 'Page 1',
      showHeader: true,
      showFooter: true,
      pageSize: 'A4',
      orientation: 'portrait',
      styles: {
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      },
      children: [
        {
          id: 'header-1',
          type: 'header',
          name: 'Header',
          styles: {
            height: '60px',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px',
            backgroundColor: '#f8fafc'
          },
          children: []
        },
        {
          id: 'body-1',
          type: 'body',
          name: 'Body',
          styles: {
            flex: '1',
            padding: '20px',
            minHeight: '200px'
          },
          children: []
        },
        {
          id: 'footer-1',
          type: 'footer',
          name: 'Footer',
          styles: {
            height: '40px',
            borderTop: '1px solid #e2e8f0',
            padding: '10px',
            backgroundColor: '#f8fafc'
          },
          children: []
        }
      ]
    }
  ]
};

import { getComponentDefinition } from '../registry';

const INITIAL_DATA_SOURCE: DataSource = {
  url: '',
  tables: [],
  systemFields: [
    { id: 'currentPage', name: '当前页码' },
    { id: 'totalPages', name: '总页码' },
    { id: 'currentTime', name: '当前时间' },
    { id: 'reportName', name: '报表名称' }
  ]
};

export function useReportEditor() {
  const [report, setReport] = useState<ReportNode>(INITIAL_REPORT);
  const [dataSource, setDataSource] = useState<DataSource>(INITIAL_DATA_SOURCE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Helper to find a node by ID
  const findNode = useCallback((node: ReportNode, id: string): ReportNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const getDefaultStyles = useCallback((type: ComponentType): ComponentStyles => {
    try {
      return getComponentDefinition(type).getDefaultStyles();
    } catch (e) {
      return {};
    }
  }, []);

  // Helper to find parent of a node
  const findParent = useCallback((root: ReportNode, childId: string): ReportNode | null => {
    const findRecursive = (parent: ReportNode): ReportNode | null => {
      if (parent.children) {
        for (const child of parent.children) {
          if (child.id === childId) return parent;
          const found = findRecursive(child);
          if (found) return found;
        }
      }
      return null;
    };
    return findRecursive(root);
  }, []);

  const recalculateTableMerges = useCallback((table: TableNode) => {
    const cells = table.children || [];
    const rows = table.rows || 1;
    const cols = table.cols || 1;

    // Reset all merges first
    cells.forEach(cell => {
      cell.isMerged = false;
    });

    // Create a grid to track occupied cells
    const grid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

    cells.forEach(cell => {
      const r = cell.rowIndex || 0;
      const c = cell.colIndex || 0;
      
      // If this cell is already marked as merged by a previous cell's span, skip it
      if (grid[r] && grid[r][c]) {
        cell.isMerged = true;
        return;
      }

      const rowSpan = cell.rowSpan || 1;
      const colSpan = cell.colSpan || 1;

      // Mark the cells covered by this span as occupied
      for (let i = r; i < r + rowSpan; i++) {
        for (let j = c; j < c + colSpan; j++) {
          if (i === r && j === c) continue; // Don't mark the origin cell itself as occupied in the grid for merge check
          if (i < rows && j < cols) {
            grid[i][j] = true;
          }
        }
      }
    });

    // Second pass: mark cells as merged if they are in the grid as occupied
    cells.forEach(cell => {
      const r = cell.rowIndex || 0;
      const c = cell.colIndex || 0;
      if (grid[r] && grid[r][c]) {
        cell.isMerged = true;
      }
    });
  }, []);

  // Helper to update multiple nodes
  const updateNodes = useCallback((ids: string[], updates: Partial<ReportNode>) => {
    setReport(prev => {
      // Deep clone to avoid mutation
      const newReport = JSON.parse(JSON.stringify(prev));
      
      ids.forEach(id => {
        const node = findNode(newReport, id);
        if (node) {
          // Special handling for table rows/cols
          if (node.type === 'table' && ((updates as any).rows !== undefined || (updates as any).cols !== undefined)) {
            const tableNode = node as TableNode;
            const newRows = (updates as any).rows !== undefined ? (updates as any).rows : (tableNode.rows || 1);
            const newCols = (updates as any).cols !== undefined ? (updates as any).cols : (tableNode.cols || 1);
            const targetCount = newRows * newCols;
            const currentChildren = tableNode.children || [];
            
            if (targetCount > currentChildren.length) {
              // Add cells
              const newCells = Array.from({ length: targetCount - currentChildren.length }).map((_, i) => {
                const index = currentChildren.length + i;
                const r = Math.floor(index / newCols);
                const c = index % newCols;
                return {
                  id: `cell-${tableNode.id}-${index + 1}`,
                  type: 'table-cell',
                  name: `Cell ${r + 1}-${c + 1}`,
                  styles: { padding: '5px', border: '1px solid #e2e8f0' },
                  rowIndex: r,
                  colIndex: c,
                  isMerged: false,
                  children: []
                } as TableCellNode;
              });
              tableNode.children = [...currentChildren, ...newCells];
            } else if (targetCount < currentChildren.length) {
              // Remove cells
              tableNode.children = currentChildren.slice(0, targetCount);
            }
            
            // Re-assign indices just in case cols changed
            tableNode.children?.forEach((cell, i) => {
              cell.rowIndex = Math.floor(i / newCols);
              cell.colIndex = i % newCols;
              cell.name = `Cell ${cell.rowIndex + 1}-${cell.colIndex + 1}`;
            });

            // Recalculate merges for the table
            recalculateTableMerges(tableNode);
          }

          // Special handling for table-cell rowSpan/colSpan
          if (node.type === 'table-cell' && ((updates as any).rowSpan !== undefined || (updates as any).colSpan !== undefined)) {
            Object.assign(node, updates);
            const parentTable = findParent(newReport, node.id) as TableNode;
            if (parentTable && parentTable.type === 'table') {
              recalculateTableMerges(parentTable);
            }
          } else {
            // Merge styles if provided
            if (updates.styles) {
              node.styles = { ...node.styles, ...updates.styles };
              const { styles, ...rest } = updates;
              Object.assign(node, rest);
            } else {
              Object.assign(node, updates);
            }
          }
        }
      });
      
      return newReport;
    });
  }, [findNode, findParent, recalculateTableMerges]);

  // Helper to update a node
  const updateNode = useCallback((id: string, updates: Partial<ReportNode>) => {
    updateNodes([id], updates);
  }, [updateNodes]);

  // Helper to delete multiple nodes
  const deleteNodes = useCallback((ids: string[]) => {
    setReport(prev => {
      const newReport = JSON.parse(JSON.stringify(prev));
      const removeRecursive = (parent: ReportNode) => {
        if (parent.children) {
          parent.children = parent.children.filter(child => {
            if (ids.includes(child.id)) return false;
            removeRecursive(child);
            return true;
          });
        }
      };
      removeRecursive(newReport);
      return newReport;
    });
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  }, []);

  // Helper to delete a node
  const deleteNode = useCallback((id: string) => {
    deleteNodes([id]);
  }, [deleteNodes]);

  // Helper to add a node
  const addNode = useCallback((parentId: string, type: ComponentType, initialData?: Partial<ReportNode>) => {
    setReport(prev => {
      const newReport = JSON.parse(JSON.stringify(prev));
      const parent = findNode(newReport, parentId);
      if (parent) {
        const id = Math.random().toString(36).substr(2, 9);
        const def = getComponentDefinition(type);
        const newNode = def.createNode(id, parent);
        
        if (initialData) {
          Object.assign(newNode, initialData);
        }

        parent.children = [...(parent.children || []), newNode];
        setSelectedIds([newNode.id]);
      }
      return newReport;
    });
  }, [findNode]);

  // Helper to move a node
  const moveNode = useCallback((nodeId: string, targetParentId: string, index?: number) => {
    if (nodeId === targetParentId) return;
    
    setReport(prev => {
      const newReport = { ...prev };
      
      const isDescendant = (parent: ReportNode, targetId: string): boolean => {
        if (parent.id === targetId) return true;
        if (parent.children) {
          for (const child of parent.children) {
            if (isDescendant(child, targetId)) return true;
          }
        }
        return false;
      };

      const nodeToMoveSource = findNode(newReport, nodeId);
      if (nodeToMoveSource && isDescendant(nodeToMoveSource, targetParentId)) {
        console.warn("Cannot move a node into its own descendant");
        return prev;
      }

      let nodeToMove: ReportNode | null = null;
      
      const removeRecursive = (parent: ReportNode): boolean => {
        if (parent.children) {
          const foundIndex = parent.children.findIndex(child => child.id === nodeId);
          if (foundIndex !== -1) {
            nodeToMove = parent.children[foundIndex];
            parent.children.splice(foundIndex, 1);
            return true;
          }
          for (const child of parent.children) {
            if (removeRecursive(child)) return true;
          }
        }
        return false;
      };
      
      removeRecursive(newReport);
      
      if (!nodeToMove) return prev;

      const addRecursive = (parent: ReportNode): boolean => {
        if (parent.id === targetParentId) {
          if (!parent.children) parent.children = [];
          if (index !== undefined) {
            (parent.children as any[]).splice(index, 0, nodeToMove!);
          } else {
            (parent.children as any[]).push(nodeToMove!);
          }
          return true;
        }
        if (parent.children) {
          for (const child of parent.children) {
            if (addRecursive(child)) return true;
          }
        }
        return false;
      };
      
      addRecursive(newReport);
      return newReport;
    });
  }, [findNode]);

  const exportXml = useCallback(() => {
    const xml = jsonToXml(report);
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report_layout.xml';
    a.click();
    URL.revokeObjectURL(url);
  }, [report]);

  const importXml = useCallback((content: string) => {
    try {
      const newNode = xmlToJson(content);
      setReport(newNode);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to parse XML", err);
      alert("Invalid XML format");
    }
  }, []);

  const fetchDataSource = useCallback(async (url: string) => {
    setDataSource(prev => ({ ...prev, url }));
    if (!url) return;

    try {
      const response = await fetch(url);
      const xmlText = await response.text();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const tables: DataSourceTable[] = [];
      
      const tableNodes = xmlDoc.getElementsByTagName("table");
      for (let i = 0; i < tableNodes.length; i++) {
        const tableNode = tableNodes[i];
        const columns: DataSourceColumn[] = [];
        const columnNodes = tableNode.getElementsByTagName("column");
        
        for (let j = 0; j < columnNodes.length; j++) {
          const colNode = columnNodes[j];
          columns.push({
            id: colNode.getAttribute("id") || "",
            name: colNode.getAttribute("name") || colNode.getAttribute("Name") || "",
            type: colNode.getAttribute("type") || ""
          });
        }
        
        tables.push({
          id: tableNode.getAttribute("id") || "",
          name: tableNode.getAttribute("name") || "",
          columns
        });
      }
      
      setDataSource(prev => ({ ...prev, tables }));
    } catch (err) {
      console.error("Failed to fetch data source", err);
    }
  }, []);

  return {
    report,
    dataSource,
    fetchDataSource,
    selectedIds,
    setSelectedIds,
    draggedType,
    setDraggedType,
    draggedNodeId,
    setDraggedNodeId,
    isPreview,
    setIsPreview,
    zoom,
    setZoom,
    isTreeCollapsed,
    setIsTreeCollapsed,
    lang,
    setLang,
    theme,
    setTheme,
    updateNode,
    updateNodes,
    deleteNode,
    deleteNodes,
    addNode,
    moveNode,
    exportXml,
    importXml,
    findNode
  };
}
