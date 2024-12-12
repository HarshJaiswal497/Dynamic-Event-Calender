// src/app/layout.tsx

import './globals.css';  // Make sure the global styles are included
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Dynamic Event Calendar</title>
      </head>
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
