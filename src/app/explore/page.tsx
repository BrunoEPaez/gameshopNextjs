"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGlobal } from '@/context/CartContext';
import './explore.css';
import '../page.css'; 

function ExploreContent() {
  const { productos, addToCart, isMaintenance } = useGlobal(); // Agregamos isMaintenance
  const searchParams = useSearchParams();
  
  const currentSearch = searchParams.get('search')?.toLowerCase() || "";
  const currentCat = searchParams.get('categoria')?.toUpperCase() || 'TODOS';

  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setPage(1);
  }, [currentSearch, currentCat]);

  // BLOQUEO POR MANTENIMIENTO / VACACIONES
  if (isMaintenance) {
    return (
      <div className="main-scrollable" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass" style={{ padding: '50px', textAlign: 'center', border: '2px solid var(--neon-pink)', maxWidth: '600px' }}>
          <h1 className="glitch" style={{ fontSize: '3rem', color: 'var(--neon-pink)' }}>SISTEMA OFFLINE</h1>
          <div style={{ margin: '20px 0', height: '2px', background: 'linear-gradient(90deg, transparent, var(--neon-pink), transparent)' }}></div>
          <p className="hero-subtitle" style={{ fontSize: '1rem', color: '#fff' }}>
            EXPLORACIÓN DESACTIVADA TEMPORALMENTE.
          </p>
          <Link href="/" className="filter-btn" style={{ marginTop: '30px', display: 'inline-block', textDecoration: 'none' }}>
            VOLVER AL HUB
          </Link>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    const list = (productos || []).filter((p: any) => {
      const productName = (p.name || "").toLowerCase();
      const productCat = (p.cat || p.category || "").toUpperCase();
      const matchesSearch = currentSearch === "" || productName.includes(currentSearch);

      let matchesCategory = false;
      if (currentCat === 'TODOS') {
        matchesCategory = true;
      } else if (currentCat === 'OFERTAS') {
        matchesCategory = Boolean(p.on_sale);
      } else {
        matchesCategory = productCat === currentCat;
      }
      return matchesSearch && matchesCategory;
    });

    return [...list].reverse();
  }, [productos, currentSearch, currentCat]);

  const sortedProducts = useMemo(() => {
    const list = [...filtered];
    if (sort === 'low') list.sort((a: any, b: any) => {
        const pA = a.on_sale ? Number(a.price) * (1 - Number(a.discount_percentage || 0)/100) : Number(a.price);
        const pB = b.on_sale ? Number(b.price) * (1 - Number(b.discount_percentage || 0)/100) : Number(b.price);
        return pA - pB;
    });
    if (sort === 'high') list.sort((a: any, b: any) => {
        const pA = a.on_sale ? Number(a.price) * (1 - Number(a.discount_percentage || 0)/100) : Number(a.price);
        const pB = b.on_sale ? Number(b.price) * (1 - Number(b.discount_percentage || 0)/100) : Number(b.price);
        return pB - pA;
    });
    return list;
  }, [filtered, sort]);

  const displayProducts = sortedProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="explore-layout">
      <aside className="filters-sidebar glass">
        <div className="filter-group">
          <label className="sidebar-title">CATEGORÍAS</label>
          {['TODOS', 'OFERTAS', 'PC GAMER', 'CONSOLAS', 'PERIFÉRICOS'].map(cat => (
            <Link 
              key={cat} 
              href={cat === 'TODOS' ? '/explore' : `/explore?categoria=${cat}`}
              className={`filter-group-btn ${currentCat === cat ? 'active' : ''}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="filter-group">
          <label className="sidebar-title">ORDENAR POR</label>
          <select onChange={(e) => setSort(e.target.value)} className="gamer-select-small">
            <option value="default">MÁS RECIENTES</option>
            <option value="low">MENOR PRECIO</option>
            <option value="high">MAYOR PRECIO</option>
          </select>
        </div>
      </aside>

      <div className="main-content">
        <div className="items-grid">
          {displayProducts.map((p: any) => {
            const priceNum = Number(p.price);
            const finalPrice = p.on_sale ? priceNum * (1 - (p.discount_percentage || 0) / 100) : priceNum;
            const sinStock = Number(p.stock) <= 0;
            
            return (
              <div key={p.id} className="gamer-card">
                <div className="price-container">
                  {p.on_sale ? (
                    <>
                      <span className="old-price">${priceNum.toLocaleString()}</span>
                      <span className="current-price sale-price">${finalPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                      <div className="discount-badge-home">-{p.discount_percentage}% OFF</div>
                    </>
                  ) : (
                    <span className="current-price">${priceNum.toLocaleString()}</span>
                  )}
                </div>

                <Link href={`/producto/${p.id}`} className="image-container">
                  <img src={p.image_url} alt={p.name} />
                </Link>

                <h3>{p.name}</h3>
                <p className="company">{p.cat || p.category || 'GEAR'}</p>
                <button 
                  className="buy-button" 
                  onClick={() => !sinStock && addToCart(p)}
                  disabled={sinStock}
                >
                  {sinStock ? 'SIN STOCK' : 'ADQUIRIR'}
                </button>
              </div>
            );
          })}
        </div>
        
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '50px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button className="filter-btn" disabled={page === 1} onClick={() => {setPage(page - 1); window.scrollTo(0,0)}}>ATRÁS</button>
            <span className="hero-subtitle">{page} / {totalPages}</span>
            <button className="filter-btn" disabled={page >= totalPages} onClick={() => {setPage(page + 1); window.scrollTo(0,0)}}>SIGUIENTE</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div className="loading-text">LOADING...</div>}>
      <ExploreContent />
    </Suspense>
  );
}