"use server";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// --- PRODUCTOS ---

export async function fetchInventory() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('id', { ascending: true });
  
  if (error) return [];
  return data;
}

export async function saveProduct(product: any) {
  const { id, ...rest } = product;
  
  if (id) {
    const { error } = await supabase
      .from('productos')
      .update(rest)
      .eq('id', id);
    return { success: !error, error };
  } else {
    const { error } = await supabase
      .from('productos')
      .insert([rest]);
    return { success: !error, error };
  }
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error eliminando:", error);
    return { success: false, error };
  }
  return { success: true };
}

// --- VENTAS ---

export async function fetchVentas() {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .order('fecha', { ascending: false });
  
  if (error) {
    console.error("Error al traer ventas:", error);
    return [];
  }
  return data;
}

/**
 * REGISTRAR VENTA: Ahora calcula el precio final con descuento 
 * para evitar errores de registro en el Admin.
 */
export async function registrarVenta(ventaData: any) {
  try {
    let totalReal = 0;

    // Recalculamos el total item por item para asegurar que el descuento se aplique
    for (const item of ventaData.productos) {
      // Buscamos el precio oficial y descuento en la DB
      const { data: p } = await supabase
        .from('productos')
        .select('price, on_sale, discount_percentage')
        .eq('id', item.id)
        .single();

      if (p) {
        const precioBase = Number(p.price);
        const precioFinal = p.on_sale 
          ? precioBase * (1 - (p.discount_percentage / 100)) 
          : precioBase;
        
        totalReal += precioFinal * (item.quantity || 1);
      }
    }

    const { error } = await supabase
      .from('ventas')
      .insert([
        {
          productos: ventaData.productos, // Guardamos el array de items
          total: totalReal,               // <--- AQUÍ GUARDAMOS EL TOTAL CON DESCUENTO
          metodo_pago: ventaData.metodo,
          cliente_email: ventaData.email,
          fecha: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error en registro de venta:", err);
    return { success: false, error: err };
  }
}

// --- STOCK Y OTROS ---

export async function processStockUpdate(cartItems: any[]) {
  try {
    for (const item of cartItems) {
      const { data: currentProduct } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (currentProduct && currentProduct.stock > 0) {
        const nuevoStock = currentProduct.stock - (item.quantity || 1);
        await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id', item.id);
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function handleAuthDB(email: string, isLogin: boolean) {
  return { success: true, user: { email, id: 1 } };
}