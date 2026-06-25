import React from 'react';
import { getBezierPath, EdgeText, BaseEdge } from 'reactflow';
import Icon from '../ui/Icon';

const foreignObjectSize = 40;

const ButtonEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}) => {
    const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (evt) => {
        evt.stopPropagation();
        if (data?.onDelete) {
            data.onDelete(id);
        }
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            
            {data?.label && (
                <EdgeText
                    x={sourceX + 10}
                    y={sourceY + 10}
                    label={data.label}
                    labelStyle={{ fill: 'black', fontSize: 12, fontWeight: 500 }}
                    labelBgStyle={{ fill: 'rgba(255, 255, 255, 0.75)' }}
                    labelBgPadding={[2, 4]}
                    labelBgBorderRadius={2}
                />
            )}

            <foreignObject
                width={foreignObjectSize}
                height={foreignObjectSize}
                x={edgeCenterX - foreignObjectSize / 2}
                y={edgeCenterY - foreignObjectSize / 2}
                className="edgebutton-foreignobject"
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <div className="flex items-center justify-center w-full h-full bg-transparent">
                    <button
                        className="w-5 h-5 bg-gray-100 hover:bg-red-500 hover:text-white border border-white rounded-full cursor-pointer flex items-center justify-center shadow-sm transition-colors text-sm leading-none text-gray-500"
                        onClick={onEdgeClick}
                        aria-label="Delete Connection"
                        title="Delete Connection"
                    >
                        <Icon name="x" size={12} />
                    </button>
                </div>
            </foreignObject>
        </>
    );
};

export default ButtonEdge;
