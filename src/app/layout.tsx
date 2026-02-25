import type { Metadata } from "next";
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Suspense } from 'react'; // <--- IMPORT SUSPENSE
import "./globals.css";

export const metadata: Metadata = {
  title: "GamerShop | Next.js",
  description: "Tienda de componentes gamer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* El Provider envuelve todo para que el Contexto funcione */}
        <CartProvider>
          
          {/* We wrap Navbar and children in Suspense. 
            This prevents the build from crashing when using useSearchParams().
          */}
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px', color: 'var(--neon-blue)' }}>LOADING SYSTEM...</div>}>
            
            <Navbar />
            
            <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
              {children}
            </main>

            <Footer />

          </Suspense>
          
        </CartProvider>
      </body>
    </html>
  );
}