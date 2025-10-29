import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { 
  Store, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Smartphone,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import foodhoodLogo from "@/assets/foodhood-logo.png";

const VendorPartner = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,140,0,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(220,38,38,0.3),transparent_50%)]" />
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="container relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
            <Store className="w-5 h-5 text-yellow-300" />
            <span className="text-base font-semibold">For Vendors & Partners</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in leading-tight">
            Grow Your Business <br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-200 to-yellow-300 bg-clip-text text-transparent">
              With FoodHood
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Join Rishihood University's premier food delivery platform. 
            <br className="hidden md:block" />
            Reach 500+ students and grow your business with zero commission fees.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeCPU9zAmKP8uGU6K-gwHyNfayoMLigmwajm1PgbMK4nnieWQ/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                className="text-lg px-10 py-6 bg-white text-orange-600 hover:bg-orange-50 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                Contact Us <ChevronRight className="ml-2" />
              </Button>
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base opacity-90">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">0%</div>
              <div className="text-sm md:text-base opacity-90">Commission</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm md:text-base opacity-90">Orders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Why Partner With Us?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to succeed on campus
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <BenefitCard 
              icon={<Users className="w-8 h-8" />}
              title="Direct Access"
              description="Reach 500+ students directly on campus with targeted marketing"
            />
            <BenefitCard 
              icon={<DollarSign className="w-8 h-8" />}
              title="Zero Commission"
              description="Keep 100% of your earnings with no hidden fees or charges"
            />
            <BenefitCard 
              icon={<Clock className="w-8 h-8" />}
              title="Dynamic Pricing"
              description="Control your pricing strategy with time-based pricing tools"
            />
            <BenefitCard 
              icon={<Smartphone className="w-8 h-8" />}
              title="Easy Dashboard"
              description="Manage orders, menu, and pricing from one simple dashboard"
            />
            <BenefitCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Analytics"
              description="Track your performance with detailed sales analytics"
            />
            <BenefitCard 
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Secure Payments"
              description="Fast and secure payment processing with UPI integration"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Getting Started is Easy</h2>
            <p className="text-muted-foreground text-lg">Join our platform in three simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-200 dark:border-orange-900/30">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Contact Us</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Fill out the contact form or reach out to discuss partnership opportunities
              </p>
            </div>
            
            <div className="relative bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-200 dark:border-orange-900/30">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Setup Menu</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Add your menu items, set prices, and configure your store preferences
              </p>
            </div>
            
            <div className="relative bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-200 dark:border-orange-900/30">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Start Selling</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Go live and start receiving orders from students across campus
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader className="text-center text-white">
                <CardTitle className="text-4xl font-bold mb-4">Ready to Partner?</CardTitle>
                <CardDescription className="text-xl text-white/90">
                  Contact us to learn more about partnership opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4 text-white mb-8">
                  <p className="text-sm opacity-90 max-w-2xl mx-auto mt-6">
                    We'll get back to you within 24 hours to discuss how we can help grow your business on campus
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/")} 
                  size="lg"
                  variant="secondary"
                  className="text-lg px-10 py-6 font-semibold"
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-900/30 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-2">
    <div className="inline-flex p-5 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default VendorPartner;
