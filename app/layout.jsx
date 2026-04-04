import "./globals.css";

export const metadata = {
  title: "Artifice",
  applicationName: "Artifice",
  description: "A dark academic immersive website for Artifice.",
  appleWebApp: {
    title: "Artifice",
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Artifice",
    siteName: "Artifice",
    description: "A dark academic immersive website for Artifice.",
  },
  twitter: {
    title: "Artifice",
    description: "A dark academic immersive website for Artifice.",
  },
};

export const viewport = {
  themeColor: "#090708",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
