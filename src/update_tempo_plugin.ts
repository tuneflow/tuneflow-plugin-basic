import { TempoEvent, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { LabelText, ParamDescriptor, Song } from 'tuneflow';

export class UpdateTempo extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-tempo';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '更改节奏',
      en: 'Change Tempo',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      newTempo: {
        displayName: {
          zh: '节奏 (BPM)',
          en: 'Tempo (BPM)',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
      },
      newTempoTick: {
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
      overwriteAll: {
        displayName: {
          zh: '覆盖所有节奏',
          en: 'Overwrite all tempos',
        },
        defaultValue: false,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const overwriteAll = this.getParam<boolean>(params, 'overwriteAll');
    const bpm = this.getParam<number>(params, 'newTempo');
    const tick = this.getParam<number>(params, 'newTempoTick');
    if (overwriteAll) {
      song.overwriteTempoChanges([
        new TempoEvent({
          ticks: tick,
          bpm,
          time: 0,
        }),
      ]);
    } else {
      song.updateTempoAtTick(tick, bpm);
    }
  }
}
