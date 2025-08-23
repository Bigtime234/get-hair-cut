"use client"

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Award, 
  Users, 
  Star, 
  ChevronDown 
} from 'lucide-react';

const HeroSection: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    {
      id: 1,
      src: "/BarberInterior.jpg",
      title: "Master Barber at Work"
    },
    {
      id: 2,
      src: "/BarberTools.jpg", // Add your second image
      title: "Precision Hair Cutting"
    },
    {
      id: 3,
      src: "/Barber1.jpg", // Add your third image
      title: "Professional Styling"
    },
    {
      id: 4,
      src: "/Barber2.jpg", // Add more images as needed
      title: "Expert Grooming"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-slate-900">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0">
        <img
          key={heroImages[currentImageIndex].id}
          src={heroImages[currentImageIndex].src}
          alt={heroImages[currentImageIndex].title}
          className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="space-y-6 animate-hero-fade-in-up">
              {/* Headline */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                <span className="block">Precision in</span>
                <span className="block text-yellow-400">Every Cut</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl leading-relaxed">
                Where traditional barbering artistry meets modern convenience. Transform your style with a master craftsman who values precision, expertise, and your personal success.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  className="inline-flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-button-pulse"
                  onClick={() => {
                    // Add your booking logic here
                    console.log('Book now clicked');
                  }}
                >
                  <Calendar size={20} />
                  Book Your Transformation
                </button>
                
                <button
                  className="inline-flex items-center justify-center gap-3 border border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.location.href = '/master-s-profile'}
                >
                  <User size={20} />
                  Meet the Master
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-8">
                <div className="flex items-center space-x-2 text-white/80">
                  <Award size={20} className="text-yellow-400" />
                  <span className="text-sm">15+ Years Experience</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Users size={20} className="text-yellow-400" />
                  <span className="text-sm">2000+ Satisfied Clients</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Star size={20} className="text-yellow-400" />
                  <span className="text-sm">4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 text-white/60 animate-scroll-indicator">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm">Discover More</span>
          <div className="animate-custom-bounce">
            <ChevronDown size={24} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes hero-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll-indicator-fade-in {
          0%, 65% {
            opacity: 0;
            transform: translateX(-50%);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%);
          }
        }

        @keyframes custom-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        @keyframes button-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(251, 191, 36, 0);
          }
        }

        .animate-hero-fade-in-up {
          animation: hero-fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-scroll-indicator {
          animation: scroll-indicator-fade-in 2.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-custom-bounce {
          animation: custom-bounce 2s ease-in-out infinite;
        }

        .animate-button-pulse {
          animation: button-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;