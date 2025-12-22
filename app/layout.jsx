import { Metadata } from 'next'
import {
  ClerkProvider
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { instrumentSans } from "./styles/fonts";
import Navbar from "./Navbar";
import Footer from './Footer';
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Resulift.ai',
  description: 'Resume + Job Description = Success!',
}

export default function RootLayout({
  children,
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${instrumentSans.className} ${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}>
          <Navbar />

          <main className="flex-1 min-h-0 overflow-hidden flex flex-col pt-20 px-6 max-w-screen-xl mx-auto w-full">
            {children}
          </main>

          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}