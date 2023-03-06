import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class RemoveTempo extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-remove';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      tempoIndex: {
        displayName: {
          zh: '曲速序号',
          en: 'Tempo Index',
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
    song.removeTempoChange(tempoIndex);
  }
}
