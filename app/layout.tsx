import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Site Audit",
  description: "Paste a link. Get a clear punch-list that helps you get more leads.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
