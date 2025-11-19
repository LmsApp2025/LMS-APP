'use client'; 

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

// This new component ONLY wraps the ThemeProvider
export default function ClientProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
        {children}
    </NextThemesProvider>
  );
}
