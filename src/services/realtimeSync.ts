/**
 * realtimeSync.ts — Centralized Real-time Sync Engine for Vahlay Digital CRM
 *
 * Provides live bi-directional data synchronization between Support Team,
 * Sales Agents, Managers, and Admins across all screens and devices.
 *
 * Uses Firebase Firestore onSnapshot with fallback cross-tab BroadcastChannel.
 */

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Lead, Proposal, EscalationTicket, Announcement, DepartmentTask } from '../types';

export type RealtimeSyncEventType =
  | 'LEAD_UPDATED'
  | 'LEAD_CREATED'
  | 'LEADS_DISTRIBUTED'
  | 'PROPOSAL_UPDATED'
  | 'PROPOSAL_DISPATCHED'
  | 'ESCALATION_UPDATED'
  | 'ANNOUNCEMENT_ADDED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED';

export interface RealtimeSyncEvent {
  type: RealtimeSyncEventType;
  payload?: any;
  timestamp: string;
  sourceRole?: string;
  message?: string;
}

// ─── Cross-Tab Broadcast Channel ──────────────────────────────────────────────
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('vahlay_crm_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment:', e);
}

const localListeners = new Set<(event: RealtimeSyncEvent) => void>();

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data && typeof event.data === 'object') {
      localListeners.forEach((listener) => listener(event.data));
    }
  };
}

/** Emit a real-time event to both local listeners and all other browser tabs */
export function broadcastRealtimeEvent(event: RealtimeSyncEvent) {
  localListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.warn('Local realtime listener error:', err);
    }
  });

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(event);
    } catch (err) {
      console.warn('BroadcastChannel postMessage error:', err);
    }
  }

  // Also dispatch window custom event for UI toast notifications
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vahlay:realtime_update', { detail: event }));
  }
}

/** Subscribe to realtime events */
export function onRealtimeEvent(callback: (event: RealtimeSyncEvent) => void): () => void {
  localListeners.add(callback);
  return () => {
    localListeners.delete(callback);
  };
}

// ─── Firestore Document Parser ────────────────────────────────────────────────
function parseDoc<T>(docSnap: DocumentData & { id: string }): T {
  const data = docSnap.data?.() ?? docSnap;
  const parsed: Record<string, unknown> = { ...data, id: docSnap.id };
  for (const [k, v] of Object.entries(parsed)) {
    if (v instanceof Timestamp) {
      parsed[k] = v.toDate().toISOString();
    }
  }
  return parsed as T;
}

// ─── Real-time Firestore Subscriptions ────────────────────────────────────────

/**
 * Subscribe to real-time updates for Leads.
 * Triggered automatically when Support updates status, notes, or assignment.
 */
export function subscribeToLeadsRealtime(
  callback: (leads: Lead[]) => void,
  agentId?: string
): () => void {
  try {
    const leadsRef = collection(db, 'leads');
    const q = leadsRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leads: Lead[] = snapshot.docs.map((d) =>
          parseDoc<Lead>({ id: d.id, ...d.data() })
        );
        callback(leads);
      },
      (error) => {
        console.warn('Realtime leads subscription error (fallback active):', error);
      }
    );

    // Also listen to cross-tab broadcast events to trigger immediate local refresh
    const unsubBroadcast = onRealtimeEvent((event) => {
      if (event.type === 'LEAD_UPDATED' || event.type === 'LEADS_DISTRIBUTED' || event.type === 'LEAD_CREATED') {
        if (event.payload && event.payload.id) {
          // Individual lead update
          callback([event.payload]);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubBroadcast();
    };
  } catch (err) {
    console.warn('Failed to start leads realtime subscription:', err);
    return () => {};
  }
}

/**
 * Subscribe to real-time updates for Quotations / Proposals.
 * Triggered automatically when Support dispatches a quotation or changes status.
 */
export function subscribeToProposalsRealtime(
  callback: (proposals: Proposal[]) => void,
  agentId?: string
): () => void {
  try {
    const propRef = collection(db, 'proposals');
    const q = agentId ? query(propRef, where('agentId', '==', agentId)) : propRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rawProposals: Proposal[] = snapshot.docs.map((d) =>
          parseDoc<Proposal>({ id: d.id, ...d.data() })
        );
        const seen = new Set<string>();
        const proposals: Proposal[] = [];
        for (const p of rawProposals) {
          const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
          if (!seen.has(key)) {
            seen.add(key);
            proposals.push(p);
          }
        }
        callback(proposals);
      },
      (error) => {
        console.warn('Realtime proposals subscription error:', error);
      }
    );

    const unsubBroadcast = onRealtimeEvent((event) => {
      if (event.type === 'PROPOSAL_UPDATED' || event.type === 'PROPOSAL_DISPATCHED') {
        if (event.payload && event.payload.id) {
          callback([event.payload]);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubBroadcast();
    };
  } catch (err) {
    console.warn('Failed to start proposals realtime subscription:', err);
    return () => {};
  }
}

/**
 * Subscribe to real-time updates for Technical Escalation Tickets.
 */
export function subscribeToEscalationsRealtime(
  callback: (tickets: EscalationTicket[]) => void
): () => void {
  try {
    const escRef = collection(db, 'escalations');
    const unsubscribe = onSnapshot(
      escRef,
      (snapshot) => {
        const tickets: EscalationTicket[] = snapshot.docs.map((d) =>
          parseDoc<EscalationTicket>({ id: d.id, ...d.data() })
        );
        callback(tickets);
      },
      (error) => {
        console.warn('Realtime escalations subscription error:', error);
      }
    );

    const unsubBroadcast = onRealtimeEvent((event) => {
      if (event.type === 'ESCALATION_UPDATED') {
        if (event.payload && event.payload.id) {
          callback([event.payload]);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubBroadcast();
    };
  } catch (err) {
    console.warn('Failed to start escalations realtime subscription:', err);
    return () => {};
  }
}

/**
 * Subscribe to real-time updates for Announcements & Notifications.
 */
export function subscribeToAnnouncementsRealtime(
  callback: (announcements: Announcement[]) => void
): () => void {
  try {
    const annRef = collection(db, 'announcements');
    const unsubscribe = onSnapshot(
      annRef,
      (snapshot) => {
        const announcements: Announcement[] = snapshot.docs.map((d) =>
          parseDoc<Announcement>({ id: d.id, ...d.data() })
        );
        callback(announcements);
      },
      (error) => {
        console.warn('Realtime announcements subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  } catch (err) {
    console.warn('Failed to start announcements realtime subscription:', err);
    return () => {};
  }
}

export function subscribeToTasksRealtime(callback: (tasks: DepartmentTask[]) => void): () => void {
  try {
    const unsubscribe = onSnapshot(
      query(collection(db, 'departmentTasks'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        callback(snapshot.docs.map((d) => parseDoc<DepartmentTask>({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.warn('Realtime department tasks subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to start department tasks realtime subscription:', err);
    return () => {};
  }
}
