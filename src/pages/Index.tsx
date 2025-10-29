import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Timer, ShieldCheck, Zap, CreditCard, ChevronRight, CheckCircle2, Sparkles, TrendingUp, Users } from "lucide-react";
import maggiDish from "@/assets/maggi-dish.jpg";
import snacksHero from "@/assets/snacks-hero.jpg";
import heroBackground from "@/assets/hero page.jpg";
import foodhoodLogo from "@/assets/foodhood-logo.png";
import lays from "@/assets/lays.png";
import rishihoodLogo from "@/assets/COLOUR-1-2.png";
import newtonSchoolLogo from "@/assets/newton-school-logo.png";
import maggiLogo from "@/assets/Maggi_logo.svg.png";
import haldiramLogo from "@/assets/Haldiram's_Logo_SVG.svg.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Food background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/95 via-orange-500/90 to-red-600/90" />
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="container relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Powered by Rishihood University</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in leading-tight">
            Welcome to <br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-200 to-yellow-300 bg-clip-text text-transparent">
              FoodHood
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Experience quick, delicious food delivered right to your hostel. 
            <br className="hidden md:block" />
            Tailored for the Rishihood community with dynamic pricing and lightning-fast service.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Button 
              onClick={() => navigate("/menu")} 
              size="lg"
              className="text-lg px-10 py-6 bg-white text-orange-600 hover:bg-orange-50 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 font-semibold"
            >
              Order Now <ChevronRight className="ml-2" />
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-white text-black hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 font-semibold"
            >
              Sign In / Sign Up
            </Button>
            <Button 
              onClick={() => navigate("/vendor-partner")} 
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-white text-black hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 font-semibold"
            >
              For Vendors
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base opacity-90">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">15min</div>
              <div className="text-sm md:text-base opacity-90">Avg Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm md:text-base opacity-90">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">Most Popular</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Featured Favorites
            </h2>
            <p className="text-muted-foreground text-lg">Loved by the Rishihood community</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-orange-200 dark:border-orange-900/30 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3">
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={maggiDish} 
                  alt="Delicious Maggi" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ Bestseller
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl font-bold text-white mb-2">Hot & Spicy Maggi</h3>
                  <p className="text-white/90 text-lg">Your late-night study companion</p>
                </div>
              </div>
              <div className="p-6">
                <Button 
                  onClick={() => navigate("/menu")} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-orange-500/50 transition-all"
                >
                  Order Now <ChevronRight className="ml-2" />
                </Button>
              </div>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-orange-200 dark:border-orange-900/30 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-3">
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={snacksHero} 
                  alt="Delicious Snacks" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  🔥 Trending
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl font-bold text-white mb-2">Premium Snacks</h3>
                  <p className="text-white/90 text-lg">Perfect for every occasion</p>
                </div>
              </div>
              <div className="p-6">
                <Button 
                  onClick={() => navigate("/menu")} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-orange-500/50 transition-all"
                >
                  Order Now <ChevronRight className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Features</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">Why Choose FoodHood?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built specifically for the Rishihood community with features that matter
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard 
              icon={<Timer className="w-8 h-8" />}
              title="Lightning Fast"
              description="Get your food delivered in just 15-20 minutes to your hostel"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8" />}
              title="100% Secure"
              description="Safe and encrypted payment options via UPI"
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Super Easy"
              description="Quick ordering process with saved favorites and preferences"
            />
            <FeatureCard 
              icon={<CreditCard className="w-8 h-8" />}
              title="Smart Pricing"
              description="Dynamic time-based pricing for maximum value"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-300/20 rounded-full blur-3xl" />
        
        <div className="container px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Simple Process</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three easy steps to satisfy your cravings</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-200 dark:border-orange-900/30">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Browse Menu</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Explore our curated menu with time-based pricing and special offers just for you
              </p>
            </div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-200 dark:border-orange-900/30">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Place Order</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Add items to cart, provide hostel details, and pay securely with UPI
              </p>
            </div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-200 dark:border-orange-900/30">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Enjoy Food</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Sit back and relax while fresh food arrives at your hostel in 15-20 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">Trusted Partners</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Our Partners</h2>
            <p className="text-muted-foreground text-lg">Working with the best to serve you better</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-16 max-w-6xl mx-auto">
            <div className="group transition-all duration-300 hover:scale-110">
              <img src={lays} alt="FoodHood" className="h-20 opacity-50 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0" />
            </div>
            <div className="group transition-all duration-300 hover:scale-110">
              <img src={rishihoodLogo} alt="Rishihood University" className="h-20 opacity-50 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0" />
            </div>
            <div className="group transition-all duration-300 hover:scale-110">
              <img src={newtonSchoolLogo} alt="Newton School" className="h-20 opacity-50 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0" />
            </div>
            <div className="group transition-all duration-300 hover:scale-110">
              <img src={maggiLogo} alt="Maggi" className="h-20 opacity-50 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0" />
            </div>
            <div className="group transition-all duration-300 hover:scale-110">
              <img src={haldiramLogo} alt="Haldiram's" className="h-20 opacity-50 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container px-4 text-center text-white relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Order?
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Join 500+ students enjoying delicious food at Rishihood University. 
            <br className="hidden md:block" />
            Fast delivery, great taste, unbeatable prices!
          </p>
          <Button 
            onClick={() => navigate("/menu")} 
            size="lg"
            className="text-xl px-12 py-7 bg-white text-orange-600 hover:bg-orange-50 shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 font-bold"
          >
            Start Ordering Now <ChevronRight className="ml-2 w-6 h-6" />
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-200 dark:border-orange-900/30 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-2">
    <div className="inline-flex p-5 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default Index;
