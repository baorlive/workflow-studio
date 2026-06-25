import React from 'react';

const WorkflowPattern = () => (
  <svg
    className="w-full h-full text-primary-200"
    viewBox="0 0 1000 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="currentColor" fillOpacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />

    {/* Abstract Workflow Nodes */}
    <g>
      {/* Node group 1 */}
      <rect x="50" y="80" width="120" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="110" cy="110" r="15" fill="currentColor" fillOpacity="0.1" />

      {/* Connection 1 */}
      <path d="M170 110 C220 110 220 180 270 180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Node group 2 */}
      <rect x="270" y="150" width="120" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="330" cy="180" r="15" fill="currentColor" fillOpacity="0.1" />

      {/* Connection 2 */}
      <path d="M390 180 C440 180 440 80 490 80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Node group 3 */}
      <rect x="490" y="50" width="120" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="550" cy="80" r="15" fill="currentColor" fillOpacity="0.1" />

      {/* Connection 3 */}
      <path d="M390 180 C440 180 440 280 490 280" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Node group 4 */}
      <rect x="490" y="250" width="120" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="550" cy="280" r="15" fill="currentColor" fillOpacity="0.1" />

      {/* Connection 4 */}
      <path d="M610 80 C660 80 660 180 710 180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M610 280 C660 280 660 180 710 180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Node group 5 (End) */}
      <rect x="710" y="150" width="120" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="770" cy="180" r="15" fill="currentColor" fillOpacity="0.1" />

      {/* Extra floating elements */}
      <circle cx="850" cy="100" r="4" fill="currentColor" fillOpacity="0.2" />
      <circle cx="900" cy="250" r="6" fill="currentColor" fillOpacity="0.2" />
      <circle cx="50" cy="250" r="4" fill="currentColor" fillOpacity="0.2" />
    </g>
  </svg>
);

const BackgroundAnimation = () => {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none overflow-hidden -z-10 select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent opacity-20" />

      {/* Workflow Image Overlay with Gradient Fade */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <WorkflowPattern />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-400 to-transparent animate-flow-beam opacity-20" />
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-300 to-transparent animate-flow-beam opacity-10 [animation-delay:1s]" />
      <div className="absolute top-0 right-1/3 translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-300 to-transparent animate-flow-beam opacity-10 [animation-delay:2s]" />
    </div>
  );
};

export default BackgroundAnimation;
