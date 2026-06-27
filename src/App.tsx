import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { fetchMenuData } from './store/menuSlice';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import OrderPizza from './pages/OrderPizza/OrderPizza';
import BuildPizza from './pages/BuildPizza/BuildPizza';
import CartCheckout from './pages/CartCheckout/CartCheckout';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import Admin from './pages/Admin/Admin';

import { useLocation } from 'react-router-dom';

function AppContent() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchMenuData());
  }, [dispatch]);

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<OrderPizza />} />
          <Route path="/build" element={<BuildPizza />} />
          <Route path="/cart" element={<CartCheckout />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
