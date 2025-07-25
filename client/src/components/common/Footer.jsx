import React from 'react';
import { 
  FaDumbbell, 
  FaGithub, 
  FaTwitter, 
  FaInstagram, 
  FaDiscord,
  FaEnvelope,
  FaHeart
} from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import footerContent from './content/footer.json';
import './styles/footer.css';

const Footer = () => {
  const { navigateAndClose } = useAppContext();

  // Icon mapping for social links
  const iconMap = {
    FaGithub: FaGithub,
    FaTwitter: FaTwitter,
    FaInstagram: FaInstagram,
    FaDiscord: FaDiscord
  };

  const handleLinkClick = (url) => {
    // Check if it's an external link
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener noreferrer');
    } else {
      // Internal navigation
      navigateAndClose(url);
    }
  };

  const renderFooterSection = (sectionKey, sectionData) => (
    <div key={sectionKey} className="footer__section">
      <h3 className="footer__section-title">{sectionData.title}</h3>
      <ul className="footer__links">
        {sectionData.links.map((link, index) => (
          <li key={index}>
            <button
              className="footer__link"
              onClick={() => handleLinkClick(link.url)}
              aria-label={`Ir a ${link.text}`}
            >
              {link.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="footer__social">
      {footerContent.social.links.map((social, index) => {
        const IconComponent = iconMap[social.icon];
        return (
          <a
            key={index}
            href={social.url}
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visitar ${social.platform}`}
          >
            {IconComponent && <IconComponent className="footer__social-icon" />}
          </a>
        );
      })}
    </div>
  );

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        {/* Main footer content */}
        <div className="footer__main">
          {/* Brand section */}
          <div className="footer__brand">
            <div className="footer__brand-name">
              <FaDumbbell className="footer__brand-icon" />
              {footerContent.brand.name}
            </div>
            <p className="footer__brand-tagline">
              {footerContent.brand.tagline}
            </p>
            <p className="footer__brand-description">
              {footerContent.brand.description}
            </p>
            {renderSocialLinks()}
          </div>

          {/* Footer sections */}
          {Object.entries(footerContent.sections).map(([key, section]) =>
            renderFooterSection(key, section)
          )}
        </div>

        {/* Bottom section */}
        <div className="footer__bottom">
          <div className="footer__copyright">
            <span>
              © {footerContent.copyright.year} {footerContent.brand.name}. {footerContent.copyright.text}
            </span>
            <span style={{ margin: '0 var(--spacing-2)' }}>•</span>
            <span>{footerContent.copyright.license}</span>
          </div>
          
          <div className="footer__contact">
            <span>
              Desarrollado con <FaHeart style={{ color: 'var(--color-error)', margin: '0 4px' }} /> por {footerContent.contact.developer}
            </span>
            <a 
              href={`mailto:${footerContent.contact.email}`}
              className="footer__contact-email"
              aria-label="Enviar email al desarrollador"
            >
              <FaEnvelope style={{ marginRight: 'var(--spacing-1)' }} />
              {footerContent.contact.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;