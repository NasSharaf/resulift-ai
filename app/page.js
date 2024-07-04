import Image from "next/image";
import "./globals.css";
import Gallery from "./components/Gallery";
import { pressStart2P, sourceCodePro, instrumentSans } from "./styles/fonts";

export default function Home() {
  return (
      <div className="flex flex-row justify-start">
        <div className="flex flex-col items-start justify-center min-h-screen text-gray-800 py-4 px-4 sm:px-6 lg:px-8 w-6/12">
          <p
            className={`w-full mt-6 max-w-2xl text-center text-lg leading-7 sm:text-2xl sm:leading-9 sm:text-left lg:text-3xl ${instrumentSans.className}`}
          >
            <span className="font-bold">
              In the job market? Tired of rewriting your resume over and over for jobs 
              that won't even call you back? Use Tailored AI!
            </span>
             Use artificial intelligence to rewrite and tailor your resume to each job you 
            apply to in a fraction of the time. Or use Tailored to automatically generate 
            a cover letter. Own your job search, use Tailored AI
          </p>
        </div>
        {/* Gallery */}
        <Gallery />
    </div>
  );
}
