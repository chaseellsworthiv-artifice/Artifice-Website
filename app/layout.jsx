import "./globals.css";

const siteTitle = "Artifice | Close-Up Magic by Chase Ellsworth";
const siteDescription = "Close-up magic by Chase Ellsworth, a Chattanooga magician with more than twenty years devoted to the craft. Available for private events, weddings, and corporate gatherings.";
const previewImage = "/assets/images/experience-performance.jpg";

export const metadata = {
  metadataBase: new URL("https://artificefx.com"),
  title: siteTitle,
  applicationName: "Artifice",
  description: siteDescription,
  appleWebApp: {
    title: "Artifice",
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: siteTitle,
    siteName: "Artifice",
    description: siteDescription,
    url: "https://artificefx.com",
    type: "website",
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: "Artifice close-up performance preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [previewImage],
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
