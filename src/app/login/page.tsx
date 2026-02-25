"use client";

import { useState } from 'react';
import { useGlobal } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useGlobal();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de login - Aquí conectarías con tu API
    if (email && password) {
      login(email);
      router.push('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <h1 className="glitch-text">ACCESO_<span>SISTEMA</span></h1>
          <p>INGRESA TUS CREDENCIALES DE AGENTE</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>ID_USUARIO (EMAIL)</label>
            <input 
              type="email" 
              placeholder="agente@gamershop.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>CÓDIGO_ACCESO</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            INICIAR_SESIÓN
          </button>
        </form>

        <div className="auth-footer">
          <p>¿NUEVO EN EL SECTOR? <Link href="/register">SOLICITAR ACCESO</Link></p>
        </div>
      </div>
    </div>
  );
}