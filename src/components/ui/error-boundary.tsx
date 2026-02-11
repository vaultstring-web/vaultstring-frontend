'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">Something went wrong</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while loading this component.'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => this.setState({ hasError: false })}
            className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
