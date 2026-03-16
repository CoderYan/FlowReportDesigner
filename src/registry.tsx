import React from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  AlignStartVertical, AlignCenterVertical, AlignEndVertical 
} from 'lucide-react';
import { 
  ReportNode, 
  ComponentType, 
  ComponentStyles, 
  TextNode, 
  ImageNode, 
  TableNode, 
  TableCellNode, 
  LayoutNode,
  PageNode,
  HeaderNode,
  BodyNode,
  FooterNode,
  DataSource
} from './types';
import { cn } from './components/Icons';

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  isContainer: boolean;
  getDefaultStyles: () => ComponentStyles;
  createNode: (id: string, parent?: ReportNode) => ReportNode;
  render: (props: { 
    node: ReportNode; 
    report: ReportNode;
    combinedStyles: React.CSSProperties; 
    selectedIds: string[];
    onSelect: (id: string, multi?: boolean) => void;
    onAdd: (parentId: string, type: ComponentType, initialData?: any) => void;
    onDropNode: (parentId: string, type: ComponentType, initialData?: any) => void;
    onDropTable: (table: any, parentId: string, isExistingTable: boolean) => void;
    onUpdateNode: (id: string, updates: any) => void;
    isPreview: boolean;
    isOver: boolean;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: () => void;
    handleDrop: (e: React.DragEvent) => void;
    CanvasNode: React.FC<any>;
  }) => React.ReactNode;
  renderProperties?: (props: {
    nodes: ReportNode[];
    onUpdate: (updates: Partial<ReportNode>) => void;
    handleStyleChange: (key: keyof ComponentStyles, value: any) => void;
    getCommonValue: (getValue: (n: ReportNode) => any) => any;
    dataSource: DataSource;
    t: any;
    Components: {
      PropertyInput: React.FC<any>;
      PropertySelect: React.FC<any>;
      PropertyTextArea: React.FC<any>;
    };
  }) => React.ReactNode;
}

const registry: Partial<Record<ComponentType, ComponentDefinition>> = {};

export function registerComponent(def: ComponentDefinition) {
  registry[def.type] = def;
}

export function getComponentDefinition(type: ComponentType): ComponentDefinition {
  const def = registry[type];
  if (!def) {
    throw new Error(`Component type "${type}" is not registered.`);
  }
  return def;
}

export function getAllComponentTypes(): ComponentType[] {
  return Object.keys(registry) as ComponentType[];
}

// Register Text Component
registerComponent({
  type: 'text',
  name: 'Text',
  isContainer: false,
  getDefaultStyles: () => ({ fontSize: '16px', color: '#000000', textAlign: 'left', padding: '4px' }),
  createNode: (id) => ({
    id,
    type: 'text',
    name: 'New Text',
    styles: { fontSize: '16px', color: '#000000', textAlign: 'left', padding: '4px' },
    content: 'New Text',
  } as TextNode),
  render: ({ node, report, combinedStyles, onUpdateNode, isOver, handleDragOver, handleDragLeave, handleDrop, onDropTable }) => {
    const textStyles: React.CSSProperties = {
      ...combinedStyles,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: node.styles.verticalAlign === 'middle' ? 'center' : node.styles.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
      alignItems: 'stretch',
    };
    return (
      <div 
        style={textStyles}
        className={cn(
          "transition-all",
          isOver && "ring-2 ring-indigo-400 ring-inset bg-indigo-50/30"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={{ 
          textAlign: node.styles.textAlign || 'left',
          width: '100%',
          wordBreak: 'break-word'
        }}>
          {(node as TextNode).content}
        </div>
      </div>
    );
  },
  renderProperties: ({ nodes, getCommonValue, onUpdate, handleStyleChange, Components, t }) => {
    const node = nodes[0];
    const toggleTextDecoration = (value: string) => {
      const current = node.styles.textDecoration || '';
      const decorations = current.split(' ').filter(d => d && d !== 'none');
      if (decorations.includes(value)) {
        const filtered = decorations.filter(d => d !== value);
        handleStyleChange('textDecoration', filtered.length > 0 ? filtered.join(' ') : 'none');
      } else {
        handleStyleChange('textDecoration', [...decorations, value].join(' '));
      }
    };

    return (
      <>
        <Components.PropertyTextArea 
          label={t.content} 
          value={getCommonValue(n => (n as any).content || '')} 
          onChange={(v: string) => onUpdate({ content: v })} 
        />
        <section>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.typography}</label>
          <div className="flex flex-col gap-3">
            <Components.PropertySelect 
              label={t.fontFamily} 
              value={getCommonValue(n => n.styles.fontFamily || 'Inter')} 
              options={['Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Microsoft YaHei', 'SimSun']} 
              onChange={(v: string) => handleStyleChange('fontFamily', v)} 
            />
            <Components.PropertyInput label={t.fontSize} value={getCommonValue(n => n.styles.fontSize || '')} onChange={(v: string) => handleStyleChange('fontSize', v)} />
            
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">{t.alignment}</span>
              <div className="flex gap-1">
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex-1">
                  {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => handleStyleChange('textAlign', align)}
                      className={cn(
                        "flex-1 py-1 text-xs rounded transition-all flex items-center justify-center",
                        getCommonValue(n => n.styles.textAlign) === align ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                      )}
                      title={align}
                    >
                      {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                      {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                      {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex-1">
                  {(['top', 'middle', 'bottom'] as const).map((vAlign) => (
                    <button
                      key={vAlign}
                      onClick={() => handleStyleChange('verticalAlign', vAlign)}
                      className={cn(
                        "flex-1 py-1 text-xs rounded transition-all flex items-center justify-center",
                        getCommonValue(n => n.styles.verticalAlign || 'top') === vAlign ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                      )}
                      title={vAlign}
                    >
                      {vAlign === 'top' && <AlignStartVertical className="w-3.5 h-3.5" />}
                      {vAlign === 'middle' && <AlignCenterVertical className="w-3.5 h-3.5" />}
                      {vAlign === 'bottom' && <AlignEndVertical className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">{t.edit}</span>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg gap-1">
                <button
                  onClick={() => handleStyleChange('fontWeight', node.styles.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={cn(
                    "flex-1 py-1 rounded transition-all flex items-center justify-center",
                    getCommonValue(n => n.styles.fontWeight) === 'bold' ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStyleChange('fontStyle', node.styles.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={cn(
                    "flex-1 py-1 rounded transition-all flex items-center justify-center",
                    getCommonValue(n => n.styles.fontStyle) === 'italic' ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleTextDecoration('underline')}
                  className={cn(
                    "flex-1 py-1 rounded transition-all flex items-center justify-center",
                    getCommonValue(n => n.styles.textDecoration)?.includes('underline') ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleTextDecoration('line-through')}
                  className={cn(
                    "flex-1 py-1 rounded transition-all flex items-center justify-center",
                    getCommonValue(n => n.styles.textDecoration)?.includes('line-through') ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <Components.PropertyInput 
              label={t.textColor} 
              type="color" 
              value={getCommonValue(n => n.styles.color || '#000000')} 
              onChange={(v: string) => handleStyleChange('color', v)} 
              onClear={() => handleStyleChange('color', undefined)}
              t={t}
            />
          </div>
        </section>
      </>
    );
  }
});

// Register Image Component
registerComponent({
  type: 'image',
  name: 'Image',
  isContainer: false,
  getDefaultStyles: () => ({ width: '100%', height: 'auto', borderRadius: '4px' }),
  createNode: (id) => ({
    id,
    type: 'image',
    name: 'New Image',
    styles: { width: '100%', height: 'auto', borderRadius: '4px' },
    src: 'https://picsum.photos/seed/report/400/300',
  } as ImageNode),
  render: ({ node, report, combinedStyles, onUpdateNode, isOver, handleDragOver, handleDragLeave, handleDrop, onDropTable }) => (
    <img 
      src={(node as ImageNode).src} 
      alt={node.name} 
      style={combinedStyles} 
      referrerPolicy="no-referrer"
      className={cn(
        "transition-all",
        isOver && "ring-2 ring-indigo-400 ring-inset bg-indigo-50/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  ),
  renderProperties: ({ getCommonValue, onUpdate, Components, t }) => (
    <Components.PropertyInput 
      label={t.imageUrl} 
      value={getCommonValue(n => (n as any).src || '')} 
      onChange={(v: string) => onUpdate({ src: v })} 
    />
  )
});

// Register Layout Components (Horizontal/Vertical)
const createLayoutRender = (type: 'horizontal' | 'vertical') => {
  return ({ node, report, combinedStyles, isOver, handleDragOver, handleDragLeave, handleDrop, CanvasNode, selectedIds, onSelect, onAdd, onDropNode, onDropTable, onUpdateNode, isPreview }: any) => (
    <div 
      style={{
        display: 'flex',
        flexDirection: type === 'horizontal' ? 'row' : 'column',
        minHeight: '40px',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        ...combinedStyles,
      }} 
      className={cn(
        "relative transition-all",
        isOver && "ring-2 ring-indigo-400 ring-inset bg-indigo-50/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {node.children?.map((child: any) => (
        <CanvasNode 
          key={child.id} 
          node={child} 
          report={report}
          selectedIds={selectedIds} 
          onSelect={onSelect} 
          onAdd={onAdd}
          onDropNode={onDropNode}
          onDropTable={onDropTable}
          onUpdateNode={onUpdateNode}
          isPreview={isPreview}
        />
      ))}
      {node.children?.length === 0 && !isPreview && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-[10px] pointer-events-none uppercase tracking-widest font-bold">
          {type}
        </div>
      )}
    </div>
  );
};

registerComponent({
  type: 'horizontal',
  name: 'H-Layout',
  isContainer: true,
  getDefaultStyles: () => ({ display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px', borderWidth: '1px', borderStyle: 'dashed', borderColor: '#e2e8f0' }),
  createNode: (id) => ({
    id,
    type: 'horizontal',
    name: 'New H-Layout',
    styles: { display: 'flex', flexDirection: 'row', gap: '10px', padding: '10px', borderWidth: '1px', borderStyle: 'dashed', borderColor: '#e2e8f0' },
    children: [],
  } as LayoutNode),
  render: createLayoutRender('horizontal'),
  renderProperties: ({ getCommonValue, handleStyleChange, Components, t }) => (
    <section>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.flexbox}</label>
      <div className="flex flex-col gap-3">
        <Components.PropertyInput label={t.gap} value={getCommonValue(n => n.styles.gap || '')} onChange={(v: string) => handleStyleChange('gap', v)} />
        <Components.PropertySelect 
          label={t.justify} 
          value={getCommonValue(n => n.styles.justifyContent || 'flex-start')} 
          options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around']} 
          onChange={(v: string) => handleStyleChange('justifyContent', v)} 
        />
        <Components.PropertySelect 
          label={t.align} 
          value={getCommonValue(n => n.styles.alignItems || 'stretch')} 
          options={['stretch', 'flex-start', 'center', 'flex-end']} 
          onChange={(v: string) => handleStyleChange('alignItems', v)} 
        />
      </div>
    </section>
  )
});

registerComponent({
  type: 'vertical',
  name: 'V-Layout',
  isContainer: true,
  getDefaultStyles: () => ({ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', borderWidth: '1px', borderStyle: 'dashed', borderColor: '#e2e8f0' }),
  createNode: (id) => ({
    id,
    type: 'vertical',
    name: 'New V-Layout',
    styles: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', borderWidth: '1px', borderStyle: 'dashed', borderColor: '#e2e8f0' },
    children: [],
  } as LayoutNode),
  render: createLayoutRender('vertical'),
  renderProperties: ({ getCommonValue, handleStyleChange, Components, t }) => (
    <section>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.flexbox}</label>
      <div className="flex flex-col gap-3">
        <Components.PropertyInput label={t.gap} value={getCommonValue(n => n.styles.gap || '')} onChange={(v: string) => handleStyleChange('gap', v)} />
        <Components.PropertySelect 
          label={t.justify} 
          value={getCommonValue(n => n.styles.justifyContent || 'flex-start')} 
          options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around']} 
          onChange={(v: string) => handleStyleChange('justifyContent', v)} 
        />
        <Components.PropertySelect 
          label={t.align} 
          value={getCommonValue(n => n.styles.alignItems || 'stretch')} 
          options={['stretch', 'flex-start', 'center', 'flex-end']} 
          onChange={(v: string) => handleStyleChange('alignItems', v)} 
        />
      </div>
    </section>
  )
});

// Register Table Component
registerComponent({
  type: 'table',
  name: 'Table',
  isContainer: true,
  getDefaultStyles: () => ({ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '0px', 
    backgroundColor: '#e2e8f0', 
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    minHeight: '100px'
  }),
  createNode: (id) => {
    const rows = 2;
    const cols = 2;
    return {
      id,
      type: 'table',
      name: 'New Table',
      rows,
      cols,
      styles: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '0px', 
        backgroundColor: '#e2e8f0', 
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e2e8f0',
        minHeight: '100px'
      },
      children: Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return {
          id: `cell-${id}-${i + 1}`,
          type: 'table-cell',
          name: `Cell ${r + 1}-${c + 1}`,
          styles: { padding: '5px', border: '1px solid #e2e8f0' },
          rowIndex: r,
          colIndex: c,
          isMerged: false,
          children: []
        } as TableCellNode;
      })
    } as TableNode;
  },
  render: ({ node, report, combinedStyles, isOver, handleDragOver, handleDragLeave, handleDrop, CanvasNode, selectedIds, onSelect, onAdd, onDropNode, onDropTable, onUpdateNode, isPreview }) => (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: combinedStyles.gridTemplateColumns || `repeat(${(node as TableNode).cols || 1}, 1fr)`,
        gridAutoRows: 'minmax(40px, auto)',
        width: '100%',
        backgroundColor: '#e2e8f0',
        gap: '0px',
        border: '1px solid #e2e8f0',
        ...combinedStyles,
      }} 
      className={cn(
        "relative min-h-[40px] transition-all",
        isOver && "ring-2 ring-indigo-400 ring-inset bg-indigo-50/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {node.children?.map(child => (
        <CanvasNode 
          key={child.id} 
          node={child} 
          report={report}
          selectedIds={selectedIds} 
          onSelect={onSelect} 
          onAdd={onAdd}
          onDropNode={onDropNode}
          onDropTable={onDropTable}
          onUpdateNode={onUpdateNode}
          isPreview={isPreview}
        />
      ))}
      {(!node.children || node.children.length === 0) && !isPreview && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-[10px] pointer-events-none uppercase tracking-widest font-bold">
          Empty Table
        </div>
      )}
    </div>
  ),
  renderProperties: ({ getCommonValue, onUpdate, handleStyleChange, dataSource, Components, t }) => (
    <section>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.table}</label>
      <div className="flex flex-col gap-3">
        <Components.PropertySelect 
          label={t.dataSource} 
          value={getCommonValue(n => (n as any).dataSource || '')} 
          options={['', ...dataSource.tables.map(table => table.id)]} 
          onChange={(v: string) => onUpdate({ dataSource: v })} 
        />
        <div className="grid grid-cols-2 gap-3">
          <Components.PropertyInput 
            label={t.rows} 
            type="number" 
            value={String(getCommonValue(n => (n as any).rows || 1))} 
            onChange={(v: string) => onUpdate({ rows: parseInt(v) || 1 })} 
          />
          <Components.PropertyInput 
            label={t.cols} 
            type="number" 
            value={String(getCommonValue(n => (n as any).cols || 1))} 
            onChange={(v: string) => {
              const newCols = parseInt(v) || 1;
              onUpdate({ 
                cols: newCols,
                styles: {
                  gridTemplateColumns: `repeat(${newCols}, 1fr)`
                }
              });
            }} 
          />
        </div>
        <Components.PropertyInput 
          label={t.columnWidths} 
          placeholder="e.g. 1fr 2fr 1fr"
          value={getCommonValue(n => n.styles.gridTemplateColumns || '')} 
          onChange={(v: string) => handleStyleChange('gridTemplateColumns', v)} 
        />
      </div>
    </section>
  )
});

// Register Table Cell Component
registerComponent({
  type: 'table-cell',
  name: 'Table Cell',
  isContainer: true,
  getDefaultStyles: () => ({ padding: '5px', border: '1px solid #e2e8f0' }),
  createNode: (id) => ({
    id,
    type: 'table-cell',
    name: 'New Cell',
    styles: { padding: '5px', border: '1px solid #e2e8f0' },
    isMerged: false,
    children: []
  } as TableCellNode),
  render: ({ node, report, combinedStyles, isOver, handleDragOver, handleDragLeave, handleDrop, CanvasNode, selectedIds, onSelect, onAdd, onDropNode, onDropTable, onUpdateNode, isPreview }) => (
    <div 
      style={{
        display: (node as TableCellNode).isMerged ? 'none' : 'flex',
        flexDirection: 'column',
        minHeight: '40px',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        ...combinedStyles,
      }} 
      className={cn(
        "relative transition-all",
        isOver && "ring-2 ring-indigo-400 ring-inset bg-indigo-50/30",
        (node as TableCellNode).isMerged && "hidden"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {node.children?.map(child => (
        <CanvasNode 
          key={child.id} 
          node={child} 
          report={report}
          selectedIds={selectedIds} 
          onSelect={onSelect} 
          onAdd={onAdd}
          onDropNode={onDropNode}
          onDropTable={onDropTable}
          onUpdateNode={onUpdateNode}
          isPreview={isPreview}
        />
      ))}
    </div>
  ),
  renderProperties: ({ getCommonValue, onUpdate, Components, t }) => (
    <section>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.tableCell}</label>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Components.PropertyInput 
            label={t.colSpan} 
            type="number" 
            value={String(getCommonValue(n => (n as any).colSpan || 1))} 
            onChange={(v: string) => onUpdate({ colSpan: parseInt(v) || 1 })} 
          />
          <Components.PropertyInput 
            label={t.rowSpan} 
            type="number" 
            value={String(getCommonValue(n => (n as any).rowSpan || 1))} 
            onChange={(v: string) => onUpdate({ rowSpan: parseInt(v) || 1 })} 
          />
        </div>
      </div>
    </section>
  )
});

// Register Page Component
registerComponent({
  type: 'page',
  name: 'Page',
  isContainer: true,
  getDefaultStyles: () => ({
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }),
  createNode: (id) => ({
    id,
    type: 'page',
    name: 'New Page',
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
      { id: `h-${id}`, type: 'header', name: 'Header', styles: { height: '60px', borderBottom: '1px solid #e2e8f0', padding: '10px', backgroundColor: '#f8fafc' }, children: [] } as HeaderNode,
      { id: `b-${id}`, type: 'body', name: 'Body', styles: { flex: '1', padding: '20px', minHeight: '200px' }, children: [] } as BodyNode,
      { id: `f-${id}`, type: 'footer', name: 'Footer', styles: { height: '40px', borderTop: '1px solid #e2e8f0', padding: '10px', backgroundColor: '#f8fafc' }, children: [] } as FooterNode
    ]
  } as PageNode),
  render: ({ node, report, combinedStyles, CanvasNode, selectedIds, onSelect, onAdd, onDropNode, onDropTable, onUpdateNode, isPreview }) => (
    <div style={combinedStyles} className="flex flex-col h-full w-full">
      {node.children?.map(child => {
        if (child.type === 'header' && !(node as PageNode).showHeader) return null;
        if (child.type === 'footer' && !(node as PageNode).showFooter) return null;
        return (
          <CanvasNode 
            key={child.id} 
            node={child} 
            report={report}
            selectedIds={selectedIds} 
            onSelect={onSelect} 
            onAdd={onAdd}
            onDropNode={onDropNode}
            onDropTable={onDropTable}
            onUpdateNode={onUpdateNode}
            isPreview={isPreview}
          />
        );
      })}
    </div>
  ),
  renderProperties: ({ getCommonValue, onUpdate, Components, t }) => (
    <>
      <section>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.pageSettings}</label>
        <div className="flex flex-col gap-3">
          <Components.PropertySelect 
            label={t.pageSize} 
            value={getCommonValue(n => (n as any).pageSize || 'A4')} 
            options={['A4', 'A5', 'Letter']} 
            onChange={(v: string) => onUpdate({ pageSize: v as any })} 
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500">{t.orientation}</span>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              {(['portrait', 'landscape'] as const).map((orient) => (
                <button
                  key={orient}
                  onClick={() => onUpdate({ orientation: orient })}
                  className={cn(
                    "flex-1 py-1 text-xs rounded transition-all flex items-center justify-center gap-1",
                    getCommonValue(n => (n as any).orientation || 'portrait') === orient ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600 font-medium" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <div className={cn("w-3 h-3 border border-current rounded-[1px]", orient === 'landscape' && "rotate-90")} />
                  {orient === 'portrait' ? t.portrait : t.landscape}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.pageRegions}</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={getCommonValue(n => !!(n as any).showHeader)} 
              onChange={(e) => onUpdate({ showHeader: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{t.showHeader}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={getCommonValue(n => !!(n as any).showFooter)} 
              onChange={(e) => onUpdate({ showFooter: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{t.showFooter}</span>
          </label>
        </div>
      </section>
    </>
  )
});

// Register Header/Footer/Body Components
const createRegionRender = (type: 'header' | 'footer' | 'body') => {
  return ({ node, report, combinedStyles, isOver, handleDragOver, handleDragLeave, handleDrop, CanvasNode, selectedIds, onSelect, onAdd, onDropNode, onDropTable, onUpdateNode, isPreview }: any) => (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '40px',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        ...combinedStyles,
      }} 
      className={cn(
        "relative transition-all",
        isOver && "ring-2 ring-indigo-400 ring-inset bg-indigo-50/30",
        !isPreview && "border-dashed border-slate-200 border"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {node.children?.map((child: any) => (
        <CanvasNode 
          key={child.id} 
          node={child} 
          report={report}
          selectedIds={selectedIds} 
          onSelect={onSelect} 
          onAdd={onAdd}
          onDropNode={onDropNode}
          onDropTable={onDropTable}
          onUpdateNode={onUpdateNode}
          isPreview={isPreview}
        />
      ))}
      {node.children?.length === 0 && !isPreview && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-[10px] pointer-events-none uppercase tracking-widest font-bold">
          {type}
        </div>
      )}
    </div>
  );
};

registerComponent({
  type: 'header',
  name: 'Header',
  isContainer: true,
  getDefaultStyles: () => ({ height: '60px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }),
  createNode: (id) => ({ id, type: 'header', name: 'Header', styles: { height: '60px', borderBottom: '1px solid #e2e8f0', padding: '10px', backgroundColor: '#f8fafc' }, children: [] } as HeaderNode),
  render: createRegionRender('header'),
  renderProperties: ({ getCommonValue, handleStyleChange, Components, t }) => (
    <section>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.flexbox}</label>
      <div className="flex flex-col gap-3">
        <Components.PropertyInput label={t.gap} value={getCommonValue(n => n.styles.gap || '')} onChange={(v: string) => handleStyleChange('gap', v)} />
        <Components.PropertySelect 
          label={t.justify} 
          value={getCommonValue(n => n.styles.justifyContent || 'flex-start')} 
          options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around']} 
          onChange={(v: string) => handleStyleChange('justifyContent', v)} 
        />
        <Components.PropertySelect 
          label={t.align} 
          value={getCommonValue(n => n.styles.alignItems || 'stretch')} 
          options={['stretch', 'flex-start', 'center', 'flex-end']} 
          onChange={(v: string) => handleStyleChange('alignItems', v)} 
        />
      </div>
    </section>
  )
});

registerComponent({
  type: 'footer',
  name: 'Footer',
  isContainer: true,
  getDefaultStyles: () => ({ height: '40px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }),
  createNode: (id) => ({ id, type: 'footer', name: 'Footer', styles: { height: '40px', borderTop: '1px solid #e2e8f0', padding: '10px', backgroundColor: '#f8fafc' }, children: [] } as FooterNode),
  render: createRegionRender('footer'),
  renderProperties: ({ getCommonValue, handleStyleChange, Components, t }) => (
    <section>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.flexbox}</label>
      <div className="flex flex-col gap-3">
        <Components.PropertyInput label={t.gap} value={getCommonValue(n => n.styles.gap || '')} onChange={(v: string) => handleStyleChange('gap', v)} />
        <Components.PropertySelect 
          label={t.justify} 
          value={getCommonValue(n => n.styles.justifyContent || 'flex-start')} 
          options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around']} 
          onChange={(v: string) => handleStyleChange('justifyContent', v)} 
        />
        <Components.PropertySelect 
          label={t.align} 
          value={getCommonValue(n => n.styles.alignItems || 'stretch')} 
          options={['stretch', 'flex-start', 'center', 'flex-end']} 
          onChange={(v: string) => handleStyleChange('alignItems', v)} 
        />
      </div>
    </section>
  )
});

registerComponent({
  type: 'body',
  name: 'Body',
  isContainer: true,
  getDefaultStyles: () => ({ flex: '1', minHeight: '200px' }),
  createNode: (id) => ({ id, type: 'body', name: 'Body', styles: { flex: '1', padding: '20px', minHeight: '200px' }, children: [] } as BodyNode),
  render: createRegionRender('body'),
  renderProperties: ({ getCommonValue, handleStyleChange, Components, t }) => (
    <section>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.flexbox}</label>
      <div className="flex flex-col gap-3">
        <Components.PropertyInput label={t.gap} value={getCommonValue(n => n.styles.gap || '')} onChange={(v: string) => handleStyleChange('gap', v)} />
        <Components.PropertySelect 
          label={t.justify} 
          value={getCommonValue(n => n.styles.justifyContent || 'flex-start')} 
          options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around']} 
          onChange={(v: string) => handleStyleChange('justifyContent', v)} 
        />
        <Components.PropertySelect 
          label={t.align} 
          value={getCommonValue(n => n.styles.alignItems || 'stretch')} 
          options={['stretch', 'flex-start', 'center', 'flex-end']} 
          onChange={(v: string) => handleStyleChange('alignItems', v)} 
        />
      </div>
    </section>
  )
});

// Register Report Root (Special case)
registerComponent({
  type: 'report',
  name: 'Report',
  isContainer: true,
  getDefaultStyles: () => ({
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    padding: '40px'
  }),
  createNode: (id) => ({
    id,
    type: 'report',
    name: 'Report Root',
    styles: {
      backgroundColor: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
      padding: '40px'
    },
    children: []
  } as any),
  render: () => null // Root is rendered specially in Canvas.tsx
});
