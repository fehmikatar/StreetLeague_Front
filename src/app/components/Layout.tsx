import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, Users, Trophy, MapPin, MessageSquare, Activity, Gift, Settings, Map, LogOut, Menu, X, Bell, User, Award, Ticket, Star } from "lucide-react";
import logoImage from "@/assets/46063177b77ac48f46bc6be9e7b29a63cce56278.png";
import { useEffect, useState } from "react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications] = useState(3); // Mock unread count

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // Load user data
    const name = localStorage.getItem('user_name') || 'User';
    const email = localStorage.getItem('user_email') || '';
    const type = localStorage.getItem('user_type') || 'player';
    
    setUserName(name);
    setUserEmail(email);
    setUserType(type);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_type');
    navigate('/auth/login');
  };

  const navItems = [
    { path: "/app", icon: Home, label: "Dashboard" },
    { path: "/app/home", icon: Home, label: "Home" },
    { path: "/app/team", icon: Users, label: "Team" },
    { path: "/app/matches", icon: Trophy, label: "Matches" },
    { path: "/app/booking", icon: MapPin, label: "Booking" },
    { path: "/app/fields", icon: Map, label: "Fields" },
    { path: "/app/community", icon: MessageSquare, label: "Community" },
    { path: "/app/performance", icon: Activity, label: "Performance" },
    { path: "/app/sponsors", icon: Gift, label: "Sponsors" },
    { path: "/app/loyalty", icon: Star, label: "Loyalty Hub" },
    { path: "/app/admin/loyalty", icon: Award, label: "Loyalty Admin" },
    { path: "/app/admin/badges", icon: Award, label: "Badges Admin" },
    { path: "/app/admin/promotions", icon: Ticket, label: "Promos Admin" },
    { path: "/app/admin", icon: Settings, label: "Admin" },
  ];

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <img src={logoImage} alt="StreetLeague" className="h-8 w-auto" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-all"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <img src={logoImage} alt="StreetLeague" className="h-8 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* User Profile */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {userType === 'owner' ? 'Owner' : 'Player'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                        active
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-border bg-card hidden lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-center border-b border-border px-6">
            <img src={logoImage} alt="StreetLeague" className="h-12 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-muted p-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{userName}</div>
                <div className="text-xs text-muted-foreground">
                  {userType === 'owner' ? 'Owner' : 'Player'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-error-red/10 text-error-red hover:bg-error-red/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:pl-72">
        {/* Desktop Top Bar */}
        <div className="hidden lg:block sticky top-0 z-30 bg-card border-b border-border">
          <div className="px-6 py-4 flex items-center justify-end gap-4">
            {/* Notifications */}
            <Link
              to="/app/notifications"
              className="relative p-2 rounded-xl hover:bg-muted transition-all"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile Link */}
            <Link
              to="/app/user-profile"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-muted transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">{userName}</div>
                <div className="text-xs text-muted-foreground">View Profile</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="pt-16 pb-20 lg:pt-0 lg:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}