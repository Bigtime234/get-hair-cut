"use client"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Login } from '@/lib/actions/authgoogle'
import { Session } from 'next-auth'
import { auth } from "@/server/auth"
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-8 min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black", className)} {...props}>
      <Card className="overflow-hidden shadow-2xl border border-amber-500/20 max-w-5xl mx-auto mt-8 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left side - Form */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex flex-col gap-8 h-full justify-between" style={{ minHeight: "500px" }}>
              {/* Header section */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4 mb-4">
                  {/* Logo */}
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src="/Barber1.jpg"
                      alt="Professional Barber Logo"
                      width={96}
                      height={96}
                      className="rounded-full object-cover shadow-lg border-4 border-amber-400/30"
                      priority
                    />
                  </div>
                  
                  <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                      Elite Barber Lounge
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-400 mx-auto mt-2 rounded-full"></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-300 text-lg leading-relaxed font-light">
                    Sign in to book your appointment with our master barbers and 
                    experience the finest in men's grooming and style.
                  </p>
                </div>
              </div>

              {/* Authentication section */}
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-4 font-medium">
                    Secure booking system powered by Google
                  </p>
                  <Button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-4 text-base bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => Login()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="font-semibold">Continue with Google</span>
                  </Button>
                </div>

                {/* Benefits section */}
                <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-6 border border-amber-400/20 backdrop-blur-sm">
                  <p className="text-center text-amber-300 font-semibold mb-4 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
                    </svg>
                    Premium Member Benefits
                  </p>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                      <span className="font-medium">Priority booking & scheduling</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                      <span className="font-medium">Choose your preferred barber</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                      <span className="font-medium">Service history & preferences</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                      <span className="font-medium">Exclusive discounts & offers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-yellow-600/20"></div>
            <Image
              src="/Barber1.jpg"
              alt="Professional barber at work - Elite Barber Lounge"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 0px, 50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center text-white p-8">
                <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Crafted with Precision</h2>
                <p className="text-xl opacity-90 drop-shadow font-light">Where tradition meets modern style</p>
                <div className="w-20 h-1 bg-amber-400 mx-auto mt-4 rounded-full opacity-80"></div>
                
                {/* Decorative barber elements */}
                <div className="flex justify-center gap-4 mt-6 opacity-70">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                  <div className="w-1 h-6 bg-current rounded-full"></div>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center pb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
        <p className="text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <a href="#" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}