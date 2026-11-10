import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, AlertOctagon } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-amber-400 mb-4 shadow-lg">
        <AlertOctagon className="w-6 h-6" />
      </div>

      <h1 className="text-2xl font-bold font-mono text-zinc-100">404 // ROUTE NOT FOUND</h1>
      <p className="text-xs text-zinc-400 mt-2 max-w-md font-sans">
        The requested operations endpoint does not exist or has been shifted in the active workforce mesh.
      </p>

      <div className="mt-6">
        <Link to="/command-center">
          <Button variant="primary" size="sm" className="gap-2 font-mono">
            <Compass className="w-4 h-4" />
            <span>RETURN TO COMMAND CENTER</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
