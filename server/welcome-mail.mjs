import nodemailer from "nodemailer";
import { LINKEDIN_URL, TELEGRAM_URL } from "../shared/card-pdf.mjs";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rows(member) {
  const organization = member.organization || "Individual member";
  const pairs = [
    ["Nama / Name", member.name],
    ["Organisasi / Organization", organization],
    ["Peran / Role", member.role],
    ["Negara / Country", member.country],
    ["Email", member.email],
    ["Telepon / Phone", member.phone],
    ["Website", member.website],
    ["Minat / Interest", member.interest?.statement || member.title],
    ["Sektor / Sector", member.category],
    ["Asal / Origin", member.originCountry],
    ["Tujuan / Target", member.targetCountry],
    ["Penawaran / Offer", member.description],
    ["Kapasitas / Capacity", member.quantity],
    ["Sertifikasi / Certifications", member.capabilities?.certifications],
    ["Lead time", member.capabilities?.leadTime],
    ["Tujuan pembelian / Purchase purpose", member.buyerPurpose],
    ["Anggaran / Budget", member.buyerBudget],
    ["Kriteria / Criteria", member.buyerCriteria],
    ["Model bisnis / Business model", member.supplierBusinessType],
    ["Minimum order", member.supplierMOQ],
    ["Pengalaman / Experience", member.supplierExperience],
    ["ID membership", member.membershipId],
  ];
  return pairs.filter(([, value]) => String(value || "").trim());
}

function message(member) {
  const name = member.name || "member";
  const lines = rows(member);
  const text = [
    `Halo ${name},`,
    "",
    "Selamat datang di AfriXAsia Circle. Kartu virtual Anda (depan dan belakang) terlampir.",
    "",
    "Data yang Anda isi:",
    ...lines.map(([label, value]) => `${label}: ${value}`),
    "",
    `Gabung grup Telegram: ${TELEGRAM_URL}`,
    `Ikuti halaman LinkedIn AfriXAsia: ${LINKEDIN_URL}`,
    "",
    "AfriXAsia · Asia · Africa",
    "https://afrixasia.org/daftar",
  ].join("\n");
  const html = `<p>Halo ${escapeHtml(name)},</p>
<p>Selamat datang di AfriXAsia Circle. Kartu virtual Anda, tampak depan dan belakang, terlampir pada email ini.</p>
<p><strong>Data yang Anda isi</strong></p>
<table>${lines
    .map(([label, value]) => `<tr><td style="padding:4px 16px 4px 0;color:#5c6b7c">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>
<p><a href="${TELEGRAM_URL}">Gabung grup Telegram AfriXAsia</a></p>
<p><a href="${LINKEDIN_URL}">Ikuti halaman LinkedIn AfriXAsia</a></p>
<p>AfriXAsia · Asia · Africa</p>`;
  return { text, html };
}

async function sendWithResend(member, pdf, mail) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "AfriXAsia Circle <membership@afrixasia.org>",
      to: [member.email],
      subject: `Selamat datang di AfriXAsia Circle, ${member.name}`,
      text: mail.text,
      html: mail.html,
      attachments: [
        {
          filename: `AfriXAsia-${member.membershipId || "card"}.pdf`,
          content: Buffer.from(pdf).toString("base64"),
        },
      ],
    }),
  });
  if (!response.ok) return { sent: false, reason: "mail_failed" };
  return { sent: true, channel: "resend" };
}

async function sendWithSmtp(member, pdf, mail) {
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" } : undefined,
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM || "AfriXAsia Circle <membership@afrixasia.org>",
    to: member.email,
    subject: `Selamat datang di AfriXAsia Circle, ${member.name}`,
    text: mail.text,
    html: mail.html,
    attachments: [
      {
        filename: `AfriXAsia-${member.membershipId || "card"}.pdf`,
        content: Buffer.from(pdf),
        contentType: "application/pdf",
      },
    ],
  });
  return { sent: true, channel: "smtp" };
}

export async function sendWelcomeEmail(member, pdf) {
  const mail = message(member);
  if (process.env.RESEND_API_KEY) return sendWithResend(member, pdf, mail);
  if (process.env.SMTP_HOST) return sendWithSmtp(member, pdf, mail);
  return { sent: false, reason: "mail_not_configured" };
}
