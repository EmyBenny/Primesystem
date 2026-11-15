import { jsPDF } from 'jspdf';
import { COMPANY_INFO } from '../data/catalogSeed';
import { Order, OrderItem } from '../types';

function formatInvoiceDate(ts: unknown): string {
  if (!ts) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  if (ts instanceof Date) {
    return ts.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  if (typeof ts === 'string') {
    const parsed = new Date(ts);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  const maybe = ts as { toDate?: () => Date; seconds?: number };
  if (typeof maybe.toDate === 'function') {
    return maybe.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  if (typeof maybe.seconds === 'number') {
    return new Date(maybe.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatMoney(amount: number): string {
  return `$${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function downloadReceiptAsPdf(order: Order, items: OrderItem[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Cream page background
  doc.setFillColor(255, 253, 247); // #FFFDF7
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top Horse Blood accent bar
  doc.setFillColor(90, 20, 24); // #5A1418
  doc.rect(0, 0, pageWidth, 10, 'F');

  // Header band
  doc.setFillColor(243, 236, 224); // #F3ECE0
  doc.rect(0, 10, pageWidth, 104, 'F');

  y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 20, 24);
  doc.text(
    order.orderType === 'booking'
      ? 'OFFICIAL BOOKING & FABRICATION RECEIPT'
      : 'OFFICIAL COMMERCIAL INVOICE RECEIPT',
    margin,
    y
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(31, 24, 21); // #1F1815
  doc.text(COMPANY_INFO.name, margin, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(88, 75, 68); // #584B44
  doc.text(`Japan Corporate Headquarters · ${COMPANY_INFO.headquarters}`, margin, y + 39);
  doc.text(
    `Reg: ${COMPANY_INFO.registrationCode}  ·  WhatsApp: ${COMPANY_INFO.whatsappNumber}  ·  ${COMPANY_INFO.email}`,
    margin,
    y + 53
  );

  // Right side Invoice Number block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(124, 110, 101);
  doc.text('INVOICE NUMBER', pageWidth - margin, y, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(90, 20, 24);
  doc.text(order.invoiceNumber, pageWidth - margin, y + 19, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(88, 75, 68);
  doc.text(`Issued: ${formatInvoiceDate(order.createdAt)}`, pageWidth - margin, y + 36, {
    align: 'right',
  });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 24, 21);
  doc.text(`Status: ${order.status}`, pageWidth - margin, y + 50, { align: 'right' });

  // Divider line under header
  doc.setDrawColor(226, 216, 197);
  doc.setLineWidth(1);
  doc.line(0, 114, pageWidth, 114);

  // Client & Dispatch Two-Column Section
  y = 140;
  const colWidth = (contentWidth - 24) / 2;
  const rightColX = margin + colWidth + 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(124, 110, 101);
  doc.text('BILLED TO', margin, y);
  doc.text('DELIVERY & SCHEDULE', rightColX, y);

  let leftY = y + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(31, 24, 21);
  const nameLines = doc.splitTextToSize(order.customerName, colWidth);
  doc.text(nameLines, margin, leftY);
  leftY += nameLines.length * 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(88, 75, 68);
  if (order.companyName) {
    const compLines = doc.splitTextToSize(order.companyName, colWidth);
    doc.text(compLines, margin, leftY);
    leftY += compLines.length * 13;
  }
  const emailLines = doc.splitTextToSize(order.customerEmail, colWidth);
  doc.text(emailLines, margin, leftY);
  leftY += emailLines.length * 13;
  doc.text(order.customerPhone, margin, leftY);
  leftY += 13;

  let rightY = y + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(31, 24, 21);
  doc.text(`Market Region: ${order.destinationRegion}`, rightColX, rightY);
  rightY += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(88, 75, 68);
  const addrLines = doc.splitTextToSize(order.shippingAddress, colWidth);
  doc.text(addrLines, rightColX, rightY);
  rightY += addrLines.length * 13;

  if (order.bookingDate) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(90, 20, 24);
    doc.text(`Scheduled Slot: ${order.bookingDate}`, rightColX, rightY + 3);
    rightY += 16;
  }

  y = Math.max(leftY, rightY) + 22;

  // Table Header
  const drawTableHeader = (topY: number) => {
    doc.setFillColor(243, 236, 224);
    doc.rect(margin, topY, contentWidth, 24, 'F');
    doc.setDrawColor(226, 216, 197);
    doc.line(margin, topY, margin + contentWidth, topY);
    doc.line(margin, topY + 24, margin + contentWidth, topY + 24);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(124, 110, 101);
    doc.text('ITEM / SKU', margin + 8, topY + 15);
    doc.text('QTY', margin + contentWidth - 185, topY + 15, { align: 'right' });
    doc.text('UNIT PRICE', margin + contentWidth - 95, topY + 15, { align: 'right' });
    doc.text('LINE TOTAL', margin + contentWidth - 8, topY + 15, { align: 'right' });
  };

  drawTableHeader(y);
  y += 24;

  // Table Rows
  if (items.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(88, 75, 68);
    doc.text(
      `${order.itemCount} item(s) covered under invoice ${order.invoiceNumber}`,
      margin + 8,
      y + 20
    );
    y += 34;
    doc.setDrawColor(226, 216, 197);
    doc.line(margin, y, margin + contentWidth, y);
  } else {
    for (const item of items) {
      const titleLines = doc.splitTextToSize(item.productName, contentWidth - 265);
      const rowHeight = Math.max(36, titleLines.length * 13 + 22);

      if (y + rowHeight > pageHeight - 160) {
        doc.addPage();
        doc.setFillColor(255, 253, 247);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setFillColor(90, 20, 24);
        doc.rect(0, 0, pageWidth, 8, 'F');
        y = 36;
        drawTableHeader(y);
        y += 24;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(31, 24, 21);
      doc.text(titleLines, margin + 8, y + 15);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(124, 110, 101);
      doc.text(`${item.sku} · ${item.category}`, margin + 8, y + 15 + titleLines.length * 12);

      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(31, 24, 21);
      doc.text(
        `${item.quantity} ${item.unit}`,
        margin + contentWidth - 185,
        y + 18,
        { align: 'right' }
      );
      doc.setTextColor(88, 75, 68);
      doc.text(
        formatMoney(item.unitPriceUsd),
        margin + contentWidth - 95,
        y + 18,
        { align: 'right' }
      );
      doc.setFont('courier', 'bold');
      doc.setTextColor(31, 24, 21);
      doc.text(
        formatMoney(item.lineTotalUsd),
        margin + contentWidth - 8,
        y + 18,
        { align: 'right' }
      );

      y += rowHeight;
      doc.setDrawColor(226, 216, 197);
      doc.line(margin, y, margin + contentWidth, y);
    }
  }

  y += 22;
  if (y > pageHeight - 150) {
    doc.addPage();
    doc.setFillColor(255, 253, 247);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    y = 44;
  }

  // Notes & Totals Summary
  const notesMaxWidth = contentWidth - 220;
  let notesY = y;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(88, 75, 68);

  if (order.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 24, 21);
    doc.text('Project / Fabrication Notes:', margin, notesY);
    notesY += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(88, 75, 68);
    const noteLines = doc.splitTextToSize(order.notes, notesMaxWidth);
    doc.text(noteLines, margin, notesY);
    notesY += noteLines.length * 11 + 8;
  }

  const taxDisclaimer = doc.splitTextToSize(
    'Export shipments outside Japan are zero-rated for domestic consumption tax; domestic Japan deliveries include 10% consumption tax.',
    notesMaxWidth
  );
  doc.text(taxDisclaimer, margin, notesY);

  const totalsX = pageWidth - margin;
  const totalsLabelX = totalsX - 185;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(88, 75, 68);
  doc.text('Subtotal', totalsLabelX, y);
  doc.setFont('courier', 'normal');
  doc.text(formatMoney(order.subtotalUsd), totalsX, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(
    order.destinationRegion === 'Japan'
      ? 'Japan Consumption Tax (10%)'
      : 'Export Zero-Rated Tax (0%)',
    totalsLabelX,
    y + 18
  );
  doc.setFont('courier', 'normal');
  doc.text(formatMoney(order.taxUsd), totalsX, y + 18, { align: 'right' });

  doc.setDrawColor(31, 24, 21);
  doc.setLineWidth(1.2);
  doc.line(totalsLabelX, y + 28, totalsX, y + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(90, 20, 24);
  doc.text('Total Invoiced', totalsLabelX, y + 46);
  doc.setFont('courier', 'bold');
  doc.text(formatMoney(order.totalUsd), totalsX, y + 46, { align: 'right' });

  // Footer Bar
  doc.setDrawColor(226, 216, 197);
  doc.setLineWidth(0.8);
  doc.line(margin, pageHeight - 54, pageWidth - margin, pageHeight - 54);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(124, 110, 101);
  doc.text(
    `${COMPANY_INFO.name} · Official Digital Invoice Receipt · Office Location: Japan · WhatsApp: ${COMPANY_INFO.whatsappNumber}`,
    pageWidth / 2,
    pageHeight - 36,
    { align: 'center' }
  );

  doc.save(`${order.invoiceNumber}.pdf`);
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const test = `${current} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

export async function downloadReceiptAsImage(
  order: Order,
  items: OrderItem[]
): Promise<void> {
  const width = 1400;
  const margin = 80;
  const contentWidth = width - margin * 2;
  const colWidth = (contentWidth - 48) / 2;

  // Measure dynamic height first using a temporary canvas context
  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d');
  if (!mctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  mctx.font = 'normal 22px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  const addrLines = wrapCanvasText(mctx, order.shippingAddress, colWidth);
  const compLines = order.companyName ? wrapCanvasText(mctx, order.companyName, colWidth) : [];
  const notesLines = order.notes
    ? wrapCanvasText(mctx, order.notes, contentWidth - 460)
    : [];

  mctx.font = '600 22px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  let itemsTotalHeight = 0;
  const rowMetadata = items.map((item) => {
    const titleLines = wrapCanvasText(mctx, item.productName, contentWidth - 540);
    const rowHeight = Math.max(84, titleLines.length * 28 + 46);
    itemsTotalHeight += rowHeight;
    return { item, titleLines, rowHeight };
  });
  if (rowMetadata.length === 0) {
    itemsTotalHeight = 84;
  }

  const headerHeight = 230;
  const clientSectionHeight = Math.max(150, 70 + (addrLines.length + compLines.length) * 30);
  const tableHeaderHeight = 56;
  const footerSummaryHeight = Math.max(220, 140 + notesLines.length * 26);
  const totalHeight = Math.max(
    1120,
    headerHeight + clientSectionHeight + tableHeaderHeight + itemsTotalHeight + footerSummaryHeight + 100
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  // Page Background
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, width, totalHeight);

  // Top Horse Blood Accent Bar
  ctx.fillStyle = '#5A1418';
  ctx.fillRect(0, 0, width, 16);

  // Header Band
  ctx.fillStyle = '#F3ECE0';
  ctx.fillRect(0, 16, width, 198);

  ctx.strokeStyle = '#E2D8C5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 214);
  ctx.lineTo(width, 214);
  ctx.stroke();

  // Header Left
  ctx.fillStyle = '#5A1418';
  ctx.font = '700 18px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    order.orderType === 'booking'
      ? 'OFFICIAL BOOKING & FABRICATION RECEIPT'
      : 'OFFICIAL COMMERCIAL INVOICE RECEIPT',
    margin,
    68
  );

  ctx.fillStyle = '#1F1815';
  ctx.font = '700 40px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(COMPANY_INFO.name, margin, 114);

  ctx.fillStyle = '#584B44';
  ctx.font = '400 20px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`Japan Corporate Headquarters · ${COMPANY_INFO.headquarters}`, margin, 148);

  ctx.fillStyle = '#7C6E65';
  ctx.font = '400 17px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText(
    `Reg: ${COMPANY_INFO.registrationCode} · WhatsApp: ${COMPANY_INFO.whatsappNumber}`,
    margin,
    178
  );

  // Header Right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#7C6E65';
  ctx.font = '600 17px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('INVOICE NUMBER', width - margin, 68);

  ctx.fillStyle = '#5A1418';
  ctx.font = '700 30px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText(order.invoiceNumber, width - margin, 108);

  ctx.fillStyle = '#584B44';
  ctx.font = '400 19px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`Issued: ${formatInvoiceDate(order.createdAt)}`, width - margin, 145);

  ctx.fillStyle = '#1F1815';
  ctx.font = '600 19px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`Status: ${order.status}`, width - margin, 175);

  // Client & Dispatch Section
  ctx.textAlign = 'left';
  let y = 264;
  const rightX = margin + colWidth + 48;

  ctx.fillStyle = '#7C6E65';
  ctx.font = '600 17px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('BILLED TO', margin, y);
  ctx.fillText('DELIVERY & SCHEDULE', rightX, y);

  let leftY = y + 34;
  ctx.fillStyle = '#1F1815';
  ctx.font = '700 24px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(order.customerName, margin, leftY);
  leftY += 32;

  ctx.fillStyle = '#584B44';
  ctx.font = '400 21px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  for (const cl of compLines) {
    ctx.fillText(cl, margin, leftY);
    leftY += 28;
  }
  ctx.fillText(order.customerEmail, margin, leftY);
  leftY += 28;

  ctx.font = '400 19px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText(order.customerPhone, margin, leftY);
  leftY += 28;

  let rightY = y + 34;
  ctx.fillStyle = '#1F1815';
  ctx.font = '600 22px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`Market Region: ${order.destinationRegion}`, rightX, rightY);
  rightY += 32;

  ctx.fillStyle = '#584B44';
  ctx.font = '400 21px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  for (const al of addrLines) {
    ctx.fillText(al, rightX, rightY);
    rightY += 28;
  }

  if (order.bookingDate) {
    ctx.fillStyle = '#5A1418';
    ctx.font = '600 19px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillText(`Scheduled Slot: ${order.bookingDate}`, rightX, rightY + 6);
    rightY += 32;
  }

  // Table Header
  y = Math.max(leftY, rightY) + 34;
  ctx.fillStyle = '#F3ECE0';
  ctx.fillRect(margin, y, contentWidth, tableHeaderHeight);
  ctx.strokeStyle = '#E2D8C5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, y);
  ctx.lineTo(width - margin, y);
  ctx.moveTo(margin, y + tableHeaderHeight);
  ctx.lineTo(width - margin, y + tableHeaderHeight);
  ctx.stroke();

  ctx.fillStyle = '#7C6E65';
  ctx.font = '600 17px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ITEM / SKU', margin + 18, y + 35);
  ctx.textAlign = 'right';
  ctx.fillText('QTY', width - margin - 380, y + 35);
  ctx.fillText('UNIT PRICE', width - margin - 190, y + 35);
  ctx.fillText('LINE TOTAL', width - margin - 18, y + 35);

  y += tableHeaderHeight;

  // Table Rows
  if (rowMetadata.length === 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#584B44';
    ctx.font = '400 21px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(
      `${order.itemCount} item(s) covered under invoice ${order.invoiceNumber}`,
      margin + 18,
      y + 48
    );
    y += 84;
    ctx.strokeStyle = '#E2D8C5';
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
  } else {
    for (const { item, titleLines, rowHeight } of rowMetadata) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1F1815';
      ctx.font = '600 22px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
      titleLines.forEach((line, idx) => {
        ctx.fillText(line, margin + 18, y + 34 + idx * 28);
      });

      ctx.fillStyle = '#7C6E65';
      ctx.font = '400 17px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillText(
        `${item.sku} · ${item.category}`,
        margin + 18,
        y + 34 + titleLines.length * 28
      );

      ctx.textAlign = 'right';
      ctx.fillStyle = '#1F1815';
      ctx.font = '400 20px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillText(`${item.quantity} ${item.unit}`, width - margin - 380, y + 42);

      ctx.fillStyle = '#584B44';
      ctx.fillText(formatMoney(item.unitPriceUsd), width - margin - 190, y + 42);

      ctx.fillStyle = '#1F1815';
      ctx.font = '700 21px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillText(formatMoney(item.lineTotalUsd), width - margin - 18, y + 42);

      y += rowHeight;
      ctx.strokeStyle = '#E2D8C5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }
  }

  // Notes & Totals
  y += 46;
  ctx.textAlign = 'left';
  let notesY = y;
  if (notesLines.length > 0) {
    ctx.fillStyle = '#1F1815';
    ctx.font = '700 19px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Project / Fabrication Notes:', margin, notesY);
    notesY += 28;
    ctx.fillStyle = '#584B44';
    ctx.font = '400 19px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
    for (const nl of notesLines) {
      ctx.fillText(nl, margin, notesY);
      notesY += 26;
    }
    notesY += 12;
  }

  ctx.fillStyle = '#7C6E65';
  ctx.font = '400 18px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  const disclaimer = wrapCanvasText(
    ctx,
    'Export shipments outside Japan are zero-rated for domestic consumption tax; domestic Japan deliveries include 10% consumption tax.',
    contentWidth - 460
  );
  for (const dl of disclaimer) {
    ctx.fillText(dl, margin, notesY);
    notesY += 24;
  }

  const labelX = width - margin - 390;
  const valX = width - margin;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#584B44';
  ctx.font = '400 21px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Subtotal', labelX, y);
  ctx.textAlign = 'right';
  ctx.font = '400 21px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText(formatMoney(order.subtotalUsd), valX, y);

  ctx.textAlign = 'left';
  ctx.font = '400 21px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(
    order.destinationRegion === 'Japan'
      ? 'Japan Tax (10%)'
      : 'Export Tax (0%)',
    labelX,
    y + 38
  );
  ctx.textAlign = 'right';
  ctx.font = '400 21px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText(formatMoney(order.taxUsd), valX, y + 38);

  ctx.strokeStyle = '#1F1815';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(labelX, y + 58);
  ctx.lineTo(valX, y + 58);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#5A1418';
  ctx.font = '700 26px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Total Invoiced', labelX, y + 96);
  ctx.textAlign = 'right';
  ctx.font = '700 26px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText(formatMoney(order.totalUsd), valX, y + 96);

  // Bottom Footer
  ctx.strokeStyle = '#E2D8C5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, totalHeight - 76);
  ctx.lineTo(width - margin, totalHeight - 76);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7C6E65';
  ctx.font = '400 18px "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(
    `${COMPANY_INFO.name} · Office Location: Japan · WhatsApp Direct: ${COMPANY_INFO.whatsappNumber} · ${COMPANY_INFO.email}`,
    width / 2,
    totalHeight - 40
  );

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${order.invoiceNumber}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${order.invoiceNumber}.png`;
        link.click();
      }
      resolve();
    }, 'image/png');
  });
}
