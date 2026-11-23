// Tiny XML reader for vehicle feeds (no dependencies).
// <a><b>1</b><b>2</b><c x="y">t</c></a>  ->  { a: { b: ['1', '2'], c: 't' } }   (attributes go to "@name")
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = s => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(parseInt(e.slice(e[1] === 'x' ? 2 : 1), e[1] === 'x' ? 16 : 10)) : ENT[e] ?? m);

export function parseXml(xml) {
  xml = xml.replace(/<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>/gi, '');
  const root = { children: {}, text: '' }, stack = [root];
  const re = /<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([\w:.-]+)([^>]*?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(xml))) {
    const top = stack[stack.length - 1];
    if (m[1] != null) { top.text += m[1]; continue; }
    if (m[6] != null) { top.text += decode(m[6]); continue; }
    const [, , close, name, attrs, self] = m;
    if (close) { const node = stack.pop(); add(stack[stack.length - 1], name, finish(node)); continue; }
    const node = { children: {}, text: '', attrs: {} };
    attrs.replace(/([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g, (_, k, __, a, b) => { node.attrs['@' + k] = decode(a ?? b); });
    if (self) add(top, name, finish(node)); else stack.push(node);
  }
  return finish(root);
}
function add(parent, name, value) {
  const c = parent.children;
  if (name in c) { if (!Array.isArray(c[name]) || !c[name].__multi) { c[name] = Object.assign([c[name]], { __multi: true }); } c[name].push(value); }
  else c[name] = value;
}
function finish(node) {
  const keys = Object.keys(node.children), attrs = node.attrs || {};
  const text = node.text.trim();
  if (!keys.length && !Object.keys(attrs).length) return text;
  const out = { ...attrs };
  for (const k of keys) out[k] = Array.isArray(node.children[k]) ? [...node.children[k]] : node.children[k];
  if (text) out['#text'] = text;
  return out;
}
