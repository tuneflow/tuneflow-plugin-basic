import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class UpdateLyrics extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-lyrics';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      lyricLineWords: {
        displayName: {
          zh: '歌词',
          en: 'Lyrics',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TextArea,
        },
        hidden: true,
      },
      lyricLineTick: {
        displayName: {
          zh: '位置',
          en: 'Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const words = this.getParam<string>(params, 'lyricLineWords');
    const tick = this.getParam<number>(params, 'lyricLineTick');
    const index = song.getLyricLineIndexAtTick(tick);
    song.updateLyricLineAtIndex(index, words);
  }
}
