import './Footer.css';

const Footer = () => (
  <footer className="footer-gamer glass">
    <div className="footer-content">
      <div className="footer-section">
        <h4 className="nav-logo">GAMER<span>SHOP</span></h4>
        <p className="footer-text">El mejor loot para tu setup.</p>
      </div>
      <div className="footer-section">
        <label className="footer-label">SOPORTE</label>
        <p className="footer-link">FAQs</p>
        <p className="footer-link">Envíos</p>
      </div>
      <div className="footer-section">
        <label className="footer-label">SOCIAL</label>
        <div className="social-links">
          <span>IG</span> <span>TW</span> <span>DC</span>
        </div>
      </div>
    </div>
    <div className="footer-copyright">
      <div className="copyright-line" style={{ width: '50px', height: '2px', background: 'var(--neon-blue)', margin: '0 auto 20px' }}></div>
      <p>2024 © GAMERSHOP - TODOS LOS DERECHOS RESERVADOS</p>
    </div>
  </footer>
);

export default Footer;