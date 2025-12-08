import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useConversationStore } from '../store/conversationStore';

const CustomNode = ({ data }: { data: { label: string, active: boolean } }) => {
    return (
        <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${data.active ? 'border-primary' : 'border-gray-200'}`}>
            <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" />
            <div className="font-bold text-sm">{data.label}</div>
            <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-500" />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

export const ConversationGraph: React.FC = () => {
    const { conversations, activeConversationId, setActiveConversation, getRootId } = useConversationStore();

    const { nodes, edges } = useMemo(() => {
        const activeRootId = getRootId(activeConversationId);
        // Filter conversations to only this tree
        const visibleConversations = Object.values(conversations).filter(c => getRootId(c.id) === activeRootId);

        // Map for easy access
        const conversationMap = new Map(visibleConversations.map(c => [c.id, c]));
        const childrenMap = new Map<string, string[]>();

        // Build Tree Structure
        let rootNodeId: string | null = null;
        visibleConversations.forEach(c => {
            if (!childrenMap.has(c.id)) {
                childrenMap.set(c.id, []);
            }
            if (!c.parentId) {
                rootNodeId = c.id;
            }
        });

        visibleConversations.forEach(c => {
            if (c.parentId) {
                if (!childrenMap.has(c.parentId)) childrenMap.set(c.parentId, []);
                childrenMap.get(c.parentId)!.push(c.id);
            }
        });

        // Layout Constants
        const NODE_WIDTH = 250; // Width of node + gap
        const LEVEL_HEIGHT = 150;

        // Recursive function to calculate subtree widths
        const subtreeWidths = new Map<string, number>();
        const calculateWidth = (id: string): number => {
            const children = childrenMap.get(id) || [];
            if (children.length === 0) {
                subtreeWidths.set(id, NODE_WIDTH);
                return NODE_WIDTH;
            }
            const width = children.reduce((sum, childId) => sum + calculateWidth(childId), 0);
            subtreeWidths.set(id, Math.max(width, NODE_WIDTH)); // Ensure at least NODE_WIDTH
            return Math.max(width, NODE_WIDTH);
        };

        if (rootNodeId) calculateWidth(rootNodeId);

        // Recursive function to assign positions
        const calculatedNodes: Node[] = [];
        const calculatedEdges: Edge[] = [];

        const assignPositions = (id: string, x: number, y: number) => {
            const convo = conversationMap.get(id);
            if (!convo) return;

            // Add Node
            calculatedNodes.push({
                id: convo.id,
                type: 'custom',
                position: { x, y },
                data: {
                    label: convo.title,
                    active: convo.id === activeConversationId
                },
            });

            // Add Edge from parent
            if (convo.parentId) {
                calculatedEdges.push({
                    id: `${convo.parentId}-${convo.id}`,
                    source: convo.parentId,
                    target: convo.id,
                    type: 'smoothstep',
                    animated: true,
                });
            }

            // Process Children
            const children = childrenMap.get(id) || [];
            if (children.length > 0) {
                const totalWidth = subtreeWidths.get(id) || 0;
                let startX = x - totalWidth / 2;

                children.forEach(childId => {
                    const childWidth = subtreeWidths.get(childId) || NODE_WIDTH;
                    const childX = startX + childWidth / 2;
                    assignPositions(childId, childX, y + LEVEL_HEIGHT);
                    startX += childWidth;
                });
            }
        };

        if (rootNodeId) assignPositions(rootNodeId, 0, 0);

        return { nodes: calculatedNodes, edges: calculatedEdges };
    }, [conversations, activeConversationId, getRootId]);

    const onNodeClick = (_: any, node: Node) => {
        setActiveConversation(node.id);
    };

    return (
        <div className="h-full w-full bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};
