import { Route, Routes } from "react-router-dom";
import AnalysisPage from "./pages/AnalysisPage.jsx";
import DocsPage from "./pages/DocsPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MarketPage from "./pages/MarketPage.jsx";
import MediaPage from "./pages/MediaPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/data-pasar" element={<MarketPage />} />
      <Route path="/open-data" element={<AnalysisPage />} />
      <Route path="/daily-brief" element={<MediaPage />} />
      <Route path="/marketplace" element={<MembershipPage />} />
      <Route path="/daftar" element={<RegisterPage />} />
      <Route path="/kualitas-data" element={<DocsPage mode="quality" />} />
      <Route path="/api-docs" element={<DocsPage mode="api" />} />
      <Route path="/privasi" element={<PrivacyPage />} />
      <Route path="/anggota/:publicKey" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
