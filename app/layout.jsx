import "./globals.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { instrumentSans } from "./styles/fonts";

export const metadata = {
  title: "Resumatch AI",
  description: "Automatically tailor your resume to a job description with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.className} `}>
        <Navbar />
        <main className="flex flex-col pt-20 px-20">{children}</main>
      </body>
    </html>
  );
}
