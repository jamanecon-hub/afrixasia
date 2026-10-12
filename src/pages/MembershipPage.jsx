import { Link } from "react-router-dom";
import { Footer, Header, Wordmark } from "../components/Chrome.jsx";
import CircleDirectory from "../components/CircleDirectory.jsx";
import { useLanguage } from "../i18n.jsx";
import { registerSearch, ResearchBar, useResearch } from "../research.jsx";

export default function MembershipPage() {
  const { t } = useLanguage();
  const [context] = useResearch();

  return (
    <>
      <Header active="Marketplace" />
      <main>
        <ResearchBar scope="membership" />
        <section className="circle-hero">
          <div className="circle-hero-copy">
            <span className="circle-overline">AFRIXASIA CIRCLE · MEMBERSHIP</span>
            <h1>{t("Your ambition.\nA wider circle.", "Ambisi Anda.\nKoneksi lebih luas.", "Votre ambition.\nUn cercle plus vaste.")}</h1>
            <p>
              {t(
                "A community for individuals and organizations building business across Asia and Africa. Start with your membership, then introduce what you need or what you offer.",
                "Komunitas individu dan organisasi yang membangun bisnis lintas Asia–Afrika. Daftar membership, lalu perkenalkan kebutuhan atau penawaran Anda.",
                "Une communauté de particuliers et d’organisations développant leurs activités entre l’Asie et l’Afrique. Adhérez, puis présentez vos besoins ou votre offre.",
              )}
            </p>
            <div className="form-actions">
              <Link className="circle-gold-btn" to={registerSearch(context, "buyer")}>
                AFRIXASIA MEMBER ↗
              </Link>
              <Link className="btn" to={registerSearch(context, "supplier")}>
                {t("Join as a supplier", "Gabung sebagai supplier", "Rejoindre comme fournisseur")} ↗
              </Link>
            </div>
            <p className="small">
              {t(
                "One membership form • Buyer and supplier roles • Interest, segment, and capabilities are published • Email and phone stay private unless you opt in",
                "Satu form membership • Peran buyer dan supplier • Minat, segmen, dan kapabilitas dipublikasikan • Email dan telepon tetap privat kecuali Anda memilih sebaliknya",
                "Un seul formulaire • Rôles acheteur et fournisseur • Intérêt, segment et capacités publiés • E-mail et téléphone privés sauf accord",
              )}
            </p>
            <Link to="/daftar">{t("Already a member? Manage your profile", "Sudah menjadi anggota? Kelola profil", "Déjà membre ? Gérez votre profil")} →</Link>
          </div>
          <div className="membership-card">
            <div className="membership-card-top">
              <Wordmark />
              <span>THE CIRCLE</span>
            </div>
            <div className="card-emblem">
              <Wordmark symbol />
            </div>
            <div className="membership-card-bottom">
              <b>{t("Your next chapter starts here.", "Bab berikutnya dimulai di sini.", "Votre prochain chapitre commence ici.")}</b>
              <span>ASIA · AFRICA</span>
            </div>
          </div>
        </section>
        <section className="circle-benefits">
          {[
            [t("Your member identity", "Identitas anggota", "Votre identité membre"), t("Receive a digital membership ID after your profile is saved successfully.", "Dapatkan ID membership digital setelah profil berhasil disimpan.", "Recevez un identifiant numérique après l’enregistrement réussi de votre profil.")],
            [t("A purposeful introduction", "Perkenalan yang bermakna", "Une présentation utile"), t("Publish your need or capability with sector and country context.", "Publikasikan kebutuhan atau kemampuan dengan konteks sektor dan negara.", "Publiez votre besoin ou votre offre avec son secteur et ses pays.")],
            [t("Your visibility, your choice", "Visibilitas sesuai pilihan", "Votre visibilité, votre choix"), t("Keep contact details private or choose to publish them. Edit or delete your profile anytime.", "Simpan kontak privat atau pilih untuk dipublikasikan. Ubah atau hapus profil kapan saja.", "Gardez vos coordonnées privées ou publiez-les. Modifiez ou supprimez votre profil à tout moment.")],
          ].map(([title, copy], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </section>
        <CircleDirectory />
        <Footer />
      </main>
    </>
  );
}
