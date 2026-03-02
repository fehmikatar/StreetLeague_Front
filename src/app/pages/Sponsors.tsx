import { Gift, Tag, ShoppingBag, Star, TrendingUp, Package, Percent, ExternalLink } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export function Sponsors() {
  const sponsors = [
    {
      id: 1,
      name: "Nike Sports",
      category: "Footwear & Apparel",
      logo: "🏃",
      discount: 25,
      tier: "platinum",
    },
    {
      id: 2,
      name: "Gatorade",
      category: "Sports Nutrition",
      logo: "⚡",
      discount: 15,
      tier: "gold",
    },
    {
      id: 3,
      name: "Under Armour",
      category: "Athletic Gear",
      logo: "💪",
      discount: 20,
      tier: "platinum",
    },
    {
      id: 4,
      name: "Wilson Sports",
      category: "Equipment",
      logo: "🎾",
      discount: 30,
      tier: "gold",
    },
  ];

  const products = [
    {
      id: 1,
      name: "Pro Performance Running Shoes",
      price: 120,
      discountedPrice: 90,
      image:
        "https://images.unsplash.com/photo-1695459468644-717c8ae17eed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzaG9lcyUyMHNuZWFrZXJzfGVufDF8fHx8MTc3MDAzNjQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sponsor: "Nike Sports",
      rating: 4.8,
      discount: 25,
    },
    {
      id: 2,
      name: "Elite Training Kit",
      price: 85,
      discountedPrice: 68,
      image:
        "https://images.unsplash.com/photo-1652497213813-89e58c19f678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBnZWFyJTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MDA0NTI3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sponsor: "Under Armour",
      rating: 4.6,
      discount: 20,
    },
    {
      id: 3,
      name: "Performance Apparel Set",
      price: 95,
      discountedPrice: 71,
      image:
        "https://images.unsplash.com/photo-1763771522867-c26bf75f12bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMGFwcGFyZWwlMjBjbG90aGluZ3xlbnwxfHx8fDE3NzAwNDUyNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      sponsor: "Nike Sports",
      rating: 4.9,
      discount: 25,
    },
  ];

  const vouchers = [
    {
      id: 1,
      code: "STREETLEAGUE25",
      discount: "25% OFF",
      sponsor: "Nike Sports",
      expiry: "Mar 15, 2026",
      minSpend: 100,
      used: false,
    },
    {
      id: 2,
      code: "FUEL20",
      discount: "20% OFF",
      sponsor: "Gatorade",
      expiry: "Feb 28, 2026",
      minSpend: 50,
      used: false,
    },
    {
      id: 3,
      code: "GEAR30",
      discount: "30% OFF",
      sponsor: "Wilson Sports",
      expiry: "Apr 10, 2026",
      minSpend: 150,
      used: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Collaboration & Sponsor Portal</h1>
              <p className="text-muted-foreground">
                Exclusive deals and gear from our trusted partners
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">
                <ShoppingBag className="h-5 w-5 inline mr-2" />
                <span className="hidden sm:inline">Cart (0)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Sponsor Partners */}
        <div className="mb-12">
          <h3 className="mb-6">Our Partner Brands</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className={`bg-card rounded-2xl p-6 border-2 transition-all hover:shadow-xl cursor-pointer ${
                  sponsor.tier === "platinum"
                    ? "border-accent hover:border-accent/70 bg-accent/5"
                    : "border-primary hover:border-primary/70 bg-primary/5"
                }`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{sponsor.logo}</div>
                  <h4 className="text-sm mb-1">{sponsor.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{sponsor.category}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Tag className="h-4 w-4 text-accent" />
                    <span className="text-sm font-bold text-accent">{sponsor.discount}% OFF</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3>Sponsored Gear & Equipment</h3>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-xl"
                  >
                    <div className="relative">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{product.discount}%
                      </div>
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-semibold">{product.rating}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-base flex-1">{product.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{product.sponsor}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">
                              ${product.discountedPrice}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.price}
                            </span>
                          </div>
                          <p className="text-xs text-accent">Save ${product.price - product.discountedPrice}</p>
                        </div>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 text-sm">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Collaboration Banner */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-8 border border-primary/30">
              <div className="flex items-start gap-6">
                <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center shadow-xl flex-shrink-0">
                  <Gift className="h-8 w-8 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2">Exclusive Team Partnership Benefits</h3>
                  <p className="text-muted-foreground mb-4">
                    As a StreetLeague member, unlock premium discounts, early access to new products, 
                    and special team bundles from our trusted partners.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-xl backdrop-blur-sm">
                      <Percent className="h-4 w-4 text-accent" />
                      <span className="text-sm font-semibold">Up to 30% Off</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-xl backdrop-blur-sm">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Free Shipping</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="h-4 w-4" style={{ color: '#06D6A0' }} />
                      <span className="text-sm font-semibold">Early Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Discount Vouchers */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <Tag className="h-5 w-5 text-accent" />
                <h3>Your Vouchers</h3>
              </div>
              <div className="space-y-4">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      voucher.used
                        ? "border-border bg-muted/20 opacity-60"
                        : "border-accent/30 bg-accent/5 hover:bg-accent/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl font-bold text-accent">{voucher.discount}</div>
                      {voucher.used ? (
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                          Used
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold mb-2">{voucher.sponsor}</h4>
                    <div className="bg-background/50 rounded-lg p-2 mb-3">
                      <code className="text-xs font-mono text-primary">{voucher.code}</code>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Min. spend: ${voucher.minSpend}</p>
                      <p>Expires: {voucher.expiry}</p>
                    </div>
                    {!voucher.used && (
                      <button className="w-full mt-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all text-sm">
                        Apply Code
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Summary */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Rewards Summary</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">$450</div>
                  <div className="text-sm text-muted-foreground">Total Savings</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-xl">
                  <div className="text-3xl font-bold text-accent mb-1">12</div>
                  <div className="text-sm text-muted-foreground">Orders Placed</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>850</div>
                  <div className="text-sm text-muted-foreground">Reward Points</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  Browse All Products
                </button>
                <button className="w-full py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30">
                  Redeem Points
                </button>
                <button className="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">
                  Order History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
