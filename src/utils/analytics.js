
/**
 * Simple analytics tracking utility
 */
export const trackEvent = (eventName, properties = {}) => {
    // In a real app, this would send data to an analytics service like Mixpanel or Google Analytics
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${eventName}`, properties);
    }
};

export const trackHelpOpen = (nodeType, nodeTitle) => {
    trackEvent('help_opened', { nodeType, nodeTitle });
};

export const trackHelpClose = (nodeType, duration) => {
    trackEvent('help_closed', { nodeType, duration });
};

export const trackHelpFeedback = (nodeType, isHelpful) => {
    trackEvent('help_feedback', { nodeType, isHelpful });
};
