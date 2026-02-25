"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation'; // Agregamos useSearchParams
import { useGlobal } from '@/context/CartContext'; 
import './Navbar.css';

const Navbar = () => {
  const { cart, user, logout } = useGlobal(); 
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const cartCount = cart?.length || 0;

  // Sincronizar el input con la URL (por si el usuario navega atrás/adelante)
  useEffect(() => {
    const currentSearch = searchParams.get('search');
    if (currentSearch) setSearchTerm(currentSearch);
  }, [searchParams]);

  useEffect(() => {
    setShowNavMenu(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNavMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Si hay texto, busca. Si está vacío, va a explore limpio.
    if (searchTerm.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push(`/explore`);
    }
  };

  return (
    <nav className="top-nav">
      <div className="nav-container">
        
        {/* IZQUIERDA: LOGO Y DROPDOWN */}
        <div className="nav-left-section">
          <Link href="/" className="nav-logo">
            GAMER<span>SHOP</span>
          </Link>
          
          <div className="nav-dropdown-wrapper" ref={menuRef}>
            <button className="nav-explore-btn" onClick={() => setShowNavMenu(!showNavMenu)}>
              EXPLORAR ▾
            </button>
            
            {showNavMenu && (
              <div className="nav-mega-menu glass">
                <Link href="/explore?categoria=CONSOLAS" className="menu-category-item">CONSOLAS</Link>
                <Link href="/explore?categoria=PC GAMER" className="menu-category-item">PC GAMER</Link>
                <Link href="/explore?categoria=PERIFÉRICOS" className="menu-category-item">PERIFÉRICOS</Link>
                <Link href="/explore" className="menu-category-item special">VER TODO</Link>
              </div>
            )}
          </div>
        </div>

        {/* CENTRO: BUSCADOR */}
        <form className="nav-search-container" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Buscar loot..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-btn">🔍</button>
        </form>

        {/* DERECHA: CARRITO, ADMIN Y AUTH */}
        <div className="nav-right-section">
          
          <Link href="/admin" className="nav-admin-link" style={{
            marginRight: '15px',
            padding: '6px 12px',
            border: '1px solid var(--neon-blue)',
            borderRadius: '4px',
            color: 'var(--neon-blue)',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            fontFamily: 'Orbitron, sans-serif',
            background: 'rgba(0, 243, 255, 0.05)',
            transition: 'all 0.3s ease'
          }}>
            🛠️ ADMIN PANEL
          </Link>

          <Link href="/cart" className="nav-icon-link">
            <div className="cart-icon-wrapper">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
          </Link>

          {user ? (
            <div className="user-nav-info">
              <span className="user-name">{user.email?.split('@')[0].toUpperCase()}</span>
              <button onClick={logout} className="nav-btn btn-exit">SALIR</button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link href="/login" className="nav-btn btn-login">LOGIN</Link>
              <Link href="/register" className="nav-btn btn-reg">REGISTRO</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;