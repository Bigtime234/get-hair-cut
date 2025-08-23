"use client"
import React, { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Home, 
  User, 
  Calendar, 
  Users, 
  Star, 
  MapPin, 
  MoreHorizontal, 
  Menu, 
  X, 
  Scissors,
  LucideIcon
} from 'lucide-react';

// Import your UserButton component
import { UserButton } from './user-button';

interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  iconName?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  fullWidth?: boolean;
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems: NavigationItem[] = [
    { name: 'Home', path: '/homepage', icon: Home },
    { name: 'Master Profile', path: '/master-s-profile', icon: User },
    { name: 'Book Now', path: '/booking-engine', icon: Calendar },
    { name: 'Client Portal', path: '/client-portal', icon: Users },
    { name: 'Reviews', path: '/reviews-testimonials', icon: Star },
  ];

  const secondaryItems: NavigationItem[] = [
    { name: 'Contact', path: '/contact-location', icon: MapPin },
  ];

  const isActivePath = (path: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === path;
    }
    return false;
  };

  const handleNavigation = (path: string): void => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Button Component with Lucide Icons
  const Button = ({ 
    children, 
    variant = 'default', 
    className = '', 
    onClick, 
    iconName, 
    iconPosition = 'left', 
    iconSize = 18,
    fullWidth = false 
  }: ButtonProps): ReactElement => {
    // Render icon only if iconName is provided
    const renderIcon = (position: 'left' | 'right') => {
      if (!iconName || iconPosition !== position) return null;
      
      const IconComponent = iconName;
      return <IconComponent size={iconSize} />;
    };
    
    return (
      <button
        onClick={onClick}
        className={`
          inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
          ${variant === 'default' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
          ${variant === 'outline' ? 'border border-gray-300 hover:bg-gray-100' : ''}
          ${variant === 'ghost' ? 'hover:bg-gray-100' : ''}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        {renderIcon('left')}
        {children}
        {renderIcon('right')}
      </button>
    );
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link 
              href="/homepage"
              className="flex items-center cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <Scissors size={20} color="white" className="lg:w-6 lg:h-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg lg:text-xl text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    BarberBook
                  </span>
                  <span className="text-sm text-orange-500 -mt-1">
                    Pro
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                      isActivePath(item.path)
                        ? 'text-blue-600 bg-blue-100 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent 
                      size={18} 
                      className={isActivePath(item.path) ? 'text-blue-600' : 'text-current'} 
                    />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              
              {/* More Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300">
                  <MoreHorizontal size={18} />
                  <span>More</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                  {secondaryItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-medium hover:bg-gray-100 transition-colors duration-300 first:rounded-t-lg last:rounded-b-lg ${
                          isActivePath(item.path) ? 'text-blue-600 bg-blue-100' : 'text-gray-600'
                        }`}
                      >
                        <IconComponent size={16} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Right Side: CTA Button, User Button & Mobile Menu Toggle */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Book Now Button - Hidden on small screens when user is logged in */}
              <Button
                variant="default"
                className={`bg-blue-600 hover:bg-blue-700 text-white animate-pulse ${
                  session ? 'hidden md:flex' : 'hidden sm:flex'
                }`}
                onClick={() => handleNavigation('/booking-engine')}
                iconName={Calendar}
                iconPosition="left"
                iconSize={18}
              >
                Book Now
              </Button>

              {/* User Button - Visible when authenticated */}
              {status === 'authenticated' && session && (
                <div className="flex items-center">
                  <UserButton {...session} />
                </div>
              )}

              {/* Sign In Button - Visible when not authenticated */}
              {status === 'unauthenticated' && (
                <Button
                  variant="outline"
                  className="hidden sm:flex border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleNavigation('/api/auth/signin')}
                  iconName={User}
                  iconPosition="left"
                  iconSize={18}
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Scissors size={16} color="white" />
                </div>
                <span className="font-bold text-lg text-gray-800">
                  BarberBook Pro
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile User Profile Section */}
            {status === 'authenticated' && session && (
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-4">
                  <UserButton {...session} />
                  <div className="flex flex-col min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="p-6 space-y-2">
              {[...navigationItems, ...secondaryItems].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-left transition-all duration-300 ${
                      isActivePath(item.path)
                        ? 'text-blue-600 bg-blue-100 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent 
                      size={20} 
                      className={isActivePath(item.path) ? 'text-blue-600' : 'text-current'} 
                    />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              
              <div className="pt-4 mt-6 border-t border-gray-200 space-y-3">
                {/* Book Now Button for Mobile */}
                <Button
                  variant="default"
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleNavigation('/booking-engine')}
                  iconName={Calendar}
                  iconPosition="left"
                  iconSize={18}
                >
                  Book Your Transformation
                </Button>

                {/* Sign In Button for Mobile - Only show if not authenticated */}
                {status === 'unauthenticated' && (
                  <Button
                    variant="outline"
                    fullWidth
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleNavigation('/api/auth/signin')}
                    iconName={User}
                    iconPosition="left"
                    iconSize={18}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
      
      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Header;