import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { selectCartItemCount } from '../../store/cartSlice';
import { ShoppingCart } from 'lucide-react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const cartItemCount = useAppSelector(selectCartItemCount);

  return (
    <header className={styles.header}>
      <div className={styles.logoSection} onClick={() => navigate('/')}>
        <img src="/pizzeria_logo.png" alt="Pizzeria Logo" className={styles.logoImg} />
        <span className={styles.brandName}>Pizzeria</span>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to="/order"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.activeLink : ''}`
          }
        >
          Order Pizza
        </NavLink>
        <NavLink
          to="/build"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.activeLink : ''}`
          }
        >
          Build Ur Pizza
        </NavLink>
      </nav>

      <button className={styles.cartButton} onClick={() => navigate('/cart')}>
        <ShoppingCart size={18} />
        <span>Shopping Cart</span>
        {cartItemCount > 0 && <span className={styles.cartBadge}>{cartItemCount}</span>}
      </button>
    </header>
  );
};

export default Header;
