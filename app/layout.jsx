import "./globals.css";

const siteDescription = "Close-up sleight of hand, designed as atmosphere for refined private events.";
const previewImage = "/assets/images/experience-performance.jpg";

export const metadata = {
  metadataBase: new URL("https://artificefx.com"),
  title: "Artifice",
  applicationName: "Artifice",
  description: siteDescription,
  appleWebApp: {
    title: "Artifice",
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Artifice",
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
    title: "Artifice",
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
