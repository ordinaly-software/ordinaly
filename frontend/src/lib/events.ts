// Event system for cross-component communication
export class AppEvents {
  private static instance: AppEvents;
  private eventTarget: EventTarget;

  private constructor() {
    this.eventTarget = new EventTarget();
  }

  public static getInstance(): AppEvents {
    if (!AppEvents.instance) {
      AppEvents.instance = new AppEvents();
    }
    return AppEvents.instance;
  }

  public emit(eventName: string, data?: any) {
    const event = new CustomEvent(eventName, { detail: data });
    this.eventTarget.dispatchEvent(event);
  }

  public on(eventName: string, callback: (event: CustomEvent) => void) {
    this.eventTarget.addEventListener(eventName, callback as EventListener);
  }

  public off(eventName: string, callback: (event: CustomEvent) => void) {
    this.eventTarget.removeEventListener(eventName, callback as EventListener);
  }
}

// Service-specific events
export const SERVICES_EVENTS = {
  CREATED: 'services:created',
  UPDATED: 'services:updated',
  DELETED: 'services:deleted',
  REFRESH: 'services:refresh'
} as const;

// Convenience functions for services events
export const servicesEvents = {
  emitCreated: (service: any) => AppEvents.getInstance().emit(SERVICES_EVENTS.CREATED, service),
  emitUpdated: (service: any) => AppEvents.getInstance().emit(SERVICES_EVENTS.UPDATED, service),
  emitDeleted: (serviceId: number) => AppEvents.getInstance().emit(SERVICES_EVENTS.DELETED, serviceId),
  emitRefresh: () => AppEvents.getInstance().emit(SERVICES_EVENTS.REFRESH),
  
  onCreated: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().on(SERVICES_EVENTS.CREATED, callback),
  onUpdated: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().on(SERVICES_EVENTS.UPDATED, callback),
  onDeleted: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().on(SERVICES_EVENTS.DELETED, callback),
  onRefresh: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().on(SERVICES_EVENTS.REFRESH, callback),
  
  offCreated: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().off(SERVICES_EVENTS.CREATED, callback),
  offUpdated: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().off(SERVICES_EVENTS.UPDATED, callback),
  offDeleted: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().off(SERVICES_EVENTS.DELETED, callback),
  offRefresh: (callback: (event: CustomEvent) => void) => AppEvents.getInstance().off(SERVICES_EVENTS.REFRESH, callback),
};
