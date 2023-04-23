import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';
import _ from 'underscore';

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
          type: WidgetType.None,
        },
        hidden: true,
        optional: true,
      },
      startTick: {
        displayName: {
          zh: '起始位置',
          en: 'Start Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
      endTick: {
        displayName: {
          zh: '结束位置',
          en: 'Start Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const words = this.getParam<string>(params, 'words');
    const startTick = this.getParam<number>(params, 'startTick');
    let endTick = this.getParam<number>(params, 'endTick');
    if (!_.isNumber(endTick)) {
      endTick = startTick + song.getResolution() * 4 * 2;
    }
    if (words) {
      await song.getLyrics().createLineFromString({
        input: words,
        startTick,
        endTick,
      });
    } else {
      const line = song.getLyrics().createLine({
        startTick,
      });
      line.getWords()[0].setEndTick(endTick);
    }
  }
}
