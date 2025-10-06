import vega from 'vega';
import vegaLite from 'vega-lite';
import pdf from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

export async function jsonToPDF(json: any, title: string): Promise<Buffer> {
  const vlSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    title,
    data: { values: json },
    mark: 'bar',
    encoding: {
      x: { field: 'name', type: 'ordinal' },
      y: { field: 'value', type: 'quantitative' },
      color: { field: 'name', type: 'ordinal', scale: { scheme: 'turbo' } },
    },
    width: 600,
    height: 300,
  };

  const vgSpec = vegaLite.compile(vlSpec).spec;
  const view = new vega.View(vega.parse(vgSpec), { renderer: 'none' });
  const svg = await view.toSVG();

  const doc = new pdf({ margin: 50 });
  doc.fontSize(20).text(title, 50, 50);
  SVGtoPDF(doc, svg, 50, 100);
  doc.end();

  return new Promise((res) => {
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => res(Buffer.concat(chunks)));
  });
}