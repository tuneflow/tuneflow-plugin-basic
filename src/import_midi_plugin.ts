import { Song, InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import type {
  FileSelectorWidgetConfig,
  LabelText,
  ParamDescriptor,
  SelectWidgetConfig,
  SongAccess,
} from 'tuneflow';

export class ImportMIDI extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'import-midi';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '导入MIDI',
      en: 'Import MIDI',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '导入本地MIDI文件',
      en: 'Import a local MIDI file',
    };
  }

  static allowReset(): boolean {
    return false;
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
          zh: '覆盖现有 Tempo 和 Time Signature',
          en: 'Overwrite existing tempos and time signatures.',
        },
        defaultValue: true,
        widget: {
          type: WidgetType.Switch,
        },
      },
    };
  }

  public allowManualApplyAdjust(): boolean {
    return true;
  }
  songAccess(): SongAccess {
    return {
      createTrack: true,
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
