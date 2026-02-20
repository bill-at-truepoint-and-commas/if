// namespaces.js - Namespace implementations for block/week/quarter/year

import { pivot, carve, expandNow, shutdown, closeActionPanel } from './commands.js';
import { getCurrentTimeBlock } from './state-queries.js';

export function createBlockNamespace(state, onSave) {
    return {
        expandNow: () => expandNow(state.selectedDay),
        getState: () => getCurrentTimeBlock(),
        carve: (params) => carve(params),
        patch: (data) => ({ status: 'pending', data }),
        post: (data) => ({ status: 'pending', data }),
        delete: () => ({ status: 'pending' })
    };
}

export function createQuarterNamespace() {
    return {
        expandNow: () => ({ status: 'pending', message: 'Quarterly context coming soon' }),
        shutdown: () => ({ status: 'pending', message: 'Quarterly review coming soon' }),
        openDay: () => ({ status: 'pending', message: 'Quarterly planning coming soon' }),
        getQuarterState: () => ({ status: 'pending', message: 'Quarterly state query coming soon' })
    };
}

export function createYearNamespace() {
    return {
        expandNow: () => ({ status: 'pending', message: 'Yearly context coming soon' }),
        shutdown: () => ({ status: 'pending', message: 'Yearly review coming soon' }),
        openDay: () => ({ status: 'pending', message: 'Yearly planning coming soon' }),
        getYearState: () => ({ status: 'pending', message: 'Yearly state query coming soon' })
    };
}
