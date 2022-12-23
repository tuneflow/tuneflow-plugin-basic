import type {
  LabelText,
  ParamDescriptor,
  PluginInfo,
  Song,
  SongAccess,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackAudioPluginRemover extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-audio-plugin-remover';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '删除轨道音效插件',
      en: 'Delete Track Audio Effects Plugin',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  songAccess(): SongAccess {
    return {
      removeTrack: true,
    };
  }

  static pluginInfo(): PluginInfo | null {
    return {
      minRequiredDesktopVersion: '1.8.3',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackId: {
        displayName: {
          zh: '轨道',
          en: 'Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {} as TrackSelectorWidgetConfig,
        },
        hidden: true,
      },
      pluginIndex: {
        displayName: {
          zh: '插件序号',
          en: 'Plugin Index',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const pluginIndex = this.getParam<number>(params, 'pluginIndex');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    track.removeAudioPluginAt(pluginIndex);
  }
}
