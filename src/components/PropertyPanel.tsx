import React from 'react';
import { X } from 'lucide-react';
import { ReportNode, ComponentType, ComponentStyles, PageSize } from '../types';
import { cn } from './Icons';
import { getComponentDefinition } from '../registry';

interface PropertyPanelProps {
  nodes: ReportNode[];
  onUpdate: (updates: Partial<ReportNode>) => void;
  parentType?: ComponentType;
  t: any;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  nodes, 
  onUpdate, 
  parentType, 
  t 
}) => {
  if (nodes.length === 0) return null;
  const node = nodes[0];

  const getCommonValue = (getValue: (n: ReportNode) => any) => {
    const firstValue = getValue(nodes[0]);
    const allSame = nodes.every(n => getValue(n) === firstValue);
    return allSame ? firstValue : '';
  };

  const handleStyleChange = (key: keyof ComponentStyles, value: any) => {
    onUpdate({ styles: { [key]: value } });
  };

  const allSameType = nodes.every(n => n.type === node.type);
  const def = getComponentDefinition(node.type);

  return (
    <div className="p-4 flex flex-col gap-6">
      {allSameType && def.renderProperties && def.renderProperties({
        nodes,
        onUpdate,
        handleStyleChange,
        getCommonValue,
        t,
        Components: { PropertyInput, PropertySelect, PropertyTextArea }
      })}

      <section>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.general}</label>
        <div className="flex flex-col gap-3">
          <PropertyInput label={t.name} value={getCommonValue(n => n.name)} onChange={(v) => onUpdate({ name: v })} />
        </div>
      </section>

      <section>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.layoutSpacing}</label>
        <div className="grid grid-cols-2 gap-3">
          <PropertyInput label={t.padding} value={getCommonValue(n => n.styles.padding || '')} onChange={(v) => handleStyleChange('padding', v)} />
          <PropertyInput label={t.margin} value={getCommonValue(n => n.styles.margin || '')} onChange={(v) => handleStyleChange('margin', v)} />
          <PropertyInput label={t.width} placeholder="e.g. 100px, 50%, *" value={getCommonValue(n => n.styles.width || '')} onChange={(v) => handleStyleChange('width', v)} />
          <PropertyInput label={t.height} value={getCommonValue(n => n.styles.height || '')} onChange={(v) => handleStyleChange('height', v)} />
          <PropertyInput label={t.minHeight} value={getCommonValue(n => n.styles.minHeight || '')} onChange={(v) => handleStyleChange('minHeight', v)} />
          <PropertyInput label={t.flex} placeholder="e.g. 1, none" value={getCommonValue(n => n.styles.flex || '')} onChange={(v) => handleStyleChange('flex', v)} />
        </div>
      </section>

      <section>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.colors}</label>
        <div className="flex flex-col gap-3">
          <PropertyInput 
            label={t.bgColor} 
            type="color" 
            value={getCommonValue(n => n.styles.backgroundColor || 'transparent')} 
            onChange={(v) => handleStyleChange('backgroundColor', v)} 
            onClear={() => handleStyleChange('backgroundColor', 'transparent')}
            t={t}
          />
          <PropertyInput 
            label={t.borderColor} 
            type="color" 
            value={getCommonValue(n => n.styles.borderColor || '#e2e8f0')} 
            onChange={(v) => handleStyleChange('borderColor', v)} 
            onClear={() => handleStyleChange('borderColor', 'transparent')}
            t={t}
          />
        </div>
      </section>

      <section>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{t.border}</label>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <PropertyInput label={t.borderWidth} value={getCommonValue(n => n.styles.borderWidth || '')} onChange={(v) => handleStyleChange('borderWidth', v)} />
            <PropertySelect 
              label={t.borderStyle} 
              value={getCommonValue(n => n.styles.borderStyle || 'none')} 
              options={['none', 'solid', 'dashed', 'dotted', 'double']} 
              onChange={(v) => handleStyleChange('borderStyle', v)} 
            />
          </div>
          <PropertyInput label={t.borderRadius} value={getCommonValue(n => n.styles.borderRadius || '')} onChange={(v) => handleStyleChange('borderRadius', v)} />
        </div>
      </section>
    </div>
  );
};

export function PropertyInput({ label, value, onChange, onClear, type = "text", placeholder, t }: { label: string, value: string, onChange: (v: string) => void, onClear?: () => void, type?: string, placeholder?: string, t?: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{label}</span>
        {onClear && (
          <button 
            onClick={onClear}
            className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
          >
            <X className="w-2.5 h-2.5" />
            {t?.clear}
          </button>
        )}
      </div>
      <input 
        type={type}
        value={value} 
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
      />
    </div>
  );
}

export function PropertyTextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 resize-none"
      />
    </div>
  );
}

export function PropertySelect({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
