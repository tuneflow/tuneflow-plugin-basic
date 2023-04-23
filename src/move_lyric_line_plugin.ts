import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class MoveLyricLine extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'move-lyric-line';
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
      startTick: {
        displayName: {
          zh: '开始位置',
          en: 'Start Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      endTick: {
        displayName: {
          zh: '结束位置',
          en: 'End Position',
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
    const startTick = this.getParam<number>(params, 'startTick');
    const endTick = this.getParam<number>(params, 'endTick');
    const line = song.getLyrics().getLines()[index];
    if (!line) {
      throw new Error('Line not found');
    }
    line.moveTo(startTick, endTick);
  }
}
