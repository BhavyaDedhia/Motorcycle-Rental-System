import React from 'react';
import './globals.css'

export const metadata = {
  title: 'Motorcycle Rental',
  description: 'Rent motorcycles for your adventures',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
