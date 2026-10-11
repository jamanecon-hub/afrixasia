import { Link } from "react-router-dom";
import { Footer, Header } from "../components/Chrome.jsx";
import { useLanguage } from "../i18n.jsx";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const sections = [
    [
      t("What is public?", "Apa yang dipublikasikan?", "Quelles données sont publiques ?"),
      t(
        "With your publication consent, your name, country, entity type, role, sector, listing title and description, volume, origin, target, website, membership ID and dates appear in public profiles, the directory, API and CSV exports. Email and phone are published only if you opt in.",
        "Dengan persetujuan publikasi, nama, negara, jenis entitas, peran, sektor, judul, deskripsi, volume, asal, tujuan, website, ID anggota, dan tanggal tampil di profil, direktori, API, dan CSV publik. Email dan telepon hanya dipublikasikan jika Anda memilihnya.",
        "Avec votre consentement, votre nom, pays, type d’entité, rôle, secteur, titre, description, volume, origine, destination, site, identifiant et dates figurent dans les profils publics, l’annuaire, l’API et les exports CSV. E-mail et téléphone ne sont publiés que sur votre accord.",
      ),
    ],
    [
      t("What stays private?", "Apa yang tetap privat?", "Quelles données restent privées ?"),
      t(
        "Buyer purpose, budget, timeline and selection criteria, and supplier business model, minimum order, lead time, experience and certifications remain private. Only your signed-in account can read or modify your full profile. Do not put confidential information in your public listing.",
        "Tujuan, anggaran, waktu, dan kriteria buyer serta model bisnis, minimum order, lead time, pengalaman, dan sertifikasi supplier tetap privat. Hanya akun Anda yang dapat membaca atau mengubah profil lengkap. Jangan masukkan informasi rahasia ke listing publik.",
        "L’objectif, le budget, les délais et les critères d’achat, ainsi que le modèle d’activité, les minimums, délais, expérience et certifications du fournisseur restent privés. Seul votre compte connecté peut consulter et modifier votre profil complet. N’insérez pas d’informations confidentielles dans l’annonce publique.",
      ),
    ],
    [
      t("Your account and control", "Akun dan kendali Anda", "Votre compte et votre contrôle"),
      t(
        "A signed-in account is required to create, edit or delete a profile. One account has one active profile and listing. Your data is stored on this site while the profile is active. Deleting your membership removes it from active site storage and public listings. Copies already downloaded by others or indexed by search engines cannot be recalled.",
        "Akun yang masuk diperlukan untuk membuat, mengubah, atau menghapus profil. Satu akun memiliki satu profil dan listing aktif. Data disimpan di situs selama profil aktif. Menghapus membership menghapusnya dari penyimpanan aktif dan listing publik. Salinan yang telah diunduh pihak lain atau diindeks mesin pencari tidak dapat ditarik kembali.",
        "Un compte connecté est requis pour créer, modifier ou supprimer un profil. Un compte possède un profil et une annonce actifs. Vos données restent stockées sur ce site tant que le profil est actif. La suppression retire le profil du stockage actif et des listes publiques. Les copies téléchargées ou indexées ne peuvent pas être rappelées.",
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
