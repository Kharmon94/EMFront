'use client';

import React, { Component, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MusicPlayerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Music Player Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Clear player state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('player_queue');
      localStorage.removeItem('current_track');
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500/10 dark:bg-red-900/20 border-t border-red-500 z-50 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <FiAlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Music Player Error
              </h3>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                Something went wrong. Click reset to reload the player.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Reset Player
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

