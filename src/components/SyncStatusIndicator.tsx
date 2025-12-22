import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  pendingCount: number;
  isOnline?: boolean;
}

export function SyncStatusIndicator({ status, pendingCount, isOnline = true }: SyncStatusIndicatorProps) {
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        text: 'Offline',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
      };
    }

    switch (status) {
      case 'syncing':
        return {
          icon: Loader2,
          text: 'Syncing...',
          color: 'text-gold',
          bgColor: 'bg-gold/10',
          animate: true,
        };
      case 'success':
        return {
          icon: Check,
          text: 'Synced',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Sync failed',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
        };
      default:
        if (pendingCount > 0) {
          return {
            icon: Cloud,
            text: `${pendingCount} pending`,
            color: 'text-gold',
            bgColor: 'bg-gold/10',
          };
        }
        return {
          icon: Cloud,
          text: 'Synced',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      role="status"
      aria-live="polite"
      aria-label={`Sync status: ${statusInfo.text}`}
    >
      <Icon 
        className={`h-3.5 w-3.5 ${statusInfo.animate ? 'animate-spin' : ''}`} 
        aria-hidden="true"
      />
      <span>{statusInfo.text}</span>
      
      {/* Pending count badge */}
      <AnimatePresence>
        {pendingCount > 0 && status !== 'syncing' && (
          <motion.span
            className="ml-1 px-1.5 py-0.5 bg-gold text-primary-foreground rounded-full text-[10px]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {pendingCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
