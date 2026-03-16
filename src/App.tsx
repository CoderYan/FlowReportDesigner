/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useReportEditor } from './hooks/useReportEditor';
import { TRANSLATIONS } from './langs';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LeftPanel } from './components/LeftPanel';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { cn } from './components/Icons';
import { ComponentType, ReportNode } from './types';

export default function App() {
  const {
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
  } = useReportEditor();

  const t = TRANSLATIONS[lang];

  // Keyboard listener for Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedIds.length > 0 && !isPreview) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        deleteNodes(selectedIds);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, isPreview, deleteNodes]);

  const selectedNodes = selectedIds.map(id => findNode(report, id)).filter(Boolean) as ReportNode[];

  // Helper to find parent type
  const getParentType = (root: ReportNode, childId: string): ComponentType | undefined => {
    const findRecursive = (parent: ReportNode): ComponentType | undefined => {
      if (parent.children) {
        for (const child of parent.children) {
          if (child.id === childId) return parent.type;
          const found = findRecursive(child);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findRecursive(root);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const content = re.target?.result as string;
          importXml(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSelect = (id: string, multi?: boolean) => {
    if (multi) {
      setSelectedIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(i => i !== id);
        } else {
          return [...prev, id];
        }
      });
    } else {
      setSelectedIds([id]);
    }
  };

  return (
    <div className={cn("flex flex-col h-screen overflow-hidden transition-colors", theme === 'dark' ? "bg-slate-900 text-slate-100" : "bg-slate-100 text-slate-900")}>
      <Header 
        t={t}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        zoom={zoom}
        setZoom={setZoom}
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        onImport={handleImport}
        onExport={exportXml}
      />

      <div className="flex flex-1 overflow-hidden">
        {!isPreview && (
          <>
            <Sidebar 
              onDragStart={setDraggedType}
              onDragEnd={() => setDraggedType(null)}
              onAddPage={() => addNode('root', 'page')}
              t={t}
            />
            <LeftPanel
              report={report}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onDelete={deleteNode}
              onMoveNode={moveNode}
              draggedNodeId={draggedNodeId}
              setDraggedNodeId={setDraggedNodeId}
              isCollapsed={isTreeCollapsed}
              setIsCollapsed={setIsTreeCollapsed}
              dataSource={dataSource}
              onFetchDataSource={fetchDataSource}
              t={t}
            />
          </>
        )}

        <Canvas 
          report={report}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onAdd={addNode}
          onDropNode={addNode}
          onUpdateNode={updateNode}
          isPreview={isPreview}
          zoom={zoom}
          draggedType={draggedType}
          setDraggedType={setDraggedType}
        />

        {!isPreview && (
          <aside className="w-72 border-l bg-white flex flex-col shrink-0">
            <div className="p-3 border-b flex items-center gap-2 font-medium text-slate-700">
              <span className="text-sm font-bold uppercase tracking-wider">{t.properties}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedNodes.length > 0 ? (
                <PropertyPanel 
                  nodes={selectedNodes} 
                  onUpdate={(updates) => updateNodes(selectedIds, updates)} 
                  parentType={selectedNodes.length === 1 ? getParentType(report, selectedNodes[0].id) : undefined}
                  t={t}
                />
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                  {t.selectToEdit}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
