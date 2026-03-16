import { ReportNode, ComponentStyles } from './types';

export function jsonToXml(node: ReportNode): string {
  const stylesToXml = (styles: ComponentStyles) => {
    return Object.entries(styles)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join('');
  };

  const childrenToXml = (children?: ReportNode[]): string => {
    if (!children || children.length === 0) return '';
    return children.map(child => jsonToXml(child)).join('');
  };

  const attributes = [
    ` id="${node.id}"`,
    ` name="${node.name}"`,
    (node as any).content ? ` content="${encodeXml((node as any).content)}"` : '',
    (node as any).src ? ` src="${encodeXml((node as any).src)}"` : '',
    (node as any).rows ? ` rows="${(node as any).rows}"` : '',
    (node as any).cols ? ` cols="${(node as any).cols}"` : '',
    (node as any).colSpan ? ` colSpan="${(node as any).colSpan}"` : '',
    (node as any).rowSpan ? ` rowSpan="${(node as any).rowSpan}"` : '',
    (node as any).rowIndex !== undefined ? ` rowIndex="${(node as any).rowIndex}"` : '',
    (node as any).colIndex !== undefined ? ` colIndex="${(node as any).colIndex}"` : '',
    (node as any).isMerged !== undefined ? ` isMerged="${(node as any).isMerged}"` : '',
  ].join('');

  const styleAttr = stylesToXml(node.styles);

  return `<${node.type}${attributes}${styleAttr}>${childrenToXml(node.children)}</${node.type}>`;
}

export function xmlToJson(xmlString: string): ReportNode {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const rootElement = xmlDoc.documentElement;

  const elementToNode = (el: Element): ReportNode => {
    const type = el.tagName as any;
    const node: ReportNode = {
      id: el.getAttribute('id') || Math.random().toString(36).substr(2, 9),
      type,
      name: el.getAttribute('name') || type,
      styles: {},
    };

    // Extract attributes
    const attrNames = el.getAttributeNames();
    const reservedAttrs = ['id', 'name', 'content', 'src', 'rows', 'cols', 'colSpan', 'rowSpan', 'rowIndex', 'colIndex', 'isMerged'];
    
    attrNames.forEach(attr => {
      const val = el.getAttribute(attr);
      if (reservedAttrs.includes(attr)) {
        if (attr === 'content') (node as any).content = val || undefined;
        else if (attr === 'src') (node as any).src = val || undefined;
        else if (['rows', 'cols', 'colSpan', 'rowSpan', 'rowIndex', 'colIndex'].includes(attr)) {
          (node as any)[attr] = parseInt(val || '0');
        } else if (attr === 'isMerged') {
          (node as any).isMerged = val === 'true';
        }
      } else {
        (node.styles as any)[attr] = val;
      }
    });

    // Children
    const children: ReportNode[] = [];
    for (let i = 0; i < el.children.length; i++) {
      children.push(elementToNode(el.children[i]));
    }
    if (children.length > 0) node.children = children;
    else if (['horizontal', 'vertical', 'table'].includes(type)) node.children = [];

    return node;
  };

  return elementToNode(rootElement);
}

function encodeXml(s: string): string {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
}
