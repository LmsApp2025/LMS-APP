'use client'; 

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/features/store';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ClientProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <Provider store={store}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </Provider>
  );
}