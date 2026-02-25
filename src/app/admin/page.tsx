"use client";
import { useState, useEffect } from 'react';
import { useGlobal } from '@/context/CartContext';
import { saveProduct, fetchVentas, deleteProduct } from '@/app/actions'; 
import { createClient } from '@supabase/supabase-js';
import './admin.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AdminPage() {
  const { productos, refreshProducts, isMaintenance, setIsMaintenance } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ventas, setVentas] = useState<any[]>([]);
  const [stockPage, setStockPage] = useState(1);
  const itemsPerStockPage = 10; // Cuántos productos ver por vez



  const [productData, setProductData] = useState({
    name: '', price: '', stock: '', description: '',
    category: 'JUEGOS', sub_cat: '', on_sale: false, 
    discount_percentage: 0, image_url: '', images_extras: '' 
  });

  // Cambiamos el estado para que guarde las ventas filtradas
  useEffect(() => {
    const loadVentas = async () => {
      const data = await fetchVentas();
      if (data) {
        // FILTRO: Solo tomamos ventas que NO sean de WhatsApp para el KPI
        const ventasConfirmadas = data.filter((v: any) => v.metodo_pago !== 'WhatsApp');
        setVentas(ventasConfirmadas);
      }
    };
    loadVentas();
  }, []);

  // CALCULAMOS EL TOTAL: Solo sobre el estado 'ventas' que ya está filtrado
  const totalVendido = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);

  const formatCurrency = (amount: number | string) => {
    return Number(amount).toLocaleString('es-AR', {
      style: 'currency', currency: 'ARS',
      minimumFractionDigits: 2
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('productos').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('productos').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
      if (isMain) {
        setProductData(prev => ({ ...prev, image_url: uploadedUrls[0] }));
      } else {
        const currentExtras = productData.images_extras ? productData.images_extras.split(',').map(s => s.trim()) : [];
        const newExtras = [...currentExtras, ...uploadedUrls].filter(url => url !== "");
        setProductData(prev => ({ ...prev, images_extras: newExtras.join(', ') }));
      }
      alert(`✅ FOTO(S) CARGADA(S)`);
    } catch (error) {
      alert("❌ ERROR EN LA SUBIDA");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (p: any) => {
    setIsEditing(true);
    setEditingId(p.id);
    setProductData({
      name: p.name || '',
      price: (p.price || 0).toString(),
      stock: (p.stock || 0).toString(),
      description: p.description || '',
      category: p.category || 'JUEGOS',
      sub_cat: p.sub_cat || '',
      on_sale: p.on_sale || false,
      discount_percentage: p.discount_percentage || 0,
      image_url: p.image_url || '',
      images_extras: Array.isArray(p.images_extras) ? p.images_extras.join(', ') : (p.images_extras || '')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`¿ELIMINAR PRODUCTO: ${name.toUpperCase()}?`)) {
      const res = await deleteProduct(id);
      if (res.success) {
        alert("🗑️ ELIMINADO");
        refreshProducts();
      }
    }
  };

  const handleSave = async () => {
    if (!productData.name || !productData.price) {
      alert("⚠️ DATOS INSUFICIENTES");
      return;
    }
    const extrasArray = productData.images_extras 
      ? productData.images_extras.split(',').map(img => img.trim()).filter(img => img !== "") 
      : [];

    const res = await saveProduct({ ...productData, id: editingId, images_extras: extrasArray });
    if (res.success) {
      alert("🚀 PROCESADO");
      setIsEditing(false);
      setEditingId(null);
      setProductData({
        name: '', price: '', stock: '', description: '',
        category: 'JUEGOS', sub_cat: '', on_sale: false, 
        discount_percentage: 0, image_url: '', images_extras: ''
      });
      refreshProducts();
    }
  };

  const cleanDuplicateSales = async () => {
  if (!confirm("¿Deseas purgar registros de ventas duplicados?")) return;
  
  try {
    // Creamos un set para trackear lo que ya vimos
    const seen = new Set();
    const duplicates: number[] = [];

    ventas.forEach((v: any) => {
      // Creamos una "llave" única basada en cliente, total y fecha
      const identifier = `${v.cliente_email}-${v.total}-${new Date(v.fecha).getTime()}`;
      if (seen.has(identifier)) {
        duplicates.push(v.id);
      } else {
        seen.add(identifier);
      }
    });

    if (duplicates.length === 0) {
      alert("No se encontraron ventas duplicadas.");
      return;
    }

    // Borramos los duplicados en Supabase
    for (const idToDel of duplicates) {
      await supabase.from('ventas').delete().eq('id', idToDel);
    }

    alert(`Se eliminaron ${duplicates.length} registros duplicados.`);
    // Recargamos la página para actualizar el totalVendido
    window.location.reload();
    
  } catch (error) {
    console.error("Error limpiando:", error);
    alert("Error al procesar la limpieza.");
  }
};




 return (
  /* Eliminamos el margin auto que dejaba ver el fondo negro de la página */
  <div className="admin-container" style={{ minHeight: '100vh', padding: '120px 20px 40px' }}>
    
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}> {/* Contenedor centrado interno */}
      
      {/* KPI DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="glass" style={{ padding: '20px' }}>
          <p style={{ fontSize: '10px', color: 'var(--electric-blue)', margin: 0 }}>VENTAS NETAS</p>
          <h2 style={{ color: 'var(--neon-cyan)', margin: '5px 0' }}>{formatCurrency(totalVendido)}</h2>
          {/* Botón de purga movido aquí para que no estorbe */}
          <button onClick={cleanDuplicateSales} style={{ background: 'none', border: 'none', color: 'var(--neon-pink)', cursor: 'pointer', fontSize: '9px', padding: 0 }}>[LIMPIAR DUPLICADOS]</button>
        </div>
        <div className="glass" style={{ padding: '20px', border: isMaintenance ? '1px solid var(--neon-pink)' : '1px solid var(--neon-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '10px', color: isMaintenance ? 'var(--neon-pink)' : 'var(--neon-blue)', margin: 0 }}>MODO VACACIONES</p>
              <h4 style={{ margin: '5px 0', color: 'white' }}>{isMaintenance ? 'SISTEMA OFFLINE' : 'SISTEMA ONLINE'}</h4>
            </div>
            <label className="gamer-switch">
              <input type="checkbox" checked={isMaintenance} onChange={(e) => setIsMaintenance(e.target.checked)} />
              <span className="gamer-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE CARGA */}
      <div className="glass" style={{ padding: '25px', marginBottom: '40px', border: isEditing ? '1px solid var(--neon-pink)' : '1px solid rgba(0, 210, 255, 0.2)' }}>
        <h3 className="glitch-small" style={{ fontSize: '14px', marginBottom: '20px' }}>
          {isEditing ? `[!] EDITANDO ID: ${editingId}` : '[+] NUEVO REGISTRO'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input type="text" placeholder="NOMBRE" value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} className="admin-input" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select className="admin-input" value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})} style={{flex: 1}}>
              <option value="JUEGOS">JUEGOS</option>
              <option value="CONSOLAS">CONSOLAS</option>
              <option value="PC GAMER">PC GAMER</option>
              <option value="PERIFÉRICOS">PERIFÉRICOS</option>
            </select>
            <input type="text" placeholder="SUB-CAT" value={productData.sub_cat} onChange={e => setProductData({...productData, sub_cat: e.target.value.toUpperCase()})} className="admin-input" style={{flex: 1}} />
          </div>
          <input type="number" placeholder="PRECIO BASE" value={productData.price} onChange={e => setProductData({...productData, price: e.target.value})} className="admin-input" />
          <input type="number" placeholder="STOCK" value={productData.stock} onChange={e => setProductData({...productData, stock: e.target.value})} className="admin-input" />
          
          <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '20px' }}>
             <label style={{ color: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={productData.on_sale} onChange={e => setProductData({...productData, on_sale: e.target.checked})} /> ¿EN OFERTA?
            </label>
            {productData.on_sale && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="number" placeholder="%" value={productData.discount_percentage} onChange={e => setProductData({...productData, discount_percentage: parseInt(e.target.value) || 0})} className="admin-input" style={{ width: '80px' }} />
                <span style={{ color: 'var(--neon-green)', fontSize: '12px' }}>
                  PRECIO FINAL: {formatCurrency(Number(productData.price) * (1 - (productData.discount_percentage / 100)))}
                </span>
              </div>
            )}
          </div>

          {/* --- SECCIÓN DE IMÁGENES --- */}
<div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '5px' }}>
  
  {/* Imagen Principal */}
  <div>
    <label style={{ color: 'var(--neon-blue)', fontSize: '10px', display: 'block', marginBottom: '5px' }}>FOTO PRINCIPAL (CARDS)</label>
    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="admin-input" style={{ fontSize: '10px' }} />
    {productData.image_url && <p style={{ fontSize: '9px', color: 'var(--neon-green)', marginTop: '5px' }}>✓ Cargada</p>}
  </div>

  {/* Imágenes Secundarias */}
  <div>
    <label style={{ color: 'var(--neon-blue)', fontSize: '10px', display: 'block', marginBottom: '5px' }}>FOTOS EXTRAS (GALERÍA)</label>
    <input type="file" accept="image/*" multiple onChange={(e) => handleFileUpload(e, false)} className="admin-input" style={{ fontSize: '10px' }} />
    <p style={{ fontSize: '9px', opacity: 0.6, marginTop: '5px' }}>{productData.images_extras ? 'Varios archivos detectados' : 'Sin extras'}</p>
  </div>

</div>




          <textarea placeholder="DESCRIPCIÓN" value={productData.description} onChange={e => setProductData({...productData, description: e.target.value})} className="admin-input" style={{ gridColumn: 'span 2', minHeight: '80px' }} />
          <button className="nav-btn" style={{ gridColumn: 'span 2', height: '50px' }} onClick={handleSave} disabled={isUploading}>
            {isEditing ? '⚡ ACTUALIZAR DATOS' : '🚀 LANZAR PRODUCTO'}
          </button>
        </div>
      </div>

      {/* REGISTRO DE VENTAS REALES */}
<div className="admin-inventory-section" style={{ marginBottom: '50px' }}>
  <h2 className="sidebar-title" style={{ color: 'var(--neon-green)' }}>LOG_DE_VENTAS_CONFIRMADAS</h2>
  <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
    <table className="admin-table">
      <thead>
        <tr>
          <th>FECHA</th>
          <th>CLIENTE</th>
          <th>PRODUCTOS</th> {/* COLUMNA NUEVA */}
          <th>TOTAL PAGADO</th>
          <th>MÉTODO</th>
        </tr>
      </thead>
      <tbody>
        {ventas.length > 0 ? ventas.map((v, i) => (
          <tr key={i}>
            <td style={{ fontSize: '12px' }}>{new Date(v.fecha).toLocaleDateString()}</td>
            <td style={{ fontSize: '11px' }}>{v.cliente_email}</td>
            
            {/* Lógica para mostrar la lista de productos vendidos */}
            <td style={{ fontSize: '10px', maxWidth: '250px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {v.productos && Array.isArray(v.productos) ? (
                  v.productos.map((p: any, idx: number) => (
                    <span key={idx} style={{ color: 'rgba(255,255,255,0.8)' }}>
                      • {p.name} <b style={{ color: 'var(--neon-blue)' }}>(x{p.quantity || 1})</b>
                    </span>
                  ))
                ) : (
                  <span style={{ opacity: 0.5 }}>Sin datos de items</span>
                )}
              </div>
            </td>

            <td style={{ color: 'var(--electric-blue)', fontWeight: 'bold' }}>{formatCurrency(v.total)}</td>
            <td>
              <span className="discount-badge" style={{ background: '#009EE3', color: 'black', fontSize: '9px' }}>
                {v.metodo_pago}
              </span>
            </td>
          </tr>
        )) : (
          <tr><td colSpan={5} style={{ textAlign: 'center', opacity: 0.5 }}>NO HAY VENTAS CONFIRMADAS</td></tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* CONTROL DE STOCK CON BUSCADOR Y PAGINACIÓN */}
<div className="admin-inventory-section">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
    <h2 className="sidebar-title">CONTROL_STOCK</h2>
    <div style={{ position: 'relative' }}>
       <input 
        type="text" 
        placeholder="🔍 BUSCAR PRODUCTO..." 
        className="admin-input" 
        style={{ width: '300px', border: '1px solid var(--neon-blue)' }} 
        onChange={(e) => { setSearchTerm(e.target.value); setStockPage(1); }} 
      />
    </div>
  </div>
  
  <div style={{ overflowX: 'auto' }}>
    <table className="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>IMG</th>
          <th>PRODUCTO</th>
          <th>STOCK</th>
          <th>PRECIO BASE</th>
          <th>ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          const filteredItems = productos
            .filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice().reverse();
          
          const totalStockPages = Math.ceil(filteredItems.length / itemsPerStockPage);
          const paginatedItems = filteredItems.slice((stockPage - 1) * itemsPerStockPage, stockPage * itemsPerStockPage);

          return (
            <>
              {paginatedItems.map((p: any) => (
                <tr key={p.id} className="admin-row-hover">
                  <td>#{p.id}</td>
                  <td><img src={p.image_url} alt="thumb" style={{ width: '40px', height: '40px', objectFit: 'cover' }} /></td>
                  <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ color: p.stock <= 3 ? 'var(--neon-pink)' : 'white' }}>{p.stock}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEdit(p)} className="nav-btn" style={{ padding: '4px 10px', fontSize: '10px' }}>EDIT</button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="nav-btn" style={{ padding: '4px 10px', fontSize: '10px', background: 'var(--neon-pink)' }}>DELETE</button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* FILA DE PAGINACIÓN AL FINAL DE LA TABLA */}
              {totalStockPages > 1 && (
                <tr>
                  <td colSpan={6}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '15px', alignItems: 'center' }}>
                      <button className="nav-btn" disabled={stockPage === 1} onClick={() => setStockPage(stockPage - 1)} style={{ padding: '5px 15px' }}>ATRÁS</button>
                      <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: '12px' }}>{stockPage} / {totalStockPages}</span>
                      <button className="nav-btn" disabled={stockPage >= totalStockPages} onClick={() => setStockPage(stockPage + 1)} style={{ padding: '5px 15px' }}>SIGUIENTE</button>
                    </div>
                  </td>
                </tr>
              )}
            </>
          );
        })()}
      </tbody>
    </table>
  </div>
</div>
    </div>
    </div>
  );
}