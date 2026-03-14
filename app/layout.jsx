import "./globals.css";

export const metadata = {
  title: "Artifice v2",
  description: "A dark academic immersive website for Artifice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
