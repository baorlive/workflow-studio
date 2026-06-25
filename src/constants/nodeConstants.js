import WebhookNodeIcon from '../assets/icons/webhook-node.svg';
import ActionNodeIcon from '../assets/icons/action-node.svg';
import CommunityIcon from '../assets/icons/community-node.svg';
import CommunityIconActive from '../assets/icons/community-node-active.svg';
import TriggerNodeIcon from '../assets/icons/trigger-node.svg';
import WebhookNodeActiveIcon from '../assets/icons/webhook-node.-white.svg';
import TriggerNodeActiveIcon from '../assets/icons/trigger-node-white.svg';

export const NODE = {
    TRIGGER: 'TRIGGER',
    WEBHOOK: 'WEBHOOK',
    ACTION: 'ACTION',
    COMMUNITY: 'COMMUNITY'
};

export const WORKFLOW_PERMISSION = {
    READ: 'read',
    WRITE: 'write',
    COMMENT: 'comment',
    OWNER: 'owner',
    EXECUTOR: 'executor',
    DEPLOYER: 'deployer'
};

export const NODE_ICON_LIST = [
    {
        icon: TriggerNodeIcon,
        activeIcon: TriggerNodeActiveIcon,
        node: NODE.TRIGGER,
        nodeName: 'Trigger Nodes'
    },
    {
        icon: WebhookNodeIcon,
        activeIcon: WebhookNodeActiveIcon,
        node: NODE.WEBHOOK,
        nodeName: 'Webhook Nodes'
    },
    {
        icon: ActionNodeIcon,
        activeIcon: ActionNodeIcon,
        node: NODE.ACTION,
        nodeName: 'Action Nodes'
    },
    {
        icon: CommunityIcon,
        activeIcon: CommunityIconActive,
        node: NODE.COMMUNITY,
        nodeName: 'Community Nodes'
    }
];
