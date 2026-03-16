import { ReportNode, ComponentStyles, DataSource, DataSourceTable, DataSourceColumn } from './types';

export function jsonToXml(report: ReportNode, dataSource?: DataSource): string {
  const stylesToXml = (styles: ComponentStyles) => {
    return Object.entries(styles)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join('');
  };

  const nodeToXml = (n: ReportNode): string => {
    const attributes = [
      ` id="${n.id}"`,
      ` name="${n.name}"`,
      (n as any).content ? ` content="${encodeXml((n as any).content)}"` : '',
      (n as any).src ? ` src="${encodeXml((n as any).src)}"` : '',
      (n as any).rows ? ` rows="${(n as any).rows}"` : '',
      (n as any).cols ? ` cols="${(n as any).cols}"` : '',
      (n as any).colSpan ? ` colSpan="${(n as any).colSpan}"` : '',
      (n as any).rowSpan ? ` rowSpan="${(n as any).rowSpan}"` : '',
      (n as any).rowIndex !== undefined ? ` rowIndex="${(n as any).rowIndex}"` : '',
      (n as any).colIndex !== undefined ? ` colIndex="${(n as any).colIndex}"` : '',
      (n as any).isMerged !== undefined ? ` isMerged="${(n as any).isMerged}"` : '',
      (n as any).dataSource ? ` dataSource="${(n as any).dataSource}"` : '',
      (n as any).showHeader !== undefined ? ` showHeader="${(n as any).showHeader}"` : '',
      (n as any).showFooter !== undefined ? ` showFooter="${(n as any).showFooter}"` : '',
      (n as any).pageSize ? ` pageSize="${(n as any).pageSize}"` : '',
      (n as any).orientation ? ` orientation="${(n as any).orientation}"` : '',
    ].join('');

    const styleAttr = stylesToXml(n.styles);
    const childrenXml = n.children?.map(child => nodeToXml(child)).join('') || '';
    
    return `<${n.type}${attributes}${styleAttr}>${childrenXml}</${n.type}>`;
  };

  const rootAttrs = [
    ` id="${report.id}"`,
    ` name="${report.name}"`,
  ].join('');
  const rootStyles = stylesToXml(report.styles);

  const dataSourceXml = dataSource ? `
  <datasource url="${encodeXml(dataSource.url)}">
    ${dataSource.tables.map(table => `
    <table id="${table.id}" name="${encodeXml(table.name)}">
      ${table.columns.map(col => `
      <column id="${col.id}" name="${encodeXml(col.name)}" type="${col.type}" />`).join('')}
    </table>`).join('')}
  </datasource>` : '';

  const pagesXml = `
  <pages>
    ${report.children?.map(page => nodeToXml(page)).join('') || ''}
  </pages>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<report${rootAttrs}${rootStyles}>
  ${dataSourceXml}
  ${pagesXml}
</report>`;
}

export function xmlToJson(xmlString: string): { report: ReportNode; dataSource?: DataSource } {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const rootElement = xmlDoc.documentElement;

  const tagName = rootElement.tagName.toLowerCase();
  
  let dataSource: DataSource | undefined;
  if (tagName === 'report') {
    const dataSourceEl = rootElement.querySelector('datasource');
    if (dataSourceEl) {
      dataSource = {
        url: dataSourceEl.getAttribute('url') || '',
        tables: Array.from(dataSourceEl.querySelectorAll('table')).map(tableEl => ({
          id: tableEl.getAttribute('id') || '',
          name: tableEl.getAttribute('name') || '',
          columns: Array.from(tableEl.querySelectorAll('column')).map(colEl => ({
            id: colEl.getAttribute('id') || '',
            name: colEl.getAttribute('name') || '',
            type: colEl.getAttribute('type') || ''
          }))
        })),
        systemFields: [
          { id: 'currentPage', name: '当前页码' },
          { id: 'totalPages', name: '总页码' },
          { id: 'currentTime', name: '当前时间' },
          { id: 'reportName', name: '报表名称' }
        ]
      };
    }
  }

  const report = elementToNode(rootElement);
  
  return { report, dataSource };
}

function elementToNode(el: Element): ReportNode {
  const type = el.tagName.toLowerCase() as any;
  const node: ReportNode = {
    id: el.getAttribute('id') || Math.random().toString(36).substr(2, 9),
    type,
    name: el.getAttribute('name') || type,
    styles: {},
  };

  // Extract attributes
  const attrNames = el.getAttributeNames();
  const reservedAttrs = [
    'id', 'name', 'content', 'src', 'rows', 'cols', 'colSpan', 'rowSpan', 
    'rowIndex', 'colIndex', 'isMerged', 'dataSource', 
    'showHeader', 'showFooter', 'pageSize', 'orientation'
  ];
  
  attrNames.forEach(attr => {
    const val = el.getAttribute(attr);
    if (reservedAttrs.includes(attr)) {
      if (attr === 'content') (node as any).content = val || undefined;
      else if (attr === 'src') (node as any).src = val || undefined;
      else if (['rows', 'cols', 'colSpan', 'rowSpan', 'rowIndex', 'colIndex'].includes(attr)) {
        (node as any)[attr] = parseInt(val || '0');
      } else if (attr === 'isMerged') {
        (node as any).isMerged = val === 'true';
      } else if (attr === 'dataSource') {
        (node as any).dataSource = val || undefined;
      } else if (attr === 'showHeader') {
        (node as any).showHeader = val === 'true';
      } else if (attr === 'showFooter') {
        (node as any).showFooter = val === 'true';
      } else if (attr === 'pageSize') {
        (node as any).pageSize = val || undefined;
      } else if (attr === 'orientation') {
        (node as any).orientation = val || undefined;
      }
    } else {
      (node.styles as any)[attr] = val;
    }
  });

  // Children
  const children: ReportNode[] = [];
  for (let i = 0; i < el.children.length; i++) {
    const childEl = el.children[i];
    const childTag = childEl.tagName.toLowerCase();
    
    // Skip datasource as it's handled separately
    if (type === 'report' && childTag === 'datasource') continue;
    
    // Flatten pages wrapper
    if (type === 'report' && childTag === 'pages') {
      for (let j = 0; j < childEl.children.length; j++) {
        children.push(elementToNode(childEl.children[j]));
      }
      continue;
    }
    
    children.push(elementToNode(childEl));
  }
  
  if (children.length > 0) node.children = children;
  else if (['horizontal', 'vertical', 'table', 'header', 'footer', 'body', 'page', 'report'].includes(type)) {
    node.children = [];
  }

  return node;
}

function encodeXml(s: string): string {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
}
