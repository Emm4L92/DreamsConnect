import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CreateDreamForm } from "@/components/dream/create-dream-form";
import { DreamFeed } from "@/components/dream/dream-feed";
import { MatchNotification } from "@/components/dream/match-notification";
import { useState } from "react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <h1 className="font-pixel text-2xl md:text-3xl mb-6 leading-relaxed">
                <span className="text-primary">Connect</span> through your 
                <span className="text-secondary"> Dreams</span>
              </h1>
              <p className="text-lg mb-6">
                Share your dream experiences and find others who've dreamed similar journeys. Explore the collective unconscious together.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <button className="btn-brutal bg-primary text-white px-6 py-3 font-semibold rotate-1">
                  Share a Dream
                </button>
                <button className="btn-brutal bg-accent px-6 py-3 font-semibold rotate-neg-1">
                  Explore Dreams
                </button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="https://pixabay.com/get/g5e00af1ad88757396cb1511d4872699de75d508fe164c39ff41ed1ae5853b2bea3862cf2c2e07906773f2b920cc6944b687f43cd22d6f8af16bf743ecb686b83_1280.jpg" 
                alt="Dreamy landscape with floating elements" 
                className="w-full h-auto border-4 border-black shadow-brutal rotate-1"
              />
            </div>
          </div>
        </section>
        
        {/* Create Dream Form */}
        <CreateDreamForm />
        
        {/* Dream Feed */}
        <DreamFeed />
      </main>
      
      {/* Match Notification will appear when needed */}
      <MatchNotification />
      
      <Footer />
    </div>
  );
}
