export function printReport(
  title: string,
  subtitle: string,
  tables: Array<{ caption: string; headers: string[]; rows: string[][] }>
): void {
  const win = window.open('', '_blank');
  if (!win) return;

  const styles = `
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .subtitle { font-size: 14px; color: #64748b; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
    caption { font-weight: 600; font-size: 16px; text-align: left; margin-bottom: 8px; color: #1e293b; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600; }
    td { padding: 8px 10px; border: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print {
      body { padding: 20px; }
    }
  `;

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${title}</title><style>${styles}</style></head>
    <body>
      <h1>${title}</h1>
      <p class="subtitle">${subtitle}</p>
      ${tables
        .map(
          (t) => `
        <table>
          <caption>${t.caption}</caption>
          <thead><tr>${t.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>
            ${t.rows
              .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
              .join('')}
          </tbody>
        </table>`
        )
        .join('')}
      <p class="footer">Generado por EduTrack TA &mdash; ${new Date().toLocaleDateString('es-CL')}</p>
    </body>
    </html>
  `);

  win.document.close();
  win.focus();

  setTimeout(() => win.print(), 500);
}
