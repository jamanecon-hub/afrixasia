const PAGE_WIDTH = 540;
const PAGE_HEIGHT = 340;

function pdfText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value) {
  return pdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function drawText(font, size, x, y, value, color = "0 0 0") {
  const text = pdfEscape(value);
  if (!text) return "";
  return `${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${text}) Tj ET\n`;
}

function fitSize(value, size, maxWidth) {
  const text = pdfText(value);
  let next = size;
  while (next > 11 && text.length * next * 0.52 > maxWidth) next -= 1;
  return next;
}

function frontStream(card) {
  const nameSize = fitSize(card.name, 26, 470);
  const orgSize = fitSize(card.organization, 14, 470);
  return [
    "0.031 0.043 0.078 rg",
    "0 0 540 340 re f",
    "0.384 0.839 0.263 rg",
    "28 292 78 4 re f",
    drawText("F2", 15, 28, 262, "AFRIXASIA", "1 1 1"),
    drawText("F1", 9, 28, 244, "THE CIRCLE", "0.71 0.78 0.9"),
    drawText("F2", nameSize, 28, 176, card.name, "1 1 1"),
    drawText("F1", orgSize, 28, 146, card.organization, "0.78 0.84 0.93"),
    drawText("F1", 10, 28, 48, card.meta, "0.72 0.78 0.86"),
    drawText("F1", 10, 28, 30, card.membershipId, "0.72 0.78 0.86"),
    drawText("F2", 9, 400, 30, "ASIA  ·  AFRICA", "0.384 0.839 0.263"),
  ].join("\n");
}

function backStream(card) {
  return [
    "0.965 0.973 0.98 rg",
    "0 0 540 340 re f",
    "0.384 0.839 0.263 rg",
    "28 292 78 4 re f",
    drawText("F2", 14, 28, 258, "AFRIXASIA CIRCLE", "0.07 0.1 0.14"),
    drawText("F1", 11, 28, 232, card.greeting, "0.28 0.36 0.46"),
    drawText("F2", 12, 28, 186, "Telegram", "0.07 0.1 0.14"),
    drawText("F1", 11, 28, 166, "https://t.me/afrixasia", "0.157 0.263 0.957"),
    drawText("F2", 12, 28, 124, "LinkedIn", "0.07 0.1 0.14"),
    drawText("F1", 11, 28, 104, "https://www.linkedin.com/company/afrixasia/", "0.157 0.263 0.957"),
    drawText("F1", 9, 28, 30, "afrixasia.org", "0.4 0.48 0.56"),
  ].join("\n");
}

function streamObject(content) {
  return `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
}

export function membershipCardPdf(member) {
  const card = {
    name: member?.name || "Member",
    organization: member?.organization || "Individual member",
    membershipId: member?.membershipId || "",
    meta: [member?.role ? String(member.role).toUpperCase() : "MEMBER", member?.country || ""].filter(Boolean).join("   ·   "),
    greeting: `Welcome, ${member?.name || "member"}.`,
  };
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 2 /Kids [6 0 R 8 0 R] >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    streamObject(frontStream(card)),
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 540 340] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 5 0 R >>",
    streamObject(backStream(card)),
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 540 340] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 7 0 R >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(body);
}

export const TELEGRAM_URL = "https://t.me/afrixasia";
export const LINKEDIN_URL = "https://www.linkedin.com/company/afrixasia/";
