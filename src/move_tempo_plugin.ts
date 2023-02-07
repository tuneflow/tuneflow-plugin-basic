import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class MoveTempo extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-move';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      tempoIndex: {
        displayName: {
          zh: '节奏序号',
          en: 'Tempo Index',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      moveToTick: {
        displayName: {
          zh: '移动至',
          en: 'Move to',
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
    const tempoIndex = this.getParam<number>(params, 'tempoIndex');
    const moveToTick = this.getParam<number>(params, 'moveToTick');
    song.moveTempo(tempoIndex, moveToTick);
  }
}
