'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Search, Plus, User, LayoutDashboard, Menu, X, ArrowRight, Rocket, Globe, BarChart3, Zap } from 'lucide-react';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n-context';
import Button from '@/components/ui/Button';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, searchQuery, setSearchQuery }) => {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100]">
      {/* Top Value-Prop Banner */}
      <div className="w-full py-2 text-xs font-semibold text-white overflow-hidden" style={{ backgroundColor: 'var(--primary-btn)' }}>
        {/* Desktop: 3 pills */}
        <div className="hidden md:flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5 opacity-90">
            <Globe className="w-3 h-3" />
            Yubbox your products to 150+ countries
          </span>
          <span className="opacity-40">·</span>
          <span className="flex items-center gap-1.5 opacity-90">
            <BarChart3 className="w-3 h-3" />
            Real-Time Analytics
          </span>
          <span className="opacity-40">·</span>
          <span className="flex items-center gap-1.5 opacity-90">
            <Zap className="w-3 h-3" />
            Every ad is a Yubbox — from $1
          </span>
        </div>
        {/* Mobile: single concise line */}
        <div className="md:hidden text-center opacity-90">
          Yubbox your business globally · From $1
        </div>
      </div>
      
      <div className="px-4 py-3">
      <div className="max-w-7xl mx-auto glass-morphism rounded-2xl md:rounded-full px-6 py-2 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo height={80} width={80} disableLink />
        </Link>

        {/* Search Bar - Desktop */}
        <form 
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-md mx-8 relative group"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              className="w-full bg-white/50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-full py-2 pl-11 pr-24 outline-none transition-all text-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all"
              style={{ backgroundColor: 'var(--primary-btn)' }}
            >
              {t('common.find')}
            </button>
          </div>
        </form>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
          </div>
          
          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-full px-4 py-1.5 border-neutral-200/50 hover:bg-white/50 text-xs flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t('nav.dashboard')}
                </Button>
              </Link>
              <Link href="/ads/create">
                <Button className="rounded-full px-4 py-1.5 text-white text-xs flex items-center gap-2 border-none shadow-lg hover:opacity-90" style={{ backgroundColor: 'var(--primary-btn)', boxShadow: '0 4px 14px 0 rgba(121, 14, 97, 0.39)' }}>
                  <Plus className="w-3.5 h-3.5" />
                  New Yubbox
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <span className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2">
                  {t('nav.login')}
                </span>
              </Link>
              <Link href="/register">
                <Button 
                  className="rounded-full px-5 py-1.5 text-white text-sm font-bold border-none flex items-center gap-2 hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: 'var(--primary-btn)', boxShadow: '0 4px 14px 0 rgba(121, 14, 97, 0.39)' }}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-28 left-4 right-4 glass-morphism rounded-2xl p-6 flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              className="w-full bg-white/50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 outline-none text-sm"
            />
          </form>

          <div className="flex flex-col gap-3">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors"
            >
              <span className="font-medium">Home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {session ? (
              <>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <span className="font-medium text-gray-600">{t('nav.dashboard')}</span>
                  <LayoutDashboard className="w-4 h-4 text-gray-400" />
                </Link>
                <Link 
                  href="/ads/create" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(121,14,97,0.06)', border: '1px solid rgba(121,14,97,0.12)' }}
                >
                  <span className="font-medium" style={{ color: '#790e61' }}>New Yubbox</span>
                  <Plus className="w-4 h-4" style={{ color: '#790e61' }} />
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <span className="font-medium text-gray-600">{t('nav.login')}</span>
                  <User className="w-4 h-4 text-gray-400" />
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary-btn)' }}
                >
                  <span className="font-medium text-white">{t('nav.register')}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              </>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Language</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
