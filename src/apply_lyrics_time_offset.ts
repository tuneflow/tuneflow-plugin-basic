import type { ParamDescriptor, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class ApplyLyricsTimeOffset extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'apply-lyrics-time-offset';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      offsetSeconds: {
        displayName: {
          zh: '调整量(秒)',
          en: 'Offset Amount (seconds)',
        },
        defaultValue: 0,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const offsetSeconds = this.getParam<number>(params, 'offsetSeconds');
    const lyrics = song.getLyrics();
    const lines = lyrics.getLines();
    if (offsetSeconds === 0) {
      return;
    }
    for (const line of lines) {
      const newEndTick = song.secondsToTick(song.tickToSeconds(line.getEndTick()) + offsetSeconds);
      const newStartTick = song.secondsToTick(
        song.tickToSeconds(line.getStartTick()) + offsetSeconds,
      );
      line.moveTo(newStartTick, newEndTick);
    }
  }
}
