import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import { clsx } from 'clsx';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  actions?: React.ReactNode[];
  className?: string;
  gradient?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  actions = [],
  className,
  gradient = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-6 rounded-2xl border backdrop-blur-xl',
        gradient 
          ? 'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-gray-700/50' 
          : 'bg-gray-900/90 border-gray-700/30',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            leftIcon={<ArrowLeft size={16} />}
            className="shrink-0"
          >
            Back
          </Button>
        )}
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      {actions.length > 0 && (
        <div className="flex items-center gap-3">
          {actions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PageHeader;