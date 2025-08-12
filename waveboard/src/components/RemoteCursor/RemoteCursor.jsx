import React from 'react';
import { MousePointer2 } from 'lucide-react';
import classes from './RemoteCursor.module.css';

const RemoteCursor = ({ x, y, color, email }) => {
  // Clip the email to show the part before the '@' sign for privacy and brevity
  const displayName = email.split('@')[0];
  const clippedName = displayName.length > 15 ? `${displayName.substring(0, 15)}...` : displayName;

  if (typeof x !== 'number' || typeof y !== 'number') {
    return null; // Don't render if coordinates are invalid
  }

  return (
    <div
      className={classes.cursorContainer}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <MousePointer2
        className={classes.cursorIcon}
        style={{ color: color }}
        size={20}
      />
      <div
        className={classes.tooltip}
        style={{ backgroundColor: color }}
      >
        {clippedName}
      </div>
    </div>
  );
};

// Memoize the component to prevent re-renders if props haven't changed
export default React.memo(RemoteCursor);