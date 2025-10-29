import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { z } from "zod";

const checkoutSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  hostelName: z.string().min(2, "Hostel name is required"),
  roomNumber: z.string().min(1, "Room number is required"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone: "",
    hostelName: "",
    roomNumber: "",
    instructions: "",
    paymentMethod: "cod" as "upi" | "cod",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", userId)
      .single();
    
    if (data) {
      setFormData((prev) => ({
        ...prev,
        phone: data.phone || "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    
    setIsLoading(true);

    try {
      const validated = checkoutSchema.parse(formData);

      // If UPI is selected, redirect to payment first
      if (formData.paymentMethod === "upi") {
        window.location.href = `upi://pay?pa=yatharth102007@fam&pn=Rishihood Campus&cu=INR&am=${total}`;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          status: "pending",
          payment_method: formData.paymentMethod,
          payment_status: formData.paymentMethod === "cod" ? "pending" : "pending",
          phone: validated.phone,
          hostel_name: validated.hostelName,
          room_number: validated.roomNumber,
          special_instructions: formData.instructions,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order placed successfully!",
        description: "Your order has been received and is being processed.",
      });

      clearCart();
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/menu");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3 animate-fade-in">
            Complete Your Order
          </h1>
          <p className="text-muted-foreground text-lg">Just a few more details to get your food delivered!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-6">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="text-3xl">🏨</span>
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hostelName" className="text-base font-semibold flex items-center gap-2">
                        <span>🏢</span> Hostel Name
                      </Label>
                      <Input
                        id="hostelName"
                        type="text"
                        placeholder="e.g., Rishihood Hostel A"
                        value={formData.hostelName}
                        onChange={(e) =>
                          setFormData({ ...formData, hostelName: e.target.value })
                        }
                        className="h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roomNumber" className="text-base font-semibold flex items-center gap-2">
                        <span>🚪</span> Room Number
                      </Label>
                      <Input
                        id="roomNumber"
                        type="text"
                        placeholder="e.g., 201"
                        value={formData.roomNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, roomNumber: e.target.value })
                        }
                        className="h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                      <span>📱</span> Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your 10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="text-base font-semibold flex items-center gap-2">
                      <span>📝</span> Special Instructions <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="E.g., Extra spicy, No onions, Gate near library..."
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({ ...formData, instructions: e.target.value })
                      }
                      className="min-h-24 text-base resize-none"
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <span>💳</span> Payment Method
                    </Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value: "upi" | "cod") =>
                        setFormData({ ...formData, paymentMethod: value })
                      }
                      className="grid md:grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                        <Label 
                          htmlFor="cod" 
                          className="flex items-center justify-center gap-3 p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-lg"
                        >
                          <span className="text-3xl">💵</span>
                          <span className="font-semibold text-base">Cash on Delivery</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                        <Label 
                          htmlFor="upi" 
                          className="flex items-center justify-center gap-3 p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-secondary peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 peer-data-[state=checked]:shadow-lg"
                        >
                          <span className="text-3xl">📱</span>
                          <span className="font-semibold text-base">UPI Payment</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  
                    {formData.paymentMethod === "upi" && (
                      <div className="mt-4 p-6 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl border-2 border-secondary/30 animate-fade-in">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">✨</span>
                          <p className="text-base font-semibold text-foreground">Quick UPI Payment</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click "Place Order" to complete payment and confirm your order. You'll be redirected to your UPI app automatically.
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Processing...
                      </span>
                    ) : formData.paymentMethod === "upi" ? (
                      <span className="flex items-center gap-2">
                        <span>💳</span> Pay ₹{total.toFixed(2)} & Place Order
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>✅</span> Place Order
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="border-2 shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
              <CardHeader className="bg-gradient-to-br from-accent/5 to-primary/5 pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="text-3xl">🛒</span>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <span className="font-medium text-base">{item.name}</span>
                        <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-base">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 pt-4 mt-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10">
                    <span className="text-xl font-bold">Total Amount</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span>✅</span> Fast delivery to your hostel room
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🔒</span> Secure payment processing
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📞</span> 24/7 customer support
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
