import { Metadata } from 'next'
import {
  ClerkProvider
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { instrumentSans } from "./styles/fonts";
import Navbar from "./Navbar";
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
  title: 'Resumatch.ai',
  description: 'Resume + Job Description = Success!',
}

export default function RootLayout({
  children,
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${instrumentSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Navbar />
          <main className="flex flex-col pt-28 px-6 md:px-20">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}