export type ComponentType = 'text' | 'image' | 'horizontal' | 'vertical' | 'table' | 'page' | 'report' | 'header' | 'footer' | 'body' | 'table-cell';

export interface ComponentStyles {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  border?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderColor?: string;
  borderRadius?: string;
  display?: string;
  flexDirection?: string;
  gap?: string;
  alignItems?: string;
  justifyContent?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  boxShadow?: string;
  borderBottom?: string;
  borderTop?: string;
  flex?: string;
  position?: string;
}

export interface BaseNode {
  id: string;
  type: ComponentType;
  name: string;
  styles: ComponentStyles;
  children?: ReportNode[];
}

export interface ReportRootNode extends BaseNode {
  type: 'report';
}

export interface PageNode extends BaseNode {
  type: 'page';
  showHeader: boolean;
  showFooter: boolean;
  pageSize: PageSize;
  orientation: Orientation;
}

export interface HeaderNode extends BaseNode {
  type: 'header';
}

export interface FooterNode extends BaseNode {
  type: 'footer';
}

export interface BodyNode extends BaseNode {
  type: 'body';
}

export interface TextNode extends BaseNode {
  type: 'text';
  content: string;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string;
}

export interface TableNode extends BaseNode {
  type: 'table';
  rows: number;
  cols: number;
  dataSource?: string;
  children?: TableCellNode[];
}



export interface LayoutNode extends BaseNode {
  type: 'horizontal' | 'vertical';
}

export interface TableCellNode extends BaseNode {
  type: 'table-cell';
  rowIndex? :number;
  colIndex?: number;
  colSpan?: number; // For table cells
  rowSpan?: number; // For table cells
  isMerged :boolean  //is merged cell for span
}

export interface DataSourceColumn {
  id: string;
  name: string;
  type: string;
}

export interface DataSourceTable {
  id: string;
  name: string;
  columns: DataSourceColumn[];
}

export interface DataSourceSystemField {
  id: string;
  name: string;
  value?: any;
}

export interface DataSource {
  url: string;
  tables: DataSourceTable[];
  systemFields: DataSourceSystemField[];
}

export type ReportNode = 
  | ReportRootNode 
  | PageNode 
  | HeaderNode 
  | FooterNode 
  | BodyNode 
  | TextNode 
  | ImageNode 
  | TableNode 
  | LayoutNode
  | TableCellNode;

export type PageSize = 'A4' | 'A5' | 'A3'| 'Letter';
export type Orientation = 'portrait' | 'landscape';

export interface PageConfig {
  size: PageSize;
  orientation: Orientation;
}

export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  'A4': { width: 210, height: 297 }, // mm
  'A5': { width: 148, height: 210 },
  'A3': { width:297 ,height:420},
  'Letter': { width: 216, height: 279 },
};

export interface DragItem {
  type: ComponentType;
}
