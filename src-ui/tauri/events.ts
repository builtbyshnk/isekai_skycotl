import { invoke } from "@tauri-apps/api/core";
import {
  generateEventInstances as generateEventInstancesFallback,
  getOverlayEvents as getOverlayEventsFallback,
} from "@/domain/events";
import type { AppSettings, EventInstance } from "@/domain/types";
import { isTauriRuntime } from "@/tauri/overlay";

interface EventCommandSettings {
  events: Record<string, boolean>;
  timeFormat: AppSettings["display"]["timeFormat"];
  localTimeZone: string;
  overlayMaxEvents: number;
}

export async function generateEventInstances(
  nowDate: Date,
  settings: AppSettings,
): Promise<EventInstance[]> {
  if (!isTauriRuntime()) {
    return generateEventInstancesFallback(nowDate, settings);
  }

  return invoke<EventInstance[]>("generate_event_instances", {
    nowMs: nowDate.getTime(),
    settings: toCommandSettings(settings),
  });
}

export async function getOverlayEvents(
  nowDate: Date,
  settings: AppSettings,
): Promise<EventInstance[]> {
  if (!isTauriRuntime()) {
    return getOverlayEventsFallback(nowDate, settings);
  }

  return invoke<EventInstance[]>("get_overlay_events", {
    nowMs: nowDate.getTime(),
    settings: toCommandSettings(settings),
  });
}

function toCommandSettings(settings: AppSettings): EventCommandSettings {
  return {
    events: settings.events,
    timeFormat: settings.display.timeFormat,
    localTimeZone: settings.display.localTimeZone,
    overlayMaxEvents: settings.overlay.maxEvents,
  };
}
