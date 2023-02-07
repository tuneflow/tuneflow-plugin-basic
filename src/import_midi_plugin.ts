import { Song, InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { FileSelectorWidgetConfig, ParamDescriptor, SelectWidgetConfig } from 'tuneflow';

export class ImportMIDI extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'import-midi';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      file: {
        displayName: {
          zh: '文件',
          en: 'File',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.FileSelector,
          config: {
            allowedExtensions: ['mid', 'MID', 'midi', 'MIDI'],
          } as FileSelectorWidgetConfig,
        },
      },
      insertPosition: {
        displayName: {
          zh: '插入位置',
          en: 'Insert Position',
        },
        defaultValue: 'playhead',
        widget: {
          type: WidgetType.Select,
          config: {
            options: [
              {
                label: {
                  zh: '歌曲开始',
                  en: 'Start of the song',
                },
                value: 'start',
              },
              {
                label: {
                  zh: '播放头',
                  en: 'Playhead',
                },
                value: 'playhead',
              },
            ],
          } as SelectWidgetConfig,
        },
      },
      playheadTick: {
        displayName: {
          zh: '播放头位置',
          en: 'Playhead Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        injectFrom: InjectSource.TickAtPlayheadSnappedToBeat,
      },
      overwriteTemposAndTimeSignatures: {
        displayName: {
          zh: '覆盖现有节奏和拍号',
          en: 'Overwrite Tempos and Time Signatures',
        },
        defaultValue: true,
        widget: {
          type: WidgetType.Switch,
        },
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const file = this.getParam<File>(params, 'file');
    const fileBuffer = await file.arrayBuffer();
    const playheadTick = this.getParam<number>(params, 'playheadTick');
    const insertPosition = this.getParam<string>(params, 'insertPosition');
    const overwriteTemposAndTimeSignatures = this.getParam<boolean>(
      params,
      'overwriteTemposAndTimeSignatures',
    );

    const insertOffset = insertPosition === 'playhead' ? playheadTick : 0;

    Song.importMIDI(song, fileBuffer, insertOffset, overwriteTemposAndTimeSignatures);
  }
}
