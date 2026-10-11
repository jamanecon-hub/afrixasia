import { Link } from "react-router-dom";
import { Footer, Header } from "../components/Chrome.jsx";
import { useLanguage } from "../i18n.jsx";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const sections = [
    [
      t("What is public?", "Apa yang dipublikasikan?", "Quelles données sont publiques ?"),
      t(
        "With your publication consent, your name, organization, country, role, interest, segment, and capabilities (products or services, capacity, certifications, and lead time), website, membership ID, and dates appear in public profiles, the directory, API, and CSV exports. Email and phone are published only if you opt in.",
        "Dengan persetujuan publikasi, nama, organisasi, negara, peran, minat, segmen, dan kapabilitas (produk atau jasa, kapasitas, sertifikasi, dan lead time), website, ID anggota, serta tanggal tampil di profil, direktori, API, dan CSV publik. Email dan telepon hanya dipublikasikan jika Anda memilihnya.",
        "Avec votre consentement, votre nom, organisation, pays, rôle, intérêt, segment et capacités (produits ou services, capacité, certifications et délai), site, identifiant et dates figurent dans les profils publics, l’annuaire, l’API et les exports CSV. E-mail et téléphone ne sont publiés que sur votre accord.",
      ),
    ],
    [
      t("What stays private?", "Apa yang tetap privat?", "Quelles données restent privées ?"),
      t(
        "Email and phone stay private unless you opt in. Buyer purpose, budget, and selection criteria, and supplier business model, minimum order, and market experience stay on your account and are not listed. Certifications and lead time that you enter as capabilities are published. Do not put secrets in the public interest, segment, or capabilities.",
        "Email dan telepon tetap privat kecuali Anda memilih publik. Tujuan, anggaran, dan kriteria buyer, serta model bisnis, minimum order, dan pengalaman pasar supplier tetap di akun dan tidak ditampilkan. Sertifikasi dan lead time yang Anda isi sebagai kapabilitas dipublikasikan. Jangan masukkan rahasia ke minat, segmen, atau kapabilitas publik.",
        "E-mail et téléphone restent privés sauf accord. L’objectif, le budget et les critères d’achat, ainsi que le modèle, le minimum et l’expérience du fournisseur restent sur le compte. Les certifications et le délai saisis comme capacités sont publiés. N’insérez pas de secret dans l’intérêt, le segment ou les capacités publics.",
      ),
    ],
    [
      t("Your account and control", "Akun dan kendali Anda", "Votre compte et votre contrôle"),
      t(
        "You can join with the local Google sign-in or a manual form; the manual form does not need a prior login. A browser session is stored when you continue with Google, or after a manual registration is saved, so that email can edit or delete the profile. One email has one active profile. Deleting membership removes it from active storage and public listings. Copies already downloaded cannot be recalled.",
        "Anda dapat mendaftar lewat masuk Google lokal atau form manual; form manual tidak membutuhkan login sebelumnya. Sesi browser tersimpan saat Anda lanjut dengan Google, atau setelah pendaftaran manual berhasil, sehingga email itu dapat mengubah atau menghapus profil. Satu email memiliki satu profil aktif. Menghapus membership menghapusnya dari penyimpanan aktif dan listing publik. Salinan yang sudah diunduh tidak dapat ditarik kembali.",
        "Vous pouvez adhérer via la connexion Google locale ou le formulaire manuel ; le formulaire manuel ne demande pas de connexion préalable. Une session est enregistrée avec Google, ou après une inscription manuelle, pour modifier ou supprimer le profil. Un e-mail possède un profil actif. La suppression retire le profil du stockage actif et des listes publiques. Les copies déjà téléchargées ne peuvent pas être rappelées.",
      ),
    ],
    [
      t("Community terms", "Ketentuan komunitas", "Conditions communautaires"),
      t(
        "Provide accurate information and have authority to represent your organization. Oil, gas and illegal goods or services are prohibited. Membership activates after a successful save; it is not identity verification, certification, business vetting or a transaction guarantee. This site does not process payments or escrow.",
        "Berikan informasi yang benar dan miliki wewenang mewakili organisasi. Oil, gas, serta barang atau jasa ilegal dilarang. Membership aktif setelah penyimpanan berhasil; bukan verifikasi identitas, sertifikasi, pemeriksaan bisnis, atau jaminan transaksi. Situs tidak memproses pembayaran atau escrow.",
        "Fournissez des informations exactes et soyez autorisé à représenter votre organisation. Le pétrole, le gaz et les biens ou services illégaux sont interdits. L’adhésion est activée après enregistrement réussi ; elle ne constitue ni vérification d’identité, ni certification, ni garantie de transaction. Le site ne traite ni paiements ni séquestres.",
      ),
    ],
    [
      t("Contact and external services", "Kontak dan layanan eksternal", "Contact et services externes"),
      t(
        "Partners contact you through the website or contact details you publish. No automatic messages are sent to prospective partners. External websites, news sources, Instagram and the sign-in service have their own privacy policies. Your language preference is stored in your browser.",
        "Mitra menghubungi melalui website atau kontak yang Anda publikasikan. Tidak ada pesan otomatis ke calon mitra. Website eksternal, sumber berita, Instagram, dan layanan login memiliki kebijakan privasi sendiri. Pilihan bahasa disimpan di browser Anda.",
        "Les partenaires vous contactent via le site ou les coordonnées publiées. Aucun message automatique n’est envoyé aux partenaires potentiels. Les sites externes, sources d’actualités, Instagram et le service de connexion ont leurs propres politiques. Votre préférence linguistique est enregistrée dans votre navigateur.",
      ),
    ],
  ];
  return (
    <>
      <Header active="privasi" />
      <main>
        <div className="method">
          <span className="eyebrow">AFRIXASIA CIRCLE · 11 OCTOBER 2026</span>
          <h1>{t("Privacy & membership terms", "Privasi & ketentuan membership", "Confidentialité & conditions d’adhésion")}</h1>
          {sections.map(([title, copy]) => (
            <section key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </section>
          ))}
          <Link className="btn primary" to="/daftar">
            {t("Manage my membership", "Kelola membership saya", "Gérer mon adhésion")} →
          </Link>
        </div>
        <Footer />
      </main>
    </>
  );
}
