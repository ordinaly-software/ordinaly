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

  public emit(eventName: string, data?: unknown) {
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
