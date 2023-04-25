import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { Song, FileSelectorWidgetConfig, ParamDescriptor } from 'tuneflow';
const lrcKitLib = () => import('lrc-kit');

export class ImportLrc extends TuneflowPlugin {
  static lrcParserLibLoader: any;

  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'import-lrc';
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
            allowedExtensions: ['lrc', 'LRC'],
          } as FileSelectorWidgetConfig,
        },
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const file = this.getParam<File>(params, 'file');

    const lrcLib = await this.loadLrcLib();
    const fileContent = await file.text();
    const lyrics = lrcLib.Lrc.parse(fileContent);
    for (let i = 0; i < lyrics.lyrics.length; i += 1) {
      const lyricLineInfo = lyrics.lyrics[i];
      const startTick = song.secondsToTick(lyricLineInfo.timestamp);
      const nextLyricLineInfo = i >= lyrics.lyrics.length - 1 ? undefined : lyrics.lyrics[i + 1];
      const endTick = nextLyricLineInfo
        ? song.secondsToTick(nextLyricLineInfo.timestamp)
        : startTick + song.getResolution() * 4;
      await song.getLyrics().createLineFromString({
        input: lyricLineInfo.content,
        startTick,
        endTick,
      });
    }
  }

  private async loadLrcLib() {
    ImportLrc.lrcParserLibLoader =
      ImportLrc.lrcParserLibLoader || lrcKitLib().then(lib => (lib.default ? lib.default : lib));
    return ImportLrc.lrcParserLibLoader;
  }
}
