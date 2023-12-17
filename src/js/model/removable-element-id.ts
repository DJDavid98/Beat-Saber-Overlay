// Keep in sync with README.md "Customizable UI" section
export enum RemovableElementId {
    APP = 'app',
    BACKGROUND = 'background-root',
    BEAT_SABER_ACCURACY_GRAPH = 'beat-saber-accuracy-graph-root',
    BEAT_SABER_ADDITIONAL_DATA = 'beat-saber-additional-data-root',
    BEAT_SABER_MODIFIERS = 'beat-saber-modifiers-root',
    BEAT_SABER = 'beat-saber-root',
    BOUNCY = 'bouncy-root',
    CHAT = 'chat-root',
    TTS_HEALTH = 'tts-health-root',
    CONNECTION = 'connection-root',
    CHANNEL_BUG = 'credits-root',
    HEART_RATE = 'heart-rate-root',
}

export interface RemovableElementMetadata {
    name: string;
    description?: string;
    children?: RemovableElementId[];
    disabled?: boolean;
}

export type RemovableElementsTree = Record<RemovableElementId, RemovableElementMetadata>;

/**
 * Maps element IDs to the IDs of the elements nested under them.
 *
 * `null` indicates the element has no nested elements
 */
export const elementsTree: RemovableElementsTree = {
    [RemovableElementId.APP]: {
        name: 'Technical Root Node',
        children: [
            RemovableElementId.BACKGROUND,
            RemovableElementId.BEAT_SABER,
            RemovableElementId.CHAT,
            RemovableElementId.HEART_RATE,
            RemovableElementId.CHANNEL_BUG,
        ],
        disabled: true,
    },
    [RemovableElementId.BACKGROUND]: {
        name: 'Background',
        description: 'The checkered background (automatically hidden inside OBS Browser Sources)',
    },
    [RemovableElementId.BEAT_SABER]: {
        name: 'Beat Saber',
        children: [
            RemovableElementId.CONNECTION,
            RemovableElementId.BEAT_SABER_ADDITIONAL_DATA
        ],
    },
    [RemovableElementId.CONNECTION]: {
        name: 'Connection Status',
    },
    [RemovableElementId.BEAT_SABER_ADDITIONAL_DATA]: {
        name: 'Additional Data',
        description: 'Shows additional data below the song information',
        children: [
            RemovableElementId.BEAT_SABER_ACCURACY_GRAPH,
            RemovableElementId.BEAT_SABER_MODIFIERS
        ],
    },
    [RemovableElementId.BEAT_SABER_ACCURACY_GRAPH]: {
        name: 'Multifunctional Graph',
        description: 'Graph showing the current energy level, accuracy percentage and misses over time',
    },
    [RemovableElementId.BEAT_SABER_MODIFIERS]: {
        name: 'Modifiers List',
        description: 'List of currently selected modifiers (needs at least one selected to be displayed)',
    },
    [RemovableElementId.CHAT]: {
        name: 'Chat Overlay',
        description: 'Shows incoming chat messages based on the provided configuration',
        children: [
            RemovableElementId.TTS_HEALTH
        ],
    },
    [RemovableElementId.HEART_RATE]: {
        name: 'Heart Rate',
        description: 'Live heart rate data tracked via external services',
        children: [
            RemovableElementId.BOUNCY
        ],
    },
    [RemovableElementId.BOUNCY]: {
        name: 'Bouncy',
        description: 'An animated graphic that changes speed based on the current heart rate',
    },
    [RemovableElementId.CHANNEL_BUG]: {
        name: 'Channel Bug',
        description: 'Also known as "digital on-screen graphic", a dynamically changing element that cycles between various states'
    },
    [RemovableElementId.TTS_HEALTH]: {
        name: 'TTS Health Bar',
        description: 'Shows the percentage of available TTS characters in the current subscription tier'
    },
};

export const isRemovableElementId = (value?: string): value is RemovableElementId => value !== undefined && value in elementsTree;
