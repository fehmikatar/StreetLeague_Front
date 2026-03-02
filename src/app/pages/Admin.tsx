import { useState } from "react";
import {
  Users,
  Calendar,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
} from "lucide-react";

export function Admin() {
  const [activeTab, setActiveTab] = useState<"users" | "bookings" | "inventory">("users");

  const stats = [
    { label: "Total Users", value: "2,456", change: "+12%", icon: Users, color: "#1DB954" },
    { label: "Active Bookings", value: "342", change: "+8%", icon: Calendar, color: "#F26419" },
    { label: "Inventory Items", value: "1,234", change: "+5%", icon: Package, color: "#06D6A0" },
    { label: "Revenue", value: "$45.2k", change: "+15%", icon: ShoppingBag, color: "#F97316" },
  ];

  const users = [
    { id: 1, name: "Alex Rivera", email: "alex@example.com", role: "Player", status: "active", joinDate: "2025-11-15" },
    { id: 2, name: "Morgan Lee", email: "morgan@example.com", role: "Captain", status: "active", joinDate: "2025-10-20" },
    { id: 3, name: "Jordan Chen", email: "jordan@example.com", role: "Player", status: "inactive", joinDate: "2025-09-12" },
    { id: 4, name: "Taylor Brooks", email: "taylor@example.com", role: "Player", status: "active", joinDate: "2025-12-05" },
    { id: 5, name: "Casey Kim", email: "casey@example.com", role: "Coach", status: "active", joinDate: "2025-08-30" },
  ];

  const bookings = [
    { id: 1, facility: "Central Arena", user: "Alex Rivera", date: "2026-02-05", time: "6:00 PM", status: "confirmed", amount: 45 },
    { id: 2, facility: "Green Field", user: "Morgan Lee", date: "2026-02-06", time: "5:30 PM", status: "pending", amount: 60 },
    { id: 3, facility: "Elite Tennis Club", user: "Jordan Chen", date: "2026-02-07", time: "4:00 PM", status: "confirmed", amount: 35 },
    { id: 4, facility: "Central Arena", user: "Taylor Brooks", date: "2026-02-08", time: "7:00 PM", status: "cancelled", amount: 45 },
  ];

  const inventory = [
    { id: 1, name: "Pro Running Shoes", category: "Footwear", stock: 45, price: 120, status: "in_stock" },
    { id: 2, name: "Training Kit", category: "Apparel", stock: 12, price: 85, status: "low_stock" },
    { id: 3, name: "Performance Apparel", category: "Apparel", stock: 0, price: 95, status: "out_of_stock" },
    { id: 4, name: "Sports Equipment Set", category: "Equipment", stock: 28, price: 150, status: "in_stock" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Admin Control Center</h1>
              <p className="text-muted-foreground">
                Manage users, bookings, and e-commerce inventory
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">
                <Filter className="h-5 w-5 inline mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="border-b border-border p-2 bg-muted/30">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  activeTab === "users"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  activeTab === "bookings"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Bookings
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`px-6 py-3 rounded-xl transition-all ${
                  activeTab === "inventory"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Inventory
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Users Table */}
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Join Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-semibold">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.status === "active" ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-muted rounded-lg transition-all">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bookings Table */}
          {activeTab === "bookings" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Facility</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-muted/20 transition-all">
                      <td className="px-6 py-4 font-semibold">{booking.facility}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{booking.user}</td>
                      <td className="px-6 py-4 text-sm">{booking.date}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{booking.time}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-primary/10 text-primary"
                              : booking.status === "pending"
                              ? "bg-accent/10 text-accent"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">${booking.amount}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-muted rounded-lg transition-all">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Inventory Table */}
          {activeTab === "inventory" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-all">
                      <td className="px-6 py-4 font-semibold">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{item.category}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            item.stock === 0
                              ? "text-destructive"
                              : item.stock < 15
                              ? "text-accent"
                              : "text-primary"
                          }`}
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">${item.price}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.status === "in_stock" ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : item.status === "low_stock" ? (
                            <AlertCircle className="h-4 w-4 text-accent" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-xs capitalize">
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-muted rounded-lg transition-all">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-6 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {activeTab === "users" ? users.length : activeTab === "bookings" ? bookings.length : inventory.length} entries
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-all">
                Previous
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
