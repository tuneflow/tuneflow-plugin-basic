import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { LabelText, ParamDescriptor, Song } from 'tuneflow';

export class RemoveTempo extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-remove';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '删除节奏',
      en: 'Remove Tempo',
    };
  }

  static allowReset(): boolean {
    return false;
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
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const tempoIndex = this.getParam<number>(params, 'tempoIndex');
    song.removeTempoChange(tempoIndex);
  }
}
