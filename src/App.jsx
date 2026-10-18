import { Route, Routes } from "react-router-dom";
import AnalysisPage from "./pages/AnalysisPage.jsx";
import CorridorPage from "./pages/CorridorPage.jsx";
import CountryPage from "./pages/CountryPage.jsx";
import DocsPage from "./pages/DocsPage.jsx";
import EvidencePage from "./pages/EvidencePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MarketPage from "./pages/MarketPage.jsx";
import MediaPage from "./pages/MediaPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProviderPage from "./pages/ProviderPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/data-pasar" element={<MarketPage />} />
      <Route path="/data-pasar/:id" element={<EvidencePage />} />
      <Route path="/jelajah" element={<MarketPage />} />
      <Route path="/open-data" element={<AnalysisPage />} />
      <Route path="/proyeksi" element={<AnalysisPage />} />
      <Route path="/daily-brief" element={<MediaPage />} />
      <Route path="/layanan" element={<ServicesPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/marketplace" element={<MembershipPage />} />
      <Route path="/penyedia" element={<MembershipPage />} />
      <Route path="/penyedia/:id" element={<ProviderPage />} />
      <Route path="/daftar" element={<RegisterPage />} />
      <Route path="/kualitas-data" element={<DocsPage mode="quality" />} />
      <Route path="/api-docs" element={<DocsPage mode="api" />} />
      <Route path="/metodologi" element={<DocsPage mode="method" />} />
      <Route path="/privasi" element={<PrivacyPage />} />
      <Route path="/koridor" element={<CorridorPage />} />
      <Route path="/negara/:code" element={<CountryPage />} />
      <Route path="/anggota/:publicKey" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
