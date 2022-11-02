import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { LabelText, ParamDescriptor, Song } from 'tuneflow';

export class RemoveTimeSignature extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'time-signature-remove';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '删除拍号',
      en: 'Remove Time Signature',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      timeSignatureIndex: {
        displayName: {
          zh: '拍号序号',
          en: 'Time Signature Index',
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
    const timeSignatureIndex = this.getParam<number>(params, 'timeSignatureIndex');
    if (song.getTimeSignatures().length <= 1) {
      throw new Error('Song has to have at least one time signature change.');
    }
    if (timeSignatureIndex === 0) {
      throw new Error('Cannot remove the first time signature.');
    }
    song.getTimeSignatures().splice(timeSignatureIndex, /* deleteCount= */ 1);
  }
}
