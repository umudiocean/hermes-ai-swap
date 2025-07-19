import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ExternalLink } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import WalletConnect from './WalletConnect';
import WalletRedirectButton from './WalletRedirectButton';
import { useTranslation } from '../hooks/useTranslation';

// Import logo from public directory
const logoUrl = '/10xlogo.jpg';

export default function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/' || path === '/swap') {
      return location === '/' || location === '/swap';
    }
    return location === path;
  };

  const navItems = [
    { path: '/swap', label: t('nav.swap'), isExternal: false },
    { path: '/referral', label: t('nav.referral'), isExternal: false },
    { path: '/stake', label: t('nav.stake'), isExternal: false },

    { path: 'https://x.com/hermes_ai_trade', label: t('nav.join_x'), isExternal: true, icon: '🐦' },
    { path: 'https://t.me/hermes_ai_trade', label: t('nav.join_telegram'), isExternal: true, icon: '📢' },
  ];

  return (
    <header className="border-b border-hermes-border bg-hermes-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/swap" className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
              <img 
                src={logoUrl} 
                alt="Hermes AI Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-[#62cbc1] to-[#4db8a8] bg-clip-text text-transparent">
                Hermes AI Swap
              </h1>
              <p className="text-xs text-gray-400 hidden lg:block">DeFi Trading Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-4 desktop-nav">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                item.isExternal ? (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#62cbc1] transition-colors duration-200 flex items-center space-x-1 font-semibold whitespace-nowrap px-2 py-2 text-sm touch-target"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`transition-colors duration-200 font-semibold relative whitespace-nowrap px-2 py-2 text-sm touch-target ${
                      isActive(item.path)
                        ? 'text-[#62cbc1]'
                        : 'text-gray-300 hover:text-[#62cbc1]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive(item.path) && (
                      <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#62cbc1] to-[#4db8a8] rounded-full" />
                    )}
                  </Link>
                )
              ))}
            </div>
          </nav>

          {/* Right side - Desktop */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0 min-w-fit">
            <LanguageSelector />
            <WalletConnect />
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white hover:text-[#62cbc1] transition-colors touch-target"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-hermes-border mt-4 pt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                item.isExternal ? (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#62cbc1] transition-colors duration-200 flex items-center space-x-2 font-semibold py-3 px-2 rounded-lg hover:bg-hermes-dark/50 touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`transition-colors duration-200 font-semibold py-3 px-2 rounded-lg hover:bg-hermes-dark/50 touch-target ${
                      isActive(item.path)
                        ? 'text-[#62cbc1] bg-hermes-dark/30'
                        : 'text-gray-300 hover:text-[#62cbc1]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              
              {/* Mobile wallet and language */}
              <div className="flex flex-col space-y-4 pt-4 border-t border-hermes-border">
                <div className="px-2">
                  <WalletRedirectButton className="w-full justify-center mb-3 bg-gradient-to-r from-[#62cbc1] to-[#4db8a8] text-black hover:from-[#4db8a8] hover:to-[#5cb4a3] font-semibold">
                    🚀 Open in Wallet Browser
                  </WalletRedirectButton>
                </div>
                <div className="px-2">
                  <LanguageSelector />
                </div>
                <div className="px-2">
                  <WalletConnect />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}