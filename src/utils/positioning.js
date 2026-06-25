/**
 * Utility functions for positioning elements
 * Extracted from PropertiesPanel for reusability
 */

export class PositioningUtils {
    /**
     * Calculate optimal position for a floating panel
     * @param {Object} options - Positioning options
     * @returns {Object} - Style object with position properties
     */
    static calculatePanelPosition({
        nodePosition,
        nodeSize,
        panelSize,
        containerSize,
        zoom = 1,
        pan = { x: 0, y: 0 },
        gap = 10,
        padding = 24
    }) {
        const { GAP, VIEWPORT_PADDING } = gap;

        // Node screen position (relative to container)
        const nodeScreenX = nodePosition.x * zoom + pan.x;
        const nodeScreenY = nodePosition.y * zoom + pan.y;
        const nodeScreenWidth = nodeSize.width * zoom;
        const nodeScreenHeight = nodeSize.height * zoom;

        // Center points
        const nodeCenterX = nodeScreenX + nodeScreenWidth / 2;
        const nodeCenterY = nodeScreenY + nodeScreenHeight / 2;

        // Candidate positions (right, left, bottom, top)
        const positions = [
            {
                left: nodeScreenX + nodeScreenWidth + gap,
                top: nodeCenterY - panelSize.height / 2,
                check: (l) => l + panelSize.width <= containerSize.width - padding
            },
            {
                left: nodeScreenX - panelSize.width - gap,
                top: nodeCenterY - panelSize.height / 2,
                check: (l) => l >= padding
            },
            {
                left: nodeCenterX - panelSize.width / 2,
                top: nodeScreenY + nodeScreenHeight + gap,
                check: (l, t) => t + panelSize.height <= containerSize.height - padding
            },
            {
                left: nodeCenterX - panelSize.width / 2,
                top: nodeScreenY - panelSize.height - gap,
                check: (l, t) => t >= padding
            }
        ];

        // Find best fit
        let bestPos = positions[0];
        for (const pos of positions) {
            if (pos.check(pos.left, pos.top)) {
                const isVertical = pos === positions[2] || pos === positions[3];
                let fitsSecondary = true;

                if (!isVertical) {
                    if (pos.top + panelSize.height < 0 || pos.top > containerSize.height) {
                        fitsSecondary = false;
                    }
                } else {
                    if (pos.left + panelSize.width < 0 || pos.left > containerSize.width) {
                        fitsSecondary = false;
                    }
                }

                if (fitsSecondary) {
                    bestPos = pos;
                    break;
                }
            }
        }

        // Apply clamping
        let { left, top } = bestPos;

        left = Math.max(padding, Math.min(left, containerSize.width - panelSize.width - padding));
        top = Math.max(padding, top);

        // Check bottom overflow
        if (top + panelSize.height > containerSize.height - padding) {
            const overflow = (top + panelSize.height) - (containerSize.height - padding);
            top = top - overflow;

            if (top < padding) {
                top = padding;
            }
        }

        // Calculate dynamic max-height
        const availableHeight = containerSize.height - top - padding;

        return {
            left: `${left}px`,
            top: `${top}px`,
            maxHeight: `${availableHeight}px`
        };
    }

    /**
     * Check if element is within viewport bounds
     */
    static isInViewport(element, viewport, padding = 0) {
        return (
            element.left >= padding &&
            element.top >= padding &&
            element.right <= viewport.width - padding &&
            element.bottom <= viewport.height - padding
        );
    }

    /**
     * Clamp value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}
