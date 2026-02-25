"use client";
import { useState, useEffect } from 'react';
import { useGlobal } from '@/context/CartContext';
import { useParams } from 'next/navigation'; // Cambio clave: de Next, no de React Router
import './product.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { productos, addToCart, isMaintenance } = useGlobal();
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  const product = productos.find((p: any) => String(p.id) === String(id));

  if (!product) {
    return <div className="glitch">[!] PRODUCTO NO ENCONTRADO</div>;
  }

  const mainImg = displayImage || product.image_url;
  const basePrice = Number(product.price) || 0;
  const discount = Number(product.discount_percentage) || 0;
  const finalPrice = product.on_sale ? basePrice * (1 - discount / 100) : basePrice;
  const stockCount = Number(product.stock) || 0;

  return (
    <div className="product-layout"> {/* Fondo azul marino global aplicado aquí */}
      <div className="product-detail-container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div className="product-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* COLUMNA IZQUIERDA: IMÁGENES */}
          <div className="image-sector">
            <div className="main-image-container glass">
              <img src={mainImg} alt={product.name} className="main-product-img" />
            </div>
            
            <div className="gallery-grid" style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
              <img 
                src={product.image_url} 
                className={`gallery-thumb ${mainImg === product.image_url ? 'active' : ''}`}
                style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => setDisplayImage(product.image_url)}
              />
              {/* Mapeo de extras simplificado */}
              {(Array.isArray(product.images_extras) ? product.images_extras : product.images_extras?.split(',') || [])
                .filter(url => url.trim() !== "")
                .map((url, idx) => (
                  <img key={idx} src={url.trim()} className={`gallery-thumb ${mainImg === url.trim() ? 'active' : ''}`}
                    style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setDisplayImage(url.trim())} />
                ))
              }
            </div>
          </div>

          {/* COLUMNA DERECHA: INFO */}
          <div className="info-sector">
            {/* INDICADOR DE STOCK */}
            <div className={`stock-tag ${stockCount > 5 ? 'in-stock' : stockCount > 0 ? 'low-stock' : 'no-stock'}`}>
              {stockCount > 0 ? `DISPONIBLE: ${stockCount} UNIDADES` : 'FUERA DE SERVICIO'}
            </div>

            <h1 className="glow-title" style={{ fontSize: '3rem', marginBottom: '10px', fontFamily: 'var(--font-orbitron)' }}>
              {product.name}
            </h1>
            
            <p style={{ color: 'var(--electric-blue)', fontFamily: 'var(--font-orbitron)', fontSize: '14px', marginBottom: '20px' }}>
              SERIAL_NUMBER: #{product.id} // CAT: {product.cat}
            </p>

            <div style={{ marginBottom: '30px' }}>
              {product.on_sale && (
                <span style={{ textDecoration: 'line-through', color: 'var(--text-dim)', fontSize: '1.2rem', marginRight: '15px' }}>
                  ${basePrice.toLocaleString()}
                </span>
              )}
              <span style={{ fontSize: '2.5rem', color: 'var(--neon-cyan)', fontWeight: 'bold', fontFamily: 'var(--font-orbitron)' }}>
                ${finalPrice.toLocaleString()}
              </span>
            </div>

            <p className="glass" style={{ padding: '25px', borderRadius: '12px', border: '1px solid var(--glass-border)', lineHeight: '1.8', color: 'var(--text-dim)', marginBottom: '30px' }}>
              {product.description || 'Sin descripción técnica disponible para este modelo.'}
            </p>

            <button 
              className="btn-primary" 
              style={{ width: '100%', height: '70px', fontSize: '1.2rem' }}
              disabled={stockCount <= 0 || isMaintenance}
              onClick={() => addToCart(product)}
            >
              {stockCount > 0 ? 'ADQUIRIR EQUIPAMIENTO' : 'UNIDADES AGOTADAS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}