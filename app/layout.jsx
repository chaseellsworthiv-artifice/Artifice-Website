import "./globals.css";

export const metadata = {
  title: "Artifice",
  description: "A dark academic immersive website for Artifice.",
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
