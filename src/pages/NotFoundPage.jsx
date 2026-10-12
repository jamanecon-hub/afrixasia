import { Link } from "react-router-dom";
import { Footer, Header } from "../components/Chrome.jsx";

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main>
        <div className="market-empty">
          <span className="eyebrow">404 · AFRIXASIA</span>
          <h1>Halaman belum ditemukan.</h1>
          <p>Tautan mungkin tidak berlaku lagi atau profil telah dihapus oleh pemiliknya.</p>
          <div className="form-actions">
            <Link className="btn primary" to="/marketplace">
              Circle directory →
            </Link>
            <Link className="btn" to="/">
              Jelajahi pasar →
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
