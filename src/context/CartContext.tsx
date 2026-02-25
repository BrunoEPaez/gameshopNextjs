"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchInventory, handleAuthDB } from '@/app/actions';

export interface Producto {
  id: number;
  name: string;
  price: number | string;
  image_url: string;
  cat: string; 
  sub_cat?: string;
  description?: string;
  on_sale?: boolean;
  stock: number;
  discount_percentage?: number;
  images_extras?: string | string[];
}

interface User {
  email: string;
  id?: number;
}

interface CartContextType {
  cart: Producto[];
  productos: Producto[];
  user: User | null;
  loading: boolean;
  isMaintenance: boolean; 
  setIsMaintenance: (val: boolean) => void;
  addToCart: (producto: Producto) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  login: (email: string) => Promise<void>; 
  logout: () => void;
  refreshProducts: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Producto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // 1. CARGA INICIAL: Usuario, Inventario, Mantenimiento y CARRITO
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar Usuario
      const userGuardado = localStorage.getItem('user_gamer');
      if (userGuardado) setUser(JSON.parse(userGuardado));

      // Cargar Carrito Persistente
      const cartGuardado = localStorage.getItem('cart_gamer');
      if (cartGuardado) {
        setCart(JSON.parse(cartGuardado));
      }

      // Cargar Estado de Mantenimiento
      const maintenanceSaved = localStorage.getItem('app_maintenance');
      if (maintenanceSaved) setIsMaintenance(JSON.parse(maintenanceSaved));

      // Cargar Inventario desde la DB
      const data = await fetchInventory();
      if (data) setProductos(data);

    } catch (error) {
      console.error("Error en carga inicial:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. PERSISTENCIA AUTOMÁTICA DEL CARRITO
  // Cada vez que el estado 'cart' cambie, guardamos en localStorage
  useEffect(() => {
    if (!loading) { // Evitamos sobreescribir con un array vacío durante la carga inicial
      localStorage.setItem('cart_gamer', JSON.stringify(cart));
    }
  }, [cart, loading]);

  // Funciones del Carrito
  const addToCart = (producto: Producto) => {
    setCart(prev => [...prev, producto]);
  };

  const removeFromCart = (indexToRemove: number) => {
    setCart(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart_gamer');
  };

  // Autenticación
  const login = async (email: string) => {
    try {
      const res = await handleAuthDB(email, true); 
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('user_gamer', JSON.stringify(res.user));
      }
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_gamer');
  };

  // Función para forzar actualización de productos
  const refreshProducts = async () => {
    const data = await fetchInventory();
    if (data) setProductos(data);
  };

  // Sincronizar estado de mantenimiento
  const updateMaintenance = (val: boolean) => {
    setIsMaintenance(val);
    localStorage.setItem('app_maintenance', JSON.stringify(val));
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      productos, 
      user, 
      loading, 
      isMaintenance, 
      setIsMaintenance: updateMaintenance,
      addToCart, 
      removeFromCart, 
      clearCart, 
      login, 
      logout, 
      refreshProducts
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useGlobal debe usarse dentro de un CartProvider");
  return context;
};