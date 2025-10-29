import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Clock, Star, TrendingUp, Filter, Grid3X3, List } from "lucide-react";
import Navbar from "@/components/Navbar";
import maggiDish from "@/assets/maggi-dish.jpg";
import snacksHero from "@/assets/snacks-hero.jpg";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  category_id: string;
}

interface PricingRule {
  id: string;
  menu_item_id: string;
  time_of_day: "morning" | "afternoon" | "evening" | "night";
  price_multiplier: number;
  fixed_price: number | null;
}

const Menu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<string>("grid");
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
        fetchPricingRules()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    if (data) setCategories(data);
  };

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true);
    if (data) setMenuItems(data);
  };

  const fetchPricingRules = async () => {
    const { data } = await supabase.from("pricing_rules").select("*");
    if (data) setPricingRules(data);
  };

  const getCurrentPrice = (basePrice: number, itemId: string) => {
    // Get current hour to determine time of day
    const hour = new Date().getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" | "night";
    
    if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 && hour < 22) timeOfDay = "evening";
    else timeOfDay = "night";

    // Check if there's a pricing rule for this item and time
    const pricingRule = pricingRules.find(
      rule => rule.menu_item_id === itemId && rule.time_of_day === timeOfDay
    );

    if (pricingRule) {
      // If fixed price is set, use it
      if (pricingRule.fixed_price) {
        return Number(pricingRule.fixed_price);
      }
      // Otherwise apply multiplier
      return basePrice * Number(pricingRule.price_multiplier);
    }

    return basePrice;
  };

  const getItemImage = (item: MenuItem) => {
    if (item.image_url === 'maggi-dish.jpg') return maggiDish;
    if (item.image_url === 'snacks-hero.jpg') return snacksHero;
    return item.image_url || undefined;
  };

  const handleAddToCart = (item: MenuItem) => {
    const price = getCurrentPrice(Number(item.base_price), item.id);
    addItem({
      id: item.id,
      name: item.name,
      price: price,
      imageUrl: getItemImage(item),
    });
    toast({
      title: "✅ Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 18) return "Afternoon";
    if (hour >= 18 && hour < 22) return "Evening";
    return "Night";
  };

  const getCategoryItemCount = (categoryId: string) => {
    if (categoryId === "all") return menuItems.length;
    return menuItems.filter(item => item.category_id === categoryId).length;
  };

  const getPopularItems = () => {
    // Mock popular items logic - in real app, this would come from analytics
    const popularIds = menuItems.slice(0, Math.ceil(menuItems.length * 0.3)).map(item => item.id);
    return popularIds;
  };

  let filteredItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter((item) => item.category_id === selectedCategory);

  // Apply search filter
  if (searchTerm) {
    filteredItems = filteredItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply sorting
  if (sortBy === "price-low") {
    filteredItems = [...filteredItems].sort((a, b) => 
      getCurrentPrice(Number(a.base_price), a.id) - getCurrentPrice(Number(b.base_price), b.id)
    );
  } else if (sortBy === "price-high") {
    filteredItems = [...filteredItems].sort((a, b) => 
      getCurrentPrice(Number(b.base_price), b.id) - getCurrentPrice(Number(a.base_price), a.id)
    );
  } else if (sortBy === "name") {
    filteredItems = [...filteredItems].sort((a, b) => a.name.localeCompare(b.name));
  }

  const popularItems = getPopularItems();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Clock className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">{getTimeOfDay()} Special Prices</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Our Delicious 
            <span className="bg-gradient-to-r from-yellow-300 via-orange-200 to-yellow-300 bg-clip-text text-transparent">
              Menu
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Discover amazing flavors with dynamic pricing that changes throughout the day.
            <br className="hidden md:block" />
            Fresh, fast, and always delicious!
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/90 backdrop-blur-sm border-0 shadow-2xl focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">{menuItems.length}+</div>
              <div className="text-sm md:text-base opacity-90">Menu Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">{categories.length}+</div>
              <div className="text-sm md:text-base opacity-90">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">15min</div>
              <div className="text-sm md:text-base opacity-90">Avg Prep Time</div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="bg-gradient-to-b from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-orange-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="p-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <div className="mb-10">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`group px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === "all"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-orange-50 border border-orange-200 hover:border-orange-300 hover:scale-105"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  All Items
                  <Badge className={`ml-2 ${selectedCategory === "all" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}}`}>
                    {getCategoryItemCount("all")}
                  </Badge>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`group px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                        : "bg-white text-gray-700 hover:bg-orange-50 border border-orange-200 hover:border-orange-300 hover:scale-105"
                    }`}
                  >
                    {cat.name}
                    <Badge className={`ml-2 ${selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}}`}>
                      {getCategoryItemCount(cat.id)}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className={`grid gap-8 ${
                viewMode === "grid" 
                  ? "md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1 max-w-4xl mx-auto"
              }`}>
                {filteredItems.map((item, index) => {
                  const itemImage = getItemImage(item);
                  const currentPrice = getCurrentPrice(Number(item.base_price), item.id);
                  const hasDiscount = currentPrice !== Number(item.base_price);
                  const isPopular = popularItems.includes(item.id);
                  
                  return (
                    <Card 
                      key={item.id} 
                      className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-orange-500/50 bg-white/80 backdrop-blur-sm animate-fade-in ${
                        viewMode === "list" ? "flex flex-row" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {itemImage && (
                        <div className={`relative bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden ${
                          viewMode === "list" ? "w-48 flex-shrink-0" : "h-64"
                        }`}>
                          <img
                            src={itemImage}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {hasDiscount && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg">
                                <Clock className="w-3 h-3 mr-1" />
                                Special Price!
                              </Badge>
                            )}
                            {isPopular && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg">
                                <Star className="w-3 h-3 mr-1" />
                                Bestseller
                              </Badge>
                            )}
                          </div>
                          
                          {/* Time indicator */}
                          <div className="absolute bottom-4 left-4">
                            <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                              <Clock className="w-3 h-3 mr-1 inline" />
                              15-20 min
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className={viewMode === "list" ? "flex-1 flex flex-col" : ""}>
                        <CardHeader className="space-y-3 pb-4">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors leading-tight">
                              {item.name}
                            </CardTitle>
                          </div>
                          {item.description && (
                            <CardDescription className="text-sm leading-relaxed text-gray-600">
                              {item.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent className="space-y-4 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-3">
                              <p className="text-3xl font-bold text-orange-600">
                                ₹{currentPrice.toFixed(2)}
                              </p>
                              {hasDiscount && (
                                <div className="flex flex-col">
                                  <p className="text-sm text-gray-500 line-through">
                                    ₹{Number(item.base_price).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-green-600 font-semibold">
                                    Save ₹{(Number(item.base_price) - currentPrice).toFixed(2)}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Current Time</div>
                              <div className="text-sm font-semibold text-orange-600">{getTimeOfDay()} Pricing</div>
                            </div>
                          </div>
                          
                          {/* Additional info for list view */}
                          {viewMode === "list" && (
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                15-20 min
                              </span>
                              {isPopular && (
                                <span className="flex items-center gap-1 text-orange-600 font-semibold">
                                  <Star className="w-4 h-4" />
                                  Popular
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="pt-0">
                          <Button
                            className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus className="w-5 h-5" />
                            Add to Cart
                          </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {/* No results message */}
            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-700">No items found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No items match "${searchTerm}". Try searching for something else.`
                    : "No items available in this category."
                  }
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Menu;
