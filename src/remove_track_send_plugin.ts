import { Track, TuneflowPlugin, WidgetType } from 'tuneflow';
import type {
  PluginInfo,
  InputNumberWidgetConfig,
  TrackSelectorWidgetConfig,
  LabelText,
  ParamDescriptor,
  SongAccess,
  Song,
} from 'tuneflow';

export class RemoveTrackSend extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'remove-track-send';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '删除轨道发送',
      en: 'Remove Track Send',
    };
  }

  static allowReset(): boolean {
    return false;
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
      sendIndex: {
        displayName: {
          zh: '母线',
          en: 'Bus',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
          config: {
            minValue: 0,
            maxValue: Track.MAX_NUM_SENDS - 1,
            step: 1,
          } as InputNumberWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
    };
  }

  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    const sendIndex = this.getParam<number>(params, 'sendIndex');
    track.removeSendAt(sendIndex);
  }
}
