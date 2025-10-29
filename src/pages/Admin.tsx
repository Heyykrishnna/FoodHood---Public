import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MessageSquare, Send, ShoppingBag, TrendingUp, Clock, Users, Package, DollarSign, Filter, Search, Eye, Edit } from "lucide-react";

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price_at_order: number;
  menu_items: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  user_id: string;
  phone: string;
  hostel_name: string;
  room_number: string;
  profiles?: {
    email: string;
    full_name: string;
  };
  order_items?: OrderItem[];
}

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
  is_available: boolean;
}

interface PricingRule {
  id: string;
  menu_item_id: string;
  time_of_day: "morning" | "afternoon" | "evening" | "night";
  price_multiplier: number;
  fixed_price: number | null;
}

interface Message {
  id: string;
  order_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
    image_url: "",
  });
  const [newPricingRule, setNewPricingRule] = useState({
    menu_item_id: "",
    time_of_day: "morning" as "morning" | "afternoon" | "evening" | "night",
    price_multiplier: "1",
    fixed_price: "",
  });
  const [newMessage, setNewMessage] = useState({
    order_id: "",
    user_id: "",
    message: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchOrders();
      fetchCategories();
      fetchMenuItems();
      fetchPricingRules();
      fetchMessages();
    });

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, toast]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(
          id,
          menu_item_id,
          quantity,
          price_at_order,
          menu_items(name, image_url)
        )
      `)
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data as any);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    if (data) setCategories(data);
  };

  const fetchMenuItems = async () => {
    const { data } = await supabase.from("menu_items").select("*");
    if (data) setMenuItems(data);
  };

  const fetchPricingRules = async () => {
    const { data } = await supabase.from("pricing_rules").select("*");
    if (data) setPricingRules(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setMessages(data as any);
  };

  const updateOrderStatus = async (orderId: string, status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled") => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Order status updated",
      });
      fetchOrders();
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.base_price || !newItem.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("menu_items").insert({
      name: newItem.name,
      description: newItem.description || null,
      base_price: parseFloat(newItem.base_price),
      category_id: newItem.category_id,
      image_url: newItem.image_url || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Menu item added successfully",
      });
      setNewItem({ name: "", description: "", base_price: "", category_id: "", image_url: "" });
      fetchMenuItems();
    }
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
      fetchMenuItems();
    }
  };

  const toggleItemAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } else {
      fetchMenuItems();
    }
  };

  const addPricingRule = async () => {
    if (!newPricingRule.menu_item_id || !newPricingRule.time_of_day) {
      toast({
        title: "Error",
        description: "Please select menu item and time of day",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("pricing_rules").insert({
      menu_item_id: newPricingRule.menu_item_id,
      time_of_day: newPricingRule.time_of_day,
      price_multiplier: parseFloat(newPricingRule.price_multiplier),
      fixed_price: newPricingRule.fixed_price ? parseFloat(newPricingRule.fixed_price) : null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add pricing rule",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Pricing rule added successfully",
      });
      setNewPricingRule({ menu_item_id: "", time_of_day: "morning", price_multiplier: "1", fixed_price: "" });
      fetchPricingRules();
    }
  };

  const deletePricingRule = async (id: string) => {
    const { error } = await supabase.from("pricing_rules").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete pricing rule",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Pricing rule deleted successfully",
      });
      fetchPricingRules();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.order_id || !newMessage.user_id || !newMessage.message) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    
    const { error } = await supabase.from("messages").insert({
      order_id: newMessage.order_id,
      user_id: newMessage.user_id,
      message: newMessage.message,
      sent_by: session.session?.user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      setNewMessage({ order_id: "", user_id: "", message: "" });
      fetchMessages();
    }
  };

  if (!isAdmin) {
    return null;
  }

  const statusOptions: Array<"pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"> = 
    ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3 animate-fade-in">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Manage your Rishihood Campus food service</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                <ShoppingBag className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {orders.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">All time orders</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-secondary/50" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
                <Clock className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                {todayOrders.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Orders today</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent/50" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                ₹{totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ₹{todayRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Revenue today</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50 backdrop-blur">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Package className="w-4 h-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {/* Search and Filter */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders by ID, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredOrders.length === 0 ? (
              <Card className="border-2">
                <CardContent className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">No orders found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      order.status === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                      order.status === 'preparing' ? 'bg-gradient-to-r from-secondary to-accent' :
                      'bg-gradient-to-r from-primary to-secondary'
                    }`} />
                    <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">
                              Order #{order.id.slice(0, 8)}
                            </CardTitle>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            } className="text-xs">
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm mt-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Customer:</span>
                              <span className="font-medium">{order.profiles?.full_name || order.profiles?.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Hostel:</span>
                              <span className="font-medium">{order.hostel_name} - Room {order.room_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{order.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">{new Date(order.created_at).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ₹{Number(order.total_amount).toFixed(2)}
                          </p>
                          <Badge className="mt-2" variant="outline">
                            {order.payment_method.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Order Items */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mb-6 p-5 bg-gradient-to-br from-muted/50 to-transparent rounded-xl border-2 border-muted">
                          <h4 className="font-semibold mb-4 flex items-center gap-2 text-base">
                            <Package className="w-5 h-5 text-primary" />
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-3 bg-background rounded-lg hover:shadow-md transition-shadow">
                                <span className="font-medium flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-primary" />
                                  {item.menu_items.name} <span className="text-muted-foreground">× {item.quantity}</span>
                                </span>
                                <span className="font-semibold text-primary">
                                  ₹{Number(item.price_at_order).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Update Order Status
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                          {statusOptions.map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={order.status === status ? "default" : "outline"}
                              onClick={() => updateOrderStatus(order.id, status)}
                              className={order.status === status ? "shadow-lg" : ""}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent" />
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Plus className="w-6 h-6 text-secondary" />
                  Add New Menu Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold">Item Name *</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Maggi Masala"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                    <Select
                      value={newItem.category_id}
                      onValueChange={(value) => setNewItem({ ...newItem, category_id: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-base font-semibold">Base Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newItem.base_price}
                      onChange={(e) => setNewItem({ ...newItem, base_price: e.target.value })}
                      placeholder="0.00"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-base font-semibold">Image URL</Label>
                    <Input
                      id="image"
                      value={newItem.image_url}
                      onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                      placeholder="maggi-dish.jpg"
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Delicious item description..."
                    className="min-h-24 resize-none"
                  />
                </div>
                <Button onClick={addMenuItem} className="w-full h-12 text-base bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Menu Item
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className="border-2 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${item.is_available ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-gray-400 to-gray-300'}`} />
                  <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{item.name}</CardTitle>
                      <Badge variant={item.is_available ? "default" : "secondary"} className="shadow-md">
                        {item.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      ₹{Number(item.base_price).toFixed(2)}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleItemAvailability(item.id, item.is_available)}
                        className="flex-1 hover:border-primary hover:text-primary"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Toggle
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMenuItem(item.id)}
                        className="shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="w-6 h-6 text-accent" />
                  Add Time-Based Pricing Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="menu-item" className="text-base font-semibold">Menu Item *</Label>
                    <Select
                      value={newPricingRule.menu_item_id}
                      onValueChange={(value) =>
                        setNewPricingRule({ ...newPricingRule, menu_item_id: value })
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-base font-semibold">Time of Day *</Label>
                    <Select
                      value={newPricingRule.time_of_day}
                      onValueChange={(value: "morning" | "afternoon" | "evening" | "night") =>
                        setNewPricingRule({ ...newPricingRule, time_of_day: value })
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">🌅 Morning (6AM-12PM)</SelectItem>
                        <SelectItem value="afternoon">☀️ Afternoon (12PM-6PM)</SelectItem>
                        <SelectItem value="evening">🌆 Evening (6PM-10PM)</SelectItem>
                        <SelectItem value="night">🌙 Night (10PM-6AM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="multiplier" className="text-base font-semibold">Price Multiplier</Label>
                    <Input
                      id="multiplier"
                      type="number"
                      step="0.1"
                      value={newPricingRule.price_multiplier}
                      onChange={(e) =>
                        setNewPricingRule({ ...newPricingRule, price_multiplier: e.target.value })
                      }
                      placeholder="1.0"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fixed" className="text-base font-semibold">Fixed Price (₹)</Label>
                    <Input
                      id="fixed"
                      type="number"
                      step="0.01"
                      value={newPricingRule.fixed_price}
                      onChange={(e) =>
                        setNewPricingRule({ ...newPricingRule, fixed_price: e.target.value })
                      }
                      placeholder="Optional"
                      className="h-12"
                    />
                  </div>
                </div>
                <Button onClick={addPricingRule} className="w-full h-12 text-base bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Pricing Rule
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingRules.map((rule) => {
                const item = menuItems.find((i) => i.id === rule.menu_item_id);
                return (
                  <Card key={rule.id} className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
                    <CardHeader className="bg-gradient-to-br from-accent/5 to-transparent">
                      <CardTitle className="text-lg group-hover:text-accent transition-colors">{item?.name || "Unknown Item"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium capitalize">{rule.time_of_day}</span>
                      </div>
                      {rule.fixed_price ? (
                        <p className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                          Fixed: ₹{Number(rule.fixed_price).toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          Multiplier: {rule.price_multiplier}x
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePricingRule(rule.id)}
                        className="w-full shadow-md"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Rule
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Send Message to Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="order-select" className="text-base font-semibold">Select Order *</Label>
                  <Select
                    value={newMessage.order_id}
                    onValueChange={(value) => {
                      const order = orders.find(o => o.id === value);
                      setNewMessage({ 
                        ...newMessage, 
                        order_id: value,
                        user_id: order?.user_id || ""
                      });
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          Order #{order.id.slice(0, 8)} - {order.profiles?.full_name || order.profiles?.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-semibold">Message *</Label>
                  <Textarea
                    id="message"
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                    placeholder="Type your message to the customer..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button onClick={sendMessage} className="w-full h-12 text-base bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Recent Messages
              </h3>
              {messages.length === 0 ? (
                <Card className="border-2">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground text-lg">No messages yet.</p>
                  </CardContent>
                </Card>
              ) : (
                messages.map((message) => (
                  <Card key={message.id} className="border-2 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            To: {message.profiles?.full_name || message.profiles?.email || "Unknown"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Package className="w-3 h-3" />
                            Order #{message.order_id.slice(0, 8)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(message.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm p-3 bg-muted/50 rounded-lg border-l-4 border-primary">{message.message}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    {orders.length}
                  </p>
                  <p className="text-sm text-muted-foreground">All time orders</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Pending Orders</CardTitle>
                    <Clock className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
                    {orders.filter((o) => o.status === "pending").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                    ₹{orders.reduce((sum, o) => sum + Number(o.total_amount), 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total earnings</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Completed</CardTitle>
                    <Package className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
                    {orders.filter((o) => o.status === "delivered").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Successfully delivered</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Orders by Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"].map((status) => {
                    const count = orders.filter((o) => o.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize">{status}</span>
                          <span className="text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              status === 'delivered' ? 'bg-green-500' :
                              status === 'cancelled' ? 'bg-red-500' :
                              'bg-primary'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-secondary" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["upi", "cod"].map((method) => {
                    const count = orders.filter((o) => o.payment_method === method).length;
                    const amount = orders
                      .filter((o) => o.payment_method === method)
                      .reduce((sum, o) => sum + Number(o.total_amount), 0);
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={method} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold uppercase text-sm">{method}</span>
                          <Badge variant="outline">{count} orders</Badge>
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                          ₹{amount.toFixed(2)}
                        </p>
                        <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
