import { CostCalculator } from "@/components/CostCalculator";
import { useEffect } from "react";

const Embed = () => {
  useEffect(() => {
    // Performance optimizations for embedded environment
    // Preload critical resources
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://cartodb-basemaps-c.global.ssl.fastly.net';
    document.head.appendChild(link);

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://tile.openstreetmap.org';
    document.head.appendChild(link2);

    // Add meta tag for CSP if not present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; img-src 'self' data: https://cartodb-basemaps-c.global.ssl.fastly.net https://tile.openstreetmap.org https://cartodb-basemaps-a.global.ssl.fastly.net; connect-src 'self' https://cartodb-basemaps-c.global.ssl.fastly.net https://tile.openstreetmap.org https://vkarnxgrniqtyeeibgxq.supabase.co; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';";
      document.head.appendChild(meta);
    }

    return () => {
      // Cleanup on unmount
      document.head.removeChild(link);
      document.head.removeChild(link2);
    };
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <CostCalculator />
    </div>
  );
};

export default Embed;