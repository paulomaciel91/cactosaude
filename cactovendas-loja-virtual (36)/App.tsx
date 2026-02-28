
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import CatalogPage from './pages/CatalogPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import FeaturesPage from './pages/FeaturesPage';
import PlansPage from './pages/PlansPage';
import TermosUsoPage from './pages/TermosUsoPage';
import PrivacidadePage from './pages/PrivacidadePage';
import ContratoAssinaturaPage from './pages/ContratoAssinaturaPage';
import ThankYouPage from './pages/ThankYouPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CartProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/funcionalidades" element={<FeaturesPage />} />
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/termos" element={<TermosUsoPage />} />
            <Route path="/privacidade" element={<PrivacidadePage />} />
            <Route path="/contrato" element={<ContratoAssinaturaPage />} />
            <Route path="/obrigado" element={<ThankYouPage />} />
            
            {/* Rota dinâmica da loja na raiz. Deve ficar APÓS as rotas estáticas acima */}
            <Route path="/:slug" element={<CatalogPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
