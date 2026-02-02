import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MOL Presentation Generator | AI-Powered Slides",
  description: "Generate professional presentations using AI-powered templates. Create Annual Reports, ESG Reports, and more with MOL Group's intelligent presentation builder.",
  keywords: ["MOL", "presentation", "PowerPoint", "AI", "generator", "slides"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
