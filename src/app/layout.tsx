import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobConnect",
  description:
    "JobConnect est une plateforme qui met en relation les candidats et les opportunités professionnelles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
