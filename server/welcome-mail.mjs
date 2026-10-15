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

const DEFAULT_FROM = "AfriXAsia Secretariat <secretariat@afrixasia.org>";

function plunkBase() {
  const raw = String(process.env.PLUNK_API_URL || "https://next-api.useplunk.com").replace(/\/+$/, "");
  return raw.endsWith("/v1") ? raw.slice(0, -3) : raw;
}

function fromHeader() {
  return process.env.MAIL_FROM || DEFAULT_FROM;
}

function addressOnly(value) {
  const parsed = parseFrom(value);
  return typeof parsed === "string" ? parsed : parsed.email;
}

function replyAddress() {
  return String(process.env.MAIL_REPLY || addressOnly(fromHeader())).trim();
}

function copyAddress() {
  if (process.env.MAIL_COPY === "") return "";
  return String(process.env.MAIL_COPY || addressOnly(fromHeader())).trim();
}

function sameAddress(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

function publicDetail(detail) {
  return String(detail || "")
    .replace(/sk_[A-Za-z0-9._-]+/g, "sk_redacted")
    .replace(/pk_[A-Za-z0-9._-]+/g, "pk_redacted")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function parseFrom(value) {
  const raw = String(value || "").trim();
  const match = /^(.*)<([^>]+)>$/.exec(raw);
  if (!match) return raw;
  const name = match[1].trim().replace(/^"|"$/g, "");
  const email = match[2].trim();
  return name ? { name, email } : email;
}

function mailFailure(detail) {
  const text = publicDetail(detail);
  return text ? { sent: false, reason: "mail_failed", detail: text } : { sent: false, reason: "mail_failed" };
}

async function plunkSend({ to, subject, html, pdf, filename, reply }) {
  const response = await fetch(`${plunkBase()}/v1/send`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.PLUNK_SECRET_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject,
      body: html,
      from: parseFrom(fromHeader()),
      reply,
      attachments: [
        {
          filename,
          content: Buffer.from(pdf).toString("base64"),
          contentType: "application/pdf",
        },
      ],
    }),
  });
  if (response.ok) return { ok: true };
  let detail = "";
  try {
    const body = await response.json();
    detail = body?.error?.message || body?.message || "";
  } catch {
    detail = "";
  }
  console.error("plunk mail", response.status, publicDetail(detail));
  return { ok: false, detail };
}

async function sendWithPlunk(member, pdf, mail) {
  const filename = `AfriXAsia-${member.membershipId || "card"}.pdf`;
  const subject = `Selamat datang di AfriXAsia Circle, ${member.name}`;
  const sent = await plunkSend({
    to: { email: member.email, name: member.name },
    subject,
    html: mail.html,
    pdf,
    filename,
    reply: replyAddress(),
  });
  if (!sent.ok) return mailFailure(sent.detail);
  const copy = copyAddress();
  if (!copy || sameAddress(copy, member.email)) return { sent: true, channel: "plunk", copy: false };
  const copied = await plunkSend({
    to: copy,
    subject: `[Salinan] ${subject}`,
    html: `<p>Salinan otomatis email yang dikirim website ke ${escapeHtml(member.email)}. Balas pesan ini untuk menulis kepada anggota.</p>${mail.html}`,
    pdf,
    filename,
    reply: member.email,
  });
  if (!copied.ok) return { sent: true, channel: "plunk", copy: false };
  return { sent: true, channel: "plunk", copy: true };
}

async function sendWithResend(member, pdf, mail) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: fromHeader(),
      to: [member.email],
      reply_to: replyAddress(),
      bcc: copyAddress() && !sameAddress(copyAddress(), member.email) ? [copyAddress()] : undefined,
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
    from: fromHeader(),
    to: member.email,
    replyTo: replyAddress(),
    bcc: copyAddress() && !sameAddress(copyAddress(), member.email) ? copyAddress() : undefined,
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
  if (process.env.PLUNK_SECRET_KEY) return sendWithPlunk(member, pdf, mail);
  if (process.env.RESEND_API_KEY) return sendWithResend(member, pdf, mail);
  if (process.env.SMTP_HOST) return sendWithSmtp(member, pdf, mail);
  return { sent: false, reason: "mail_not_configured" };
}
