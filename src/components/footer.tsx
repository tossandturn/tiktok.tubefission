import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/80 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <path
                    d="M24.5 8.5c-2.5 0-4.8-1.3-6.1-3.3v11.8c0 5.2-4.2 9.5-9.5 9.5S-.6 22.2-.6 17s4.2-9.5 9.5-9.5c.5 0 1 0 1.5.1v5.2c-.5-.1-1-.2-1.5-.2-2.4 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3V0h5.1c.7 3.2 3.2 5.7 6.4 6.4v2.1z"
                    transform="translate(6, 4)"
                    fill="url(#footer-gradient)"
                  />
                  <defs>
                    <linearGradient id="footer-gradient" x1="0" y1="0" x2="32" y2="32">
                      <stop offset="0%" stopColor="#00f2ea" />
                      <stop offset="100%" stopColor="#ff0050" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  TikTok
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#00f2ea] uppercase">
                  Intelligence
                </span>
              </div>
            </Link>
            <p className="text-xs text-white/40 leading-relaxed">
              Discover TikTok trends before they explode. Real-time viral analytics and creator intelligence for content strategy.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-2.5">
              <li><Link href="/explore" className="text-sm text-white/40 hover:text-white transition-colors">Explore Trends</Link></li>
              <li><Link href="/trending" className="text-sm text-white/40 hover:text-white transition-colors">Trending Now</Link></li>
              <li><Link href="/analytics" className="text-sm text-white/40 hover:text-white transition-colors">Analytics</Link></li>
              <li><Link href="/niche-finder" className="text-sm text-white/40 hover:text-white transition-colors">Niche Finder</Link></li>
              <li><Link href="/watchlist" className="text-sm text-white/40 hover:text-white transition-colors">Watchlist</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li><Link href="/topic/tiktok-trending-now" className="text-sm text-white/40 hover:text-white transition-colors">TikTok Trends Guide</Link></li>
              <li><Link href="/topic/tiktok-creator-growth" className="text-sm text-white/40 hover:text-white transition-colors">Creator Economy</Link></li>
              <li><Link href="/topic/tiktok-marketing-guide" className="text-sm text-white/40 hover:text-white transition-colors">Viral Marketing</Link></li>
              <li><Link href="/topic/tiktok-analytics-tools" className="text-sm text-white/40 hover:text-white transition-colors">Social Analytics</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-white/40">Tubefission LLC</span></li>
              <li><span className="text-sm text-white/40">Built with Next.js</span></li>
              <li><span className="text-sm text-white/40">Data: Apify + Neon DB</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} TikTok Intelligence. Not affiliated with TikTok/ByteDance.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-white/20">
            <span>Google AdSense: ca-pub-2329966945529740</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
