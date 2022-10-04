import { TimeSignatureEvent, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { LabelText, ParamDescriptor, Song } from 'tuneflow';

export class UpdateTimeSignature extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-time-signature';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '更改拍号',
      en: 'Change Time Signature',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      newNumerator: {
        displayName: {
          zh: '每小节拍数',
          en: 'Beats per Bar',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
      },
      newDenominator: {
        displayName: {
          zh: '拍',
          en: 'Beat',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
      },
      tick: {
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
          zh: '覆盖所有拍号',
          en: 'Overwrite all time signatures',
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
    const tick = this.getParam<number>(params, 'tick');
    const numerator = this.getParam<number>(params, 'newNumerator');
    const denominator = this.getParam<number>(params, 'newDenominator');
    if (overwriteAll) {
      song.overwriteTimeSignatures([
        new TimeSignatureEvent({
          ticks: 0,
          numerator,
          denominator,
        }),
      ]);
    } else {
      song.updateTimeSignatureAtTick(tick, numerator, denominator);
    }
  }
}
