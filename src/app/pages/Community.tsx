import { Heart, MessageCircle, Share2, Plus, Image, Send, Flame, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export function Community() {
  const posts = [
    {
      id: 1,
      author: "Alex Rivera",
      avatar: "AR",
      time: "2 hours ago",
      content:
        "Just finished an amazing practice session with the team! 💪 Who's ready for the championship match this weekend?",
      image:
        "https://images.unsplash.com/photo-1762792760947-0f73f249c37d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwYXRobGV0ZXMlMjBjZWxlYnJhdGluZ3xlbnwxfHx8fDE3NzAwNDUxOTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 45,
      comments: 12,
      shares: 5,
      type: "moment",
    },
    {
      id: 2,
      author: "Morgan Lee",
      avatar: "ML",
      time: "5 hours ago",
      content:
        "Looking for 2 more players for a pickup game at Central Arena tomorrow at 6 PM. All skill levels welcome! 🏀",
      likes: 28,
      comments: 8,
      shares: 3,
      type: "pickup",
    },
    {
      id: 3,
      author: "Jordan Chen",
      avatar: "JC",
      time: "1 day ago",
      content:
        "New personal best today! Ran 5K in 22 minutes. The grind continues 🏃‍♂️💨",
      image:
        "https://images.unsplash.com/photo-1766287453739-c3ffc3f37d05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMHRyYWluaW5nfGVufDF8fHx8MTc3MDAwOTc2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 67,
      comments: 15,
      shares: 8,
      type: "moment",
    },
    {
      id: 4,
      author: "Taylor Brooks",
      avatar: "TB",
      time: "2 days ago",
      content:
        "Anyone interested in forming a weekend soccer league? DM me if you're in! ⚽",
      likes: 34,
      comments: 20,
      shares: 6,
      type: "pickup",
    },
  ];

  const trendingTopics = [
    { tag: "#StreetLeagueChampionship", posts: 1243 },
    { tag: "#PickupGame", posts: 856 },
    { tag: "#FitnessGoals", posts: 624 },
    { tag: "#TeamSpirit", posts: 489 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Community Forum</h1>
              <p className="text-muted-foreground">
                Connect with athletes, share moments, and organize pickup games
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post Card */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  JS
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share your street moment or organize a pickup game..."
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:border-primary focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-all">
                        <Image className="h-5 w-5 text-foreground" />
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all text-sm font-semibold">
                        🏀 Pickup Game
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-semibold">
                        📸 Street Moment
                      </button>
                    </div>
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                      <Send className="h-4 w-4 inline mr-2" />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all"
                >
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {post.avatar}
                        </div>
                        <div>
                          <h4 className="text-base">{post.author}</h4>
                          <p className="text-sm text-muted-foreground">{post.time}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          post.type === "pickup"
                            ? "bg-accent/10 text-accent"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {post.type === "pickup" ? "🏀 Pickup" : "📸 Moment"}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="mb-4">{post.content}</p>

                    {/* Post Image */}
                    {post.image && (
                      <ImageWithFallback
                        src={post.image}
                        alt="Post"
                        className="w-full h-80 object-cover rounded-xl mb-4"
                      />
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-6 py-4 border-t border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-all group">
                        <Heart className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:fill-primary transition-all" />
                        <span className="text-sm font-semibold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-all group">
                        <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                        <span className="text-sm font-semibold">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-all group">
                        <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                        <span className="text-sm font-semibold">{post.shares}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-4 border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
              Load More Posts
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="h-5 w-5 text-accent" />
                <h3>Trending Topics</h3>
              </div>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.tag}
                    className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-primary">{topic.tag}</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Pickup Games */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Active Pickup Games</h3>
              <div className="space-y-4">
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold">Basketball @ Central</h4>
                    <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full">
                      Today
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">6:00 PM • 4/6 players</p>
                  <button className="w-full py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all text-sm">
                    Join Game
                  </button>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold">Soccer @ Green Field</h4>
                    <span className="text-xs px-2 py-1 bg-muted text-foreground rounded-full">
                      Tomorrow
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">5:30 PM • 8/12 players</p>
                  <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm">
                    Join Game
                  </button>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3>Community Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">2,456</div>
                  <div className="text-sm text-muted-foreground">Active Members</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-xl">
                  <div className="text-3xl font-bold text-accent mb-1">342</div>
                  <div className="text-sm text-muted-foreground">Games This Week</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>1.2k</div>
                  <div className="text-sm text-muted-foreground">Posts Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
