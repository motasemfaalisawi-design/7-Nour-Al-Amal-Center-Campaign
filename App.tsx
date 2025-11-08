
import React, { useState, useCallback, FC, ReactNode, useRef, useEffect } from 'react';
import type { Page, Donor, DonationDetails, TeamMember } from './types';
import { CAMPAIGN_GOAL, INITIAL_DONORS, INITIAL_TOTAL, TEAM_MEMBERS } from './constants';


// --- Upwork-style Icons ---

const DownloadIcon: FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 inline mx-1 ${className}`} fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const LinkedInIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

const ChevronDownIcon: FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${className}`} fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const ChevronLeftIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const MenuIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ShareIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

const WhatsAppIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.398 1.908 6.196l-1.424 5.204 5.025-1.325zM9.356 8.014c-.13-.349-.26-.354-.393-.354-.122 0-.26 0-.393.004-.132 0-.332.062-.5.332-.17.27-.633.633-.633 1.54 0 .907.648 1.789.733 1.912.084.122 1.25 1.988 3.03 2.682.43.168.767.268 1.03.339.432.115.828.098 1.143-.057.363-.172 1.03-1.03 1.183-1.364.152-.332.152-.619.106-.733-.046-.115-.178-.173-.349-.299l-2.09-1.025c-.178-.087-.302-.132-.426.132-.123.265-.47.578-.578.683-.105.106-.21.123-.372.046-.163-.075-.683-.25-1.299-.792-.482-.423-.804-.952-.89-1.113z" />
    </svg>
);

const FacebookIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
    </svg>
);

const InstagramIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z" />
    </svg>
);

const YouTubeIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
    </svg>
);

const ChatIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const SendIcon: FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const ContributeIcon: FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.83,3.22A1,1,0,0,0,11.41,3.22L11,3.32V11a1,1,0,0,1-2,0V5.43a1,1,0,0,0-1.29-.95A1,1,0,0,0,7,5.43V11a1,1,0,0,1-2,0V8.84a1,1,0,0,0-1.93-.37,1,1,0,0,0,.22.72V12a1,1,0,0,1-2,0V11.2a1,1,0,0,0-1.88-.49,1,1,0,0,0,.29.69v3A5,5,0,0,0,5,19.32v.86A2.82,2.82,0,0,0,7.82,23h8.36A2.82,2.82,0,0,0,19,20.18v-5.3A5,5,0,0,0,14,10.2V4.65a1,1,0,0,0-.4-.8A1,1,0,0,0,12.83,3.22Z"/>
    </svg>
);


const VolunteerIcon: FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.28a4.5 4.5 0 00-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 00-1.13-1.897l-2.28-7.5a3 3 0 002.72-4.682A9.095 9.095 0 0018 5.283m-3.078 1.859a2.25 2.25 0 00-3.078 0L9 9.324l-3.078-2.179a2.25 2.25 0 00-3.078 0L.922 9.324a2.25 2.25 0 000 3.078l2.179 3.078a2.25 2.25 0 003.078 0L9 12.324l3.078 2.179a2.25 2.25 0 003.078 0l2.179-3.078a2.25 2.25 0 000-3.078l-2.179-3.078z" />
    </svg>
);

const UserIcon: FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


// --- Modal Component ---
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title" 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"></div>
            <div 
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-xl shadow-xl w-full max-w-md m-4 transform animate-slide-up"
            >
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 id="modal-title" className="text-xl font-bold text-brand-text-dark">{title}</h3>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-gray-700 transition p-1 rounded-full">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 text-brand-text-light leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- Layout Components ---

const navLinks = [
  { href: '#about', text: 'عن الحملة' },
  { href: '#benefits', text: 'جدوى المشروع' },
  { href: '#funds', text: 'إنفاق التبرعات' },
  { href: '#team', text: 'فريق المشروع' },
  { href: '#vision', text: 'رؤيتنا' },
  { href: '#results', text: 'النتائج' },
  { href: '#plan', text: 'مراحل التنفيذ' },
  { href: '#', text: 'آخر الأخبار', id: 'news-link' },
];


const Header: React.FC<{ onNavClick: (anchor: string) => void }> = ({ onNavClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [showBrochurePopup, setShowBrochurePopup] = useState(false);

    const handleNewsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsNewsModalOpen(true);
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    };
    
    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        onNavClick(href);
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    const handleBrochureClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowBrochurePopup(true);
        setTimeout(() => {
            setShowBrochurePopup(false);
            window.open('/brochure.pdf', '_blank', 'noopener,noreferrer');
        }, 2000);
    };

    const NavLinks: FC<{ isMobile?: boolean }> = ({ isMobile }) => (
        <>
            {navLinks.map((link) => {
                 if (link.id === 'news-link') {
                    return (
                        <button 
                            key={link.id} 
                            onClick={handleNewsClick}
                            className={`font-medium transition ${isMobile ? 'block text-right w-full px-4 py-3 text-lg' : 'px-3 py-2 text-sm'} text-brand-text-light hover:text-brand-primary`}
                        >
                            {link.text}
                        </button>
                    );
                }
                return (
                    <a key={link.href} href={link.href} onClick={(e) => handleLinkClick(e, link.href)}
                       className={`font-medium transition ${isMobile ? 'block px-4 py-3 text-lg' : 'px-3 py-2 text-sm'} text-brand-text-light hover:text-brand-primary`}>
                        {link.text}
                    </a>
                )
            })}
        </>
    );

    return (
        <>
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <a href="#top" onClick={(e) => handleLinkClick(e, '#top')} className="flex items-center space-x-3 rtl:space-x-reverse">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-primary">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <h1 className="text-xl font-bold text-brand-text-dark">مركز نور الأمل</h1>
                        </a>
                        <nav className="hidden lg:flex items-center gap-1">
                            <NavLinks />
                        </nav>
                        <div className="flex items-center gap-2">
                             <a href="/brochure.pdf" onClick={handleBrochureClick} className="bg-brand-secondary text-white hover:bg-teal-700 px-4 py-2 text-sm font-medium rounded-full transition">
                               تعرف أكثر
                             </a>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-brand-text-dark p-2" aria-label="Toggle menu">
                                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <div className="lg:hidden bg-white border-t border-gray-200 py-4">
                            <nav className="flex flex-col items-start gap-1">
                                <NavLinks isMobile />
                            </nav>
                        </div>
                    )}
                </div>
            </header>
            {showBrochurePopup && <BrochurePopup />}
             <Modal isOpen={isNewsModalOpen} onClose={() => setIsNewsModalOpen(false)} title="آخر الأخبار">
                <div className="text-center">
                    <p>لا زلنا في مرحلة التجهيز، سيتم عرض الأخبار والتقارير فور بدء التنفيذ.</p>
                    <div className="p-4 bg-gray-50 rounded-b-xl text-center -m-6 mt-6">
                        <button onClick={() => setIsNewsModalOpen(false)} className="bg-brand-secondary text-white font-medium py-2 px-6 rounded-full hover:bg-brand-primary transition">
                            حسناً
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

const Footer: React.FC<{ onShowTerms: () => void }> = ({ onShowTerms }) => (
  <footer className="bg-white mt-auto border-t border-gray-200">
    <div className="px-4 sm:px-6 lg:px-8 py-12 text-center text-brand-text-light">
      
      {/* Newsletter Section */}
      <div className="max-w-2xl mx-auto mb-10">
        <h3 className="text-2xl font-bold text-brand-text-dark mb-2">📬 انضم إلى قائمتنا البريدية</h3>
        <p className="mb-6">
          كن أول من يعرف جديد مشاريعنا وأخبارنا عبر البريد الإلكتروني أو مجموعتنا على واتساب.
        </p>
        
        {/* Actions */}
        <div className="space-y-4 max-w-md mx-auto">
            {/* Email Form */}
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => {e.preventDefault(); alert('شكراً لاشتراكك!');}}>
                <input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    className="flex-1 w-full px-5 py-3 border border-brand-text-light bg-brand-text-dark placeholder-gray-400 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm text-right"
                    aria-label="البريد الإلكتروني"
                    required
                />
                <button
                    type="submit"
                    className="sm:w-auto w-full px-7 py-3 border border-transparent font-medium rounded-full text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition shadow-sm"
                >
                   اشترك
                </button>
            </form>

            {/* WhatsApp Button */}
            <a
              href="#" // Replace with actual WhatsApp group link
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#25D366] hover:bg-[#128C7E] transition shadow-sm"
            >
              <WhatsAppIcon />
              <span>انضم إلى واتساب</span>
            </a>
        </div>
      </div>
      
      <div className="max-w-xs mx-auto h-px bg-gray-200 mb-8"></div>
      
       <div className="flex justify-center gap-6 mb-6">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-brand-primary transition">
              <FacebookIcon />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-brand-primary transition">
              <InstagramIcon />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-400 hover:text-brand-primary transition">
              <WhatsAppIcon />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-400 hover:text-brand-primary transition">
              <YouTubeIcon />
            </a>
        </div>
      <button onClick={onShowTerms} className="text-sm text-brand-text-light hover:text-brand-primary hover:underline transition-colors duration-200">
          اتفاقية الخدمة
      </button>
    </div>
  </footer>
);


const Section: React.FC<{id?: string, children: ReactNode, className?: string}> = ({ id, children, className = '' }) => (
  <section id={id} className={`bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </section>
);

const SectionTitle: React.FC<{children: ReactNode}> = ({ children }) => (
  <h2 className="text-2xl font-bold text-brand-text-dark mb-6 text-center">{children}</h2>
);


// --- Chat Popup Component ---
interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}

const ChatPopup: FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: 'أهلاً بك في مركز نور الأمل! كيف يمكننا مساعدتك؟' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);


    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: trimmedInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botResponse: ChatMessage = { sender: 'bot', text: 'سيتم الرد عليك خلال لحظات' };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="chat-title"
            className="fixed bottom-20 right-4 sm:right-6 z-40 animate-slide-up"
            style={{ animationDuration: '0.3s' }}
        >
            <div className="w-80 sm:w-96 h-[50vh] max-h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h3 id="chat-title" className="font-bold text-brand-text-dark">دردشة مباشرة</h3>
                    <button onClick={onClose} aria-label="Close chat" className="text-gray-400 hover:text-gray-700 transition p-1 rounded-full">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-brand-secondary text-white rounded-br-none' : 'bg-gray-100 text-brand-text-dark rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 text-brand-text-dark rounded-2xl rounded-bl-none px-4 py-2">
                                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="اكتب رسالتك..."
                            className="flex-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-brand-text-dark rounded-full focus:outline-none focus:ring-1 focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                            autoComplete="off"
                        />
                        <button 
                            type="submit" 
                            aria-label="Send message"
                            className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-brand-secondary text-white rounded-full hover:bg-brand-primary transition disabled:bg-gray-300"
                            disabled={!userInput.trim()}
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const BrochurePopup: FC = () => (
    <div 
        role="alert"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
        <div className="bg-white rounded-xl shadow-xl p-8 text-center animate-slide-up">
            <p className="text-lg font-medium text-brand-text-dark">جاري تحميل البروشور...</p>
            <div className="mt-4 w-8 h-8 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
    </div>
);

const BrochureButton: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => {
    const [showPopup, setShowPopup] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
            window.open('/brochure.pdf', '_blank', 'noopener,noreferrer');
        }, 2000);
    };

    return (
        <>
            <a
               href="/brochure.pdf"
               onClick={handleClick}
               rel="noopener noreferrer"
               className={`mt-6 inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-full text-brand-primary bg-teal-50 hover:bg-teal-100 transition ${className}`}>
               {children}
               <DownloadIcon className="h-5 w-5 mr-2"/>
            </a>
            {showPopup && <BrochurePopup />}
        </>
    );
};


const VolunteerModal: FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Volunteer application:', { email, phone });
        setSubmitted(true);
    };
    
    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setEmail('');
            setPhone('');
            setSubmitted(false);
        }, 300); // delay to allow for close animation
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="تطوع معنا">
            {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4 text-center">
                    <p className="text-brand-text-light">
                        شكراً لاهتمامك بالانضمام لفريقنا. يرجى ترك بياناتك وسنتواصل معك قريباً.
                    </p>
                    <input 
                        type="email" 
                        placeholder="البريد الإلكتروني" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full text-right px-4 py-3 border border-gray-300 placeholder-gray-500 text-brand-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                    />
                    <input 
                        type="tel" 
                        placeholder="رقم الجوال (اختياري)" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full text-right px-4 py-3 border border-gray-300 placeholder-gray-500 text-brand-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary sm:text-sm"
                    />
                    <div className="p-4 bg-gray-50 rounded-b-xl text-center -m-6 mt-6">
                        <button type="submit" className="bg-brand-secondary text-white font-medium py-2.5 px-8 rounded-full hover:bg-brand-primary transition">
                            إرسال
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center space-y-4">
                    <div className="text-4xl">🎉</div>
                    <h4 className="text-xl font-bold text-brand-text-dark">تم استلام طلبك!</h4>
                    <p className="text-brand-text-light">
                        نحن سعداء جداً برغبتك في التطوع. سنتواصل معك في أقرب فرصة.
                    </p>
                     <div className="p-4 bg-gray-50 rounded-b-xl text-center -m-6 mt-6">
                        <button onClick={handleClose} className="bg-brand-secondary text-white font-medium py-2 px-6 rounded-full hover:bg-brand-primary transition">
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};


const FloatingActionButtons: React.FC<{ onDonateClick: () => void; onVolunteerClick: () => void; }> = ({ onDonateClick, onVolunteerClick }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const shareText = `ساهم في إنشاء مركز "نور الأمل" للدعم النفسي والتعليمي للأطفال. ساهم أنت أيضاً!`;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
  };
  
  const fabClass = "w-14 h-14 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-transform duration-200 ease-in-out shadow-lg hover:scale-110";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-4">
        <button
          onClick={onDonateClick}
          aria-label="ساهم معنا"
          className={`${fabClass} bg-brand-secondary text-white hover:bg-brand-primary`}
        >
          <ContributeIcon className="w-7 h-7" />
        </button>

        <button
          onClick={onVolunteerClick}
          aria-label="تطوع معنا"
          className={`${fabClass} bg-white text-brand-secondary border-2 border-brand-secondary hover:bg-teal-50`}
        >
          <VolunteerIcon className="w-7 h-7" />
        </button>

        <div className="relative">
          {isShareOpen && (
            <div className="absolute bottom-full right-0 mb-3 flex flex-col items-center gap-3 animate-slide-up" style={{ animationDuration: '0.2s' }}>
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
                className="w-12 h-12 flex items-center justify-center bg-[#25D366] text-white rounded-full shadow-md hover:bg-[#128C7E] transition">
                <WhatsAppIcon />
              </a>
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"
                className="w-12 h-12 flex items-center justify-center bg-[#1877F2] text-white rounded-full shadow-md hover:bg-[#166FE5] transition">
                <FacebookIcon />
              </a>
            </div>
          )}
          <button
            onClick={() => setIsShareOpen(!isShareOpen)}
            aria-label="مشاركة الحملة"
            className={`${fabClass} bg-white text-brand-secondary border-2 border-brand-secondary hover:bg-teal-50`}
          >
            {isShareOpen ? <CloseIcon /> : <ShareIcon />}
          </button>
        </div>

        <button
          onClick={() => setIsChatOpen(true)}
          aria-label="دردشة مباشرة"
          className={`${fabClass} bg-white text-brand-secondary border-2 border-brand-secondary hover:bg-teal-50`}
        >
          <ChatIcon />
        </button>
      </div>
      <ChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};


// --- Page Specific Components ---

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  const cappedPercentage = Math.min(100, Math.max(0, percentage));
  return (
    <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden">
      <div
        className="bg-brand-secondary h-3.5 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${cappedPercentage}%` }}
      ></div>
    </div>
  );
};

const FaqItem: React.FC<{ q: string, a: ReactNode }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0 py-5">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-right flex justify-between items-center gap-4">
        <span className="text-lg font-medium text-brand-text-dark">{q}</span>
        <ChevronDownIcon className={isOpen ? 'rotate-180' : ''}/>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-3' : 'max-h-0'}`}>
         <div className="text-brand-text-light leading-relaxed">{a}</div>
      </div>
    </div>
  );
};

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="text-center">
    {member.imageUrl ? (
        <img src={member.imageUrl} alt={member.name} className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"/>
    ) : (
        <div className="w-40 h-40 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
            <UserIcon className="w-36 h-36 text-gray-400" />
        </div>
    )}
    <h4 className="font-bold text-brand-text-dark text-lg">{member.name}</h4>
    <p className="text-brand-text-light">{member.title}</p>
    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary transition mt-2 inline-block">
      <LinkedInIcon />
    </a>
  </div>
);

const TeamSlider: FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkForScrollability = useCallback(() => {
        const el = scrollRef.current;
        if (el) {
            const { scrollLeft, scrollWidth, clientWidth } = el;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    },[]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            checkForScrollability();
            el.addEventListener('scroll', checkForScrollability, { passive: true });
            window.addEventListener('resize', checkForScrollability);
            
            const timeoutId = setTimeout(checkForScrollability, 500);

            return () => {
                el.removeEventListener('scroll', checkForScrollability);
                window.removeEventListener('resize', checkForScrollability);
                clearTimeout(timeoutId);
            };
        }
    }, [checkForScrollability]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = current.clientWidth * 0.75;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    return (
        <div className="relative group">
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
                {TEAM_MEMBERS.map(member => (
                    <div key={member.id} className="snap-center shrink-0 w-[calc(50%-0.75rem)] sm:w-[calc(33.33%-1rem)] md:w-[calc(25%-1.125rem)]">
                        <TeamMemberCard member={member} />
                    </div>
                ))}
            </div>
             <button onClick={() => scroll('left')} aria-label="Previous" className={`absolute top-1/2 -translate-y-1/2 left-0 -translate-x-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <ChevronRightIcon />
            </button>
            <button onClick={() => scroll('right')} aria-label="Next" className={`absolute top-1/2 -translate-y-1/2 right-0 translate-x-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <ChevronLeftIcon />
            </button>
        </div>
    );
};


// --- Main Page Components ---

interface CampaignPageProps {
  totalDonations: number;
  donors: Donor[];
  onDonateNow: () => void;
  onNavClick: (anchor: string) => void;
  onShowTerms: () => void;
}

const CampaignPage: React.FC<CampaignPageProps> = ({ totalDonations, donors, onDonateNow, onNavClick, onShowTerms }) => {
  const progress = (totalDonations / CAMPAIGN_GOAL) * 100;

  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);

  return (
    <>
      <Header onNavClick={onNavClick} />
      <main id="top" className="px-4 sm:px-6 lg:px-8 py-12 flex-grow relative isolate">
        <div 
            aria-hidden="true" 
            className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
        >
            <div 
                className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-secondary to-teal-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
                style={{
                    clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
                }}
            />
        </div>
        <div className="w-full space-y-12">
            
            {/* Hero Section */}
            <div 
                className="bg-cover bg-center rounded-xl overflow-hidden border border-gray-100"
                style={{
                  backgroundImage: `url('https://storage.googleapis.com/aistudio-hosting/workspace-assets/5e019f21-4ec4-4e2e-836f-87034c562e84/versions/default/files/5a6797a7-54ac-4892-b4c4-de5c1b69784b.png')`,
                  backgroundAttachment: 'fixed'
                }}
            >
                <div className="bg-white/60 backdrop-blur-sm py-20 text-center px-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-brand-text-dark leading-tight">
                        هدفنا جمع ${CAMPAIGN_GOAL.toLocaleString()} لإنشاء مركز نور الأمل
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-brand-text-light max-w-3xl mx-auto">
                        ساهم معنا في تأسيس مركز غير ربحي يُعنى بالدعم النفسي والتعليم المستدام للأطفال من عمر 6 إلى 14 عامًا في غزة.
                    </p>
                    <div className="mt-8">
                        <button onClick={onDonateNow} className="bg-brand-secondary text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-brand-primary transition duration-300 shadow-md">
                            ساهم معنا الآن
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <Section className="sticky top-[65px] z-20 bg-white/80 backdrop-blur-lg !p-3 sm:!p-4">
              <div>
                <div className="relative pt-5 mb-1"> {/* Add padding top for space and margin bottom to separate from stats */}
                    <div 
                        className="absolute z-10 top-0 left-1/2 -translate-x-1/2"
                    >
                        <p className="text-brand-primary font-bold text-sm whitespace-nowrap">{progress.toFixed(1)}%</p>
                    </div>
                    <ProgressBar percentage={progress} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center md:text-right">
                    <div>
                        <span className="text-brand-text-light text-xs">إجمالي التبرعات</span>
                        <p className="text-brand-primary font-bold text-lg">${totalDonations.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-brand-text-light text-xs">الهدف</span>
                        <p className="text-brand-text-dark font-bold text-lg">${CAMPAIGN_GOAL.toLocaleString()}</p>
                    </div>
                </div>
              </div>
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-12">

                <Section id="about"><SectionTitle>نبذة عن المشروع</SectionTitle><p className="text-brand-text-light text-center leading-relaxed max-w-2xl mx-auto">مركز "نور الأمل" هو مشروع غير ربحي يهدف لتقديم الدعم النفسي والتعليمي للأطفال من عمر 6 إلى 14 عامًا. يقوم المشروع على نموذج مستدام، حيث تُستخدم إيرادات الدروس المدفوعة للأطفال المقتدرين لتغطية كافة المصاريف التشغيلية ورواتب الفريق، مما يضمن استمرارية العطاء دون الاعتماد على التبرعات مستقبلًا.</p><div className="text-center"><BrochureButton>تعرف أكثر على التفاصيل – حمل البروشور</BrochureButton></div></Section>
                <Section id="benefits"><SectionTitle>جدوى المشروع وأهميته</SectionTitle><p className="text-brand-text-light text-center leading-relaxed max-w-2xl mx-auto">يساهم المشروع في تحسين الصحة النفسية والتعليمية للأطفال في غزة، ويخلق فرص عمل مستقرة للفريق المحلي، ويحقق أثرًا اجتماعيًا واقتصاديًا مستدامًا. دعمكم اليوم هو أساس استمرارية هذا الأثر غدًا.</p></Section>
                <Section id="funds"><SectionTitle>كيفية إنفاق التبرعات</SectionTitle><ul className="list-disc list-inside space-y-3 text-brand-text-light max-w-md mx-auto"><li>تجهيز وتجديد المبنى ليكون بيئة آمنة وملهمة.</li><li>شراء الأدوات التعليمية واللوجستية الحديثة.</li><li>تغطية الرواتب والمصاريف التشغيلية للفريق.</li><li>إطلاق حملات توعوية وأنشطة مجتمعية.</li></ul><p className="text-brand-text-light text-center mt-4 text-sm">لاحقًا، سيمول المشروع نفسه بالكامل من خلال الدروس المدفوعة.</p><div className="text-center"><BrochureButton>تعرف أكثر على التفاصيل – حمل البروشور</BrochureButton></div></Section>
                <Section id="team"><SectionTitle>الفريق الاداري</SectionTitle><TeamSlider /></Section>
                <Section id="vision"><SectionTitle>رؤية واستدامة المشروع</SectionTitle><p className="text-brand-text-light text-center leading-relaxed max-w-2xl mx-auto">يسعى مركز نور الأمل لأن يكون نموذجًا رائدًا لمشاريع الدعم النفسي المستدامة، بتمويل ذاتي طويل الأمد قائم على التعليم والخدمات المجتمعية.</p></Section>
                <Section id="results"><SectionTitle>النتائج المتوقعة</SectionTitle><ul className="list-disc list-inside space-y-3 text-brand-text-light max-w-md mx-auto"><li>أكثر من 200 طفل مستفيد مباشر في المرحلة الأولى.</li><li>رواتب ومصاريف تشغيلية ممولة ذاتيًا.</li><li>تقارير شفافة عن سير العمل.</li><li>توسع جغرافي خلال السنتين القادمتين.</li></ul><div className="text-center"><BrochureButton>اعرف المزيد – حمل البروشور</BrochureButton></div></Section>
                <Section id="plan"><SectionTitle>مراحل التنفيذ</SectionTitle><div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"><div className="border border-gray-200 p-4 rounded-lg"><h4 className="font-bold text-brand-text-dark">المرحلة 1 (شهر 1-2)</h4><p className="text-brand-text-light text-sm">جمع التبرعات وتجهيز المبنى.</p></div><div className="border border-gray-200 p-4 rounded-lg"><h4 className="font-bold text-brand-text-dark">المرحلة 2 (شهر 3-4)</h4><p className="text-brand-text-light text-sm">تدريب الفريق وتوفير المستلزمات.</p></div><div className="border border-gray-200 p-4 rounded-lg"><h4 className="font-bold text-brand-text-dark">المرحلة 3 (شهر 5+)</h4><p className="text-brand-text-light text-sm">بدء التشغيل الفعلي والدروس.</p></div></div><p className="text-center mt-4 text-brand-text-light text-sm">المشروع مستدام ومستمر وليس محدد المدة.</p><div className="text-center"><BrochureButton>اعرف المزيد – حمل البروشور</BrochureButton></div></Section>
                <Section id="faq"><SectionTitle>الأسئلة الشائعة</SectionTitle><FaqItem q="ما أهمية المشروع في هذا الوقت؟" a="يوفر المشروع دعمًا نفسيًا حاسمًا للأطفال المتأثرين بالظروف الصعبة، ويمكّنهم تعليميًا لبناء مستقبل أفضل، مما يعزز صمود المجتمع." /><FaqItem q="كيف يتم ضمان الشفافية في إنفاق التبرعات؟" a="سيتم نشر تقارير مالية دورية ومفصلة على موقعنا الإلكتروني، توضح كيفية إنفاق كل دولار تم التبرع به." /><FaqItem q="ما مدى التزام المشروع بمعايير الثقة والشفافية؟" a="يتمتع المشروع بمستوى عالٍ من الثقة والشفافية، حيث يضم فريقاً إدارياً من الكفاءات المتميزة يعملون بشكل تطوعي كامل دون أي مقابل مادي. كما أن المشروع مرخّص ويخضع لإشراف وزارة الداخلية، مما يعزز التزامه بأعلى معايير الحوكمة والنزاهة والشفافية." /><FaqItem q="من هم القائمون على المشروع؟" a="يقوم على المشروع فريق من الخبراء في مجالات الدعم النفسي، التعليم، وإدارة المشاريع، كما هو موضح في قسم 'فريق نور الأمل'." /><FaqItem q="هل يمكنني التطوع مع الفريق؟" a={<>نعم، نرحب دائمًا بالمتطوعين. يرجى التواصل معنا عبر البريد الإلكتروني لمناقشة الفرص المتاحة.<br />او تواصل معنا عبر النقر على <button onClick={() => setIsVolunteerModalOpen(true)} className="text-brand-primary hover:underline font-medium">الرابط التالي</button>.</>} /></Section>
                <Section id="contact"><SectionTitle>تواصل معنا</SectionTitle><div className="text-center text-brand-text-light space-y-3"><p>البريد الإلكتروني: <a href="mailto:info@noorhope.org" className="text-brand-primary hover:underline">info@noorhope.org</a></p><p>رقم الجوال: <a href="tel:+970599123456" className="text-brand-primary hover:underline">+970 599 123 456</a></p><p>واتساب: <a href="https://wa.me/970599123456" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">+970 599 123 456</a></p></div></Section>
              </div>

              {/* Side Column - Donors */}
              <div className="lg:col-span-1 space-y-8 sticky top-[152px]">
                 <Section id="donors">
                    <h3 className="text-2xl font-medium text-center text-brand-text-dark mb-6">قائمة المتبرعين</h3>
                    <div className="donor-list h-96 overflow-y-auto pr-4">
                      <ul className="space-y-1">
                        {donors.map((donor, index) => (
                          <li 
                            key={donor.id} 
                            className="py-3 border-b last:border-0 border-gray-100 flex justify-between items-center animate-slide-up"
                            style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
                           >
                            <span className="font-medium text-brand-text-dark">{donor.name}</span>
                            <div className="text-left">
                              <span className="font-bold text-brand-primary text-lg">${donor.amount.toLocaleString()}</span>
                              <p className="text-xs text-brand-text-light">إجمالي حتى الآن: ${donor.cumulativeTotal.toLocaleString()}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Section>
              </div>
            </div>
        </div>
      </main>
      <FloatingActionButtons onDonateClick={onDonateNow} onVolunteerClick={() => setIsVolunteerModalOpen(true)} />
      <VolunteerModal isOpen={isVolunteerModalOpen} onClose={() => setIsVolunteerModalOpen(false)} />
      <Footer onShowTerms={onShowTerms} />
    </>
  );
};


interface DonationFormPageProps {
  onAddDonation: (details: Omit<DonationDetails, 'receiptId' | 'date'>) => void;
  onBack: () => void;
  onNavClick: (anchor: string) => void;
  onShowTerms: () => void;
}

const DonationFormPage: React.FC<DonationFormPageProps> = ({ onAddDonation, onBack, onNavClick, onShowTerms }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || (!isAnonymous && !name.trim())) {
      alert('الرجاء إدخال اسم ومبلغ صحيحين.');
      return;
    }
    onAddDonation({
      name: name.trim(),
      email,
      amount: Number(amount),
      note,
      isAnonymous,
    });
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <>
      <Header onNavClick={onNavClick} />
      <main className="flex-grow bg-brand-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200">
          <div>
            <h2 className="text-center text-3xl font-bold text-brand-text-dark">ساهم في بناء "نور الأمل"</h2>
            <p className="mt-2 text-center text-base text-brand-text-light">
              بمساهمتك، ستكون جزءًا من مشروع تنموي يغيّر حياة مئات الأطفال.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-4">
               <input id="full-name" name="name" type="text" required={!isAnonymous} disabled={isAnonymous} value={name} onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-brand-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm disabled:bg-gray-100"
                  placeholder="الاسم الكامل" />
               <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-brand-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                  placeholder="البريد الإلكتروني (لتصلك رسالة شكر)" />
            </div>
             <div>
              <label htmlFor="amount" className="block text-sm font-medium text-brand-text-light mb-2">المبلغ المراد التبرع به ($)</label>
              <input id="amount" name="amount" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-brand-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                placeholder="0.00" />
              <div className="mt-3 grid grid-cols-4 gap-3">
                {quickAmounts.map(qAmount => (
                  <button key={qAmount} type="button" onClick={() => setAmount(String(qAmount))}
                    className="bg-white border border-brand-secondary text-brand-secondary py-2 px-3 rounded-full hover:bg-teal-50 transition text-sm font-medium">
                    ${qAmount}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <textarea id="note" name="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-brand-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                placeholder="ملاحظة (اختياري)"></textarea>
            </div>

            <div className="flex items-center">
              <input id="anonymous" name="anonymous" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-brand-secondary focus:ring-brand-secondary border-gray-300 rounded" />
              <label htmlFor="anonymous" className="mr-2 block text-sm text-brand-text-dark font-medium">التبرع كمجهول</label>
            </div>

            <div className="space-y-3 pt-4">
              <button type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-full text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition shadow-sm">
                تأكيد التبرع
              </button>
               <button type="button" onClick={onBack}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-base font-medium rounded-full text-brand-text-light bg-white hover:border-brand-secondary hover:text-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition">
                العودة للحملة
              </button>
            </div>
              <p className="text-center text-xs text-brand-text-light"><LockIcon /> بياناتك آمنة، ولن يتم استخدامها لأي أغراض خارجية.</p>
          </form>
        </div>
      </main>
      <Footer onShowTerms={onShowTerms} />
    </>
  );
};


interface ThankYouPageProps {
  lastDonation: DonationDetails;
  onBackToCampaign: () => void;
  onNavClick: (anchor: string) => void;
  onShowTerms: () => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ lastDonation, onBackToCampaign, onNavClick, onShowTerms }) => {
  const shareText = `لقد تبرعت لحملة إنشاء مركز "نور الأمل" للدعم النفسي والتعليمي للأطفال. ساهم أنت أيضاً في بناء مستقبلهم!`;
  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  
  return (
    <>
      <Header onNavClick={onNavClick} />
      <main className="flex-grow bg-brand-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white p-10 rounded-xl shadow-lg text-center space-y-6 border border-gray-200">
          <div className="text-5xl">🌱</div>
          <h2 className="text-4xl font-bold text-brand-primary">شكرًا لك من القلب</h2>
          <p className="text-brand-text-light text-lg">
            تم تسجيل تبرعك بنجاح. بفضلك، نحن نقترب أكثر من تحقيق هدفنا وتمكين أطفالنا من بناء مستقبلٍ أفضل.
          </p>

          <div className="border border-gray-200 bg-brand-background rounded-lg p-4 text-right">
            <h3 className="text-xl font-medium mb-4 text-center text-brand-text-dark">تفاصيل الإيصال</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200"><td className="p-2 font-medium text-brand-text-light">اسم المتبرع</td><td className="p-2 text-brand-text-dark font-medium">{lastDonation.name}</td></tr>
                <tr className="border-b border-gray-200"><td className="p-2 font-medium text-brand-text-light">المبلغ</td><td className="p-2 text-brand-text-dark font-bold text-base">${lastDonation.amount.toLocaleString()}</td></tr>
                <tr className="border-b border-gray-200"><td className="p-2 font-medium text-brand-text-light">رقم الإيصال</td><td className="p-2 text-brand-text-dark font-medium">{lastDonation.receiptId}</td></tr>
                <tr><td className="p-2 font-medium text-brand-text-light">تاريخ التبرع</td><td className="p-2 text-brand-text-dark font-medium">{lastDonation.date}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button onClick={onBackToCampaign} className="flex-1 bg-brand-secondary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-primary transition duration-300">
              العودة إلى صفحة الحملة
            </button>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border border-brand-secondary text-brand-secondary font-bold py-3 px-4 rounded-full hover:bg-teal-50 transition duration-300">
              مشاركة الحملة
            </a>
          </div>
        </div>
      </main>
      <Footer onShowTerms={onShowTerms} />
    </>
  );
};

interface TermsOfServicePageProps {
  onBack: () => void;
  onNavClick: (anchor: string) => void;
  onShowTerms: () => void;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBack, onNavClick, onShowTerms }) => {
    return (
        <>
            <Header onNavClick={onNavClick} />
            <main className="flex-grow bg-brand-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Section id="terms-of-service">
                        <SectionTitle>اتفاقية الخدمة</SectionTitle>
                        <div className="space-y-6 text-brand-text-light leading-relaxed text-right">
                            <p>بالتسجيل أو استخدام موقع مركز نور الأمل، فإنك توافق على الشروط التالية:</p>
                            
                            <div>
                                <h3 className="text-xl font-bold text-brand-text-dark mb-2">استخدام الموقع:</h3>
                                <p>يهدف الموقع إلى دعم المشاريع والأنشطة الإنسانية، ويُمنع استخدامه لأي أغراض تجارية أو غير قانونية.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-brand-text-dark mb-2">البيانات الشخصية:</h3>
                                <p>نلتزم بحماية بياناتك وعدم مشاركتها مع أي جهة خارجية دون موافقتك المسبقة، إلا إذا تطلّب القانون ذلك.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-brand-text-dark mb-2">التبرعات:</h3>
                                <p>جميع التبرعات تُستخدم لتحقيق أهداف المشاريع المعلنة بشفافية، ويحق للمركز تعديل أو تحويل التمويل عند الضرورة لضمان التنفيذ الأمثل.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-brand-text-dark mb-2">المتطوّعون:</h3>
                                <p>بانضمامك كمتطوّع، فإنك توافق على الالتزام بسياسات المركز، والعمل بروح الفريق، واحترام المعايير الأخلاقية والإنسانية.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-brand-text-dark mb-2">حقوق الملكية:</h3>
                                <p>جميع المحتويات والعلامات التجارية الواردة في الموقع هي ملك لـ<strong>مركز نور الأمل</strong>، ولا يجوز إعادة استخدامها دون إذن خطي مسبق.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-brand-text-dark mb-2">التعديلات:</h3>
                                <p>يحتفظ المركز بحق تعديل هذه الاتفاقية في أي وقت، ويتم نشر التحديثات على هذه الصفحة. استمرارك في استخدام الموقع يعني موافقتك على الشروط المحدّثة.</p>
                            </div>
                        </div>
                        <div className="text-center mt-10">
                            <button onClick={onBack} className="bg-brand-secondary text-white font-bold py-2 px-8 rounded-full hover:bg-brand-primary transition duration-300">
                                العودة
                            </button>
                        </div>
                    </Section>
                </div>
            </main>
            <Footer onShowTerms={onShowTerms} />
        </>
    );
};


// --- Main App Component ---

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('campaign');
  const [donors, setDonors] = useState<Donor[]>(() => {
    try {
      const storedDonors = localStorage.getItem('donors');
      return storedDonors ? JSON.parse(storedDonors) : INITIAL_DONORS;
    } catch (error) {
      console.error("Failed to parse donors from localStorage:", error);
      return INITIAL_DONORS;
    }
  });
  const [totalDonations, setTotalDonations] = useState<number>(() => {
    try {
      const storedTotal = localStorage.getItem('totalDonations');
      return storedTotal ? JSON.parse(storedTotal) : INITIAL_TOTAL;
    } catch (error) {
      console.error("Failed to parse totalDonations from localStorage:", error);
      return INITIAL_TOTAL;
    }
  });
  const [lastDonation, setLastDonation] = useState<DonationDetails | null>(null);
  const [targetAnchor, setTargetAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (currentPage === 'campaign' && targetAnchor) {
      requestAnimationFrame(() => {
        const element = document.getElementById(targetAnchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setTargetAnchor(null);
      });
    }
  }, [currentPage, targetAnchor]);

  const handleNavClick = (anchor: string) => {
    const anchorId = anchor.substring(1);

    if (anchorId === 'top') {
      if (currentPage === 'campaign') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentPage('campaign');
        window.scrollTo(0, 0);
      }
      return;
    }

    if (currentPage !== 'campaign') {
      setTargetAnchor(anchorId);
      setCurrentPage('campaign');
    } else {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  const handleAddDonation = useCallback((details: Omit<DonationDetails, 'receiptId' | 'date'>) => {
    const newTotal = totalDonations + details.amount;

    const newDonor: Donor = {
      id: donors.length + 100, // use a high number to avoid key conflicts
      name: details.isAnonymous ? 'متبرع مجهول' : details.name,
      amount: details.amount,
      cumulativeTotal: newTotal,
    };
    
    const newDonorsList = [newDonor, ...donors];

    setTotalDonations(newTotal);
    setDonors(newDonorsList);
    
    try {
      localStorage.setItem('donors', JSON.stringify(newDonorsList));
      localStorage.setItem('totalDonations', JSON.stringify(newTotal));
    } catch (error) {
      console.error("Failed to save donation to localStorage:", error);
    }

    const receiptDetails: DonationDetails = {
      ...details,
      name: details.isAnonymous ? 'متبرع مجهول' : details.name,
      receiptId: `REC-2025-${String(donors.length + 10).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setLastDonation(receiptDetails);

    setCurrentPage('thankyou');
    window.scrollTo(0, 0);
  }, [totalDonations, donors]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const handleGoHome = () => handleNavClick('#top');

  const handleShowTerms = () => navigateTo('terms');

  const renderPage = () => {
    switch (currentPage) {
      case 'form':
        return <DonationFormPage onAddDonation={handleAddDonation} onBack={handleGoHome} onNavClick={handleNavClick} onShowTerms={handleShowTerms} />;
      case 'thankyou':
        if (!lastDonation) {
          navigateTo('campaign');
          return null;
        }
        return <ThankYouPage lastDonation={lastDonation} onBackToCampaign={handleGoHome} onNavClick={handleNavClick} onShowTerms={handleShowTerms} />;
      case 'terms':
        return <TermsOfServicePage onBack={handleGoHome} onNavClick={handleNavClick} onShowTerms={handleShowTerms} />;
      case 'campaign':
      default:
        return (
            <CampaignPage 
                totalDonations={totalDonations} 
                donors={donors} 
                onDonateNow={() => navigateTo('form')}
                onNavClick={handleNavClick}
                onShowTerms={handleShowTerms}
             />
        );
    }
  };

  return <div className="bg-brand-background min-h-screen font-sans flex flex-col">{renderPage()}</div>;
}

export default App;