import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class RemoveLyricLine extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'remove-lyric-line';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      index: {
        displayName: {
          zh: '歌词序号',
          en: 'Lyric Line Index',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const index = this.getParam<number>(params, 'index');
    song.getLyrics().removeLineAtIndex(index);
  }
}
