import React, { useState } from 'react';
import Icon from '../ui/Icon';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/ui';

/**
 * Connection Component - Bezier curved connections between nodes
 */
const Connection = ({ edge, start, end, selected, onClick, onDelete, zoom = 1 }) => {
    const [isHovered, setIsHovered] = useState(false);

    const startX = start.x + NODE_WIDTH / 2;
    const startY = start.y + NODE_HEIGHT;
    const endX = end.x + NODE_WIDTH / 2;
    const endY = end.y;

    const deltaY = Math.abs(endY - startY);
    const controlPointOffset = Math.max(deltaY * 0.5, 100);
    const path = `M ${startX} ${startY} C ${startX} ${startY + controlPointOffset}, ${endX} ${endY - controlPointOffset}, ${endX} ${endY}`;

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(edge.id);
        }
    };

    const strokeWidth = Math.max(1.5, 2 / zoom);
    const arrowId = `arrow-${edge.id}`;

    return (
        <g
            onClick={(e) => { e.stopPropagation(); onClick && onClick(edge.id, e.metaKey || e.ctrlKey); }}
            className="group cursor-pointer pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Arrowhead marker definition */}
            <defs>
                <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" className={selected ? 'fill-primary-500' : 'fill-gray-300 group-hover:fill-primary-400'} style={{ transition: 'fill 150ms' }} />
                </marker>
            </defs>

            {/* Hit area for easier clicking */}
            <path d={path} className="fill-none stroke-transparent stroke-[12px]" />
            <path
                d={path}
                fill="none"
                strokeWidth={strokeWidth}
                markerEnd={`url(#${arrowId})`}
                className={`transition-colors ${selected ? 'stroke-primary-500' : 'stroke-gray-300 group-hover:stroke-primary-400'}`}
            />

            {edge.label && (
                <g transform={`translate(${midX}, ${midY})`}>
                    <rect x="-40" y="-12" width="80" height="24" rx="12" className={`fill-white stroke ${edge.type === 'error' ? 'stroke-red-200' : edge.type === 'success' ? 'stroke-green-200' : 'stroke-gray-200'}`} />
                    <text x="0" y="4" textAnchor="middle" className={`text-[10px] font-medium ${edge.type === 'error' ? 'fill-red-500' : edge.type === 'success' ? 'fill-green-500' : 'fill-gray-500'}`}>
                        {edge.label}
                    </text>
                </g>
            )}

            {/* Delete button - appears on hover */}
            {isHovered && onDelete && (
                <g transform={`translate(${midX}, ${midY})`}>
                    <circle
                        cx="0"
                        cy="0"
                        r="14"
                        className="fill-white stroke-red-400 stroke-2 cursor-pointer hover:fill-red-50 transition-colors"
                        onClick={handleDeleteClick}
                    />
                    <foreignObject x="-10" y="-10" width="20" height="20" className="pointer-events-none">
                        <div className="flex items-center justify-center w-full h-full">
                            <Icon name="trash2" size={14} className="text-red-500" />
                        </div>
                    </foreignObject>
                </g>
            )}
        </g>
    );
};

export default Connection;
