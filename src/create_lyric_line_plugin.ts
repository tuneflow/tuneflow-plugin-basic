import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class CreateLyricLine extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'create-lyric-line';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      words: {
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
      startTick: {
        displayName: {
          zh: '起始位置',
          en: 'Start Position',
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
    const words = this.getParam<string>(params, 'words');
    const startTick = this.getParam<number>(params, 'startTick');
    const endTick = this.getParam<number>(params, 'endTick');
    song.createLyricLineFromString({ words, startTick, endTick });
  }
}
