import React from 'react';
import { 
  Layout, 
  ChevronDown, 
  Upload, 
  Download, 
  ZoomOut, 
  ZoomIn, 
  Languages, 
  Moon, 
  Sun, 
  Settings, 
  Eye 
} from 'lucide-react';
import { cn } from './Icons';

interface HeaderProps {
  t: any;
  lang: string;
  setLang: (l: 'zh' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  zoom: number;
  setZoom: (z: number) => void;
  isPreview: boolean;
  setIsPreview: (p: boolean) => void;
  onImport: () => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  lang,
  setLang,
  theme,
  setTheme,
  zoom,
  setZoom,
  isPreview,
  setIsPreview,
  onImport,
  onExport
}) => {
  return (
    <header className={cn("h-14 border-b flex items-center px-6 justify-between shrink-0 z-20 shadow-sm transition-colors", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 font-bold text-xl text-indigo-600">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Layout className="w-6 h-6" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">FlowReport</span>
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <div className="relative group">
            <button className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 rounded-lg transition-all flex items-center gap-1">
              {t.file}
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className={cn("absolute top-full left-0 mt-1 w-48 border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
              <button 
                onClick={onImport}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 rounded-lg flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {t.import}
              </button>
              <button 
                onClick={onExport}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t.export}
              </button>
            </div>
          </div>
          <button className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 rounded-lg transition-all">{t.edit}</button>
          <button className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 rounded-lg transition-all">{t.view}</button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1 mr-2 border border-slate-200 dark:border-slate-600">
          <button onClick={() => setZoom(Math.max(0.25, zoom - 0.1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-indigo-600"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs font-bold w-12 text-center text-slate-600 dark:text-slate-300">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-indigo-600"><ZoomIn className="w-4 h-4" /></button>
        </div>
        
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1 border border-slate-200 dark:border-slate-600">
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} 
            className="p-1.5 hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 px-2"
          >
            <Languages className="w-4 h-4" />
            <span className="text-xs font-bold">{lang.toUpperCase()}</span>
          </button>
        </div>

        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-all"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <button 
          onClick={() => setIsPreview(!isPreview)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm",
            isPreview ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
          )}
        >
          {isPreview ? <Settings className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPreview ? t.designer : t.preview}
        </button>
      </div>
    </header>
  );
};
