import type { Song } from 'tuneflow';
import { BasePlugin } from 'tuneflow';

export class TempoScaler extends BasePlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-scaler';
  }

  static providerDisplayName(): string {
    return 'Andantei';
  }

  static pluginDisplayName(): string {
    return 'Tempo Scaler';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(song: Song, inputs: any[]): Promise<void | { [artifactId: string]: any }> {
    for (const tempoEvent of song.getTempoChanges()) {
      song.updateTempo(tempoEvent, tempoEvent.getBpm() * 2);
    }
  }
}
