import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CampaignLandingPage } from './pages/CampaignLandingPage';

/** Rotas da landing; em PROD o Nginx deve fazer fallback para index.html nestas paths. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/campanha/:campaignId" element={<CampaignLandingPage />} />
        <Route
          path="/"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-brand-muted px-6 text-center text-sm text-brand-soft">
              <p>
                Use a rota{' '}
                <code className="rounded bg-brand-white px-1.5 py-0.5 text-brand-navy ring-1 ring-black/10">
                  /campanha/&lt;UUID&gt;
                </code>
              </p>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
