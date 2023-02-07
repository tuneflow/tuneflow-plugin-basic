import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class RemoveTimeSignature extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'time-signature-remove';
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
    song.removeTimeSignature(timeSignatureIndex);
  }
}
