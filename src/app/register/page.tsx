"use client";

import { useState } from 'react';
import { useGlobal } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { login } = useGlobal();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
      login(formData.email);
      router.push('/');
    } else {
      alert("Las contraseñas no coinciden, recluta.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <h1 className="glitch-text">NUEVO_<span>REGISTRO</span></h1>
          <p>CREA TU PERFIL DE JUGADOR PROFESIONAL</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>NICKNAME</label>
            <input 
              type="text" 
              placeholder="PLAYER_ONE"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label>EMAIL</label>
            <input 
              type="email" 
              placeholder="tu@correo.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label>PASSWORD</label>
            <input 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label>CONFIRMAR PASSWORD</label>
            <input 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn register">
            CREAR_CUENTA
          </button>
        </form>

        <div className="auth-footer">
          <p>¿YA TIENES CUENTA? <Link href="/login">LOGUEARSE</Link></p>
        </div>
      </div>
    </div>
  );
}