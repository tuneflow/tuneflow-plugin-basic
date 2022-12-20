import { TrackSend, Track, TuneflowPlugin, WidgetType, Song } from 'tuneflow';
import type {
  InputNumberWidgetConfig,
  TrackSelectorWidgetConfig,
  LabelText,
  ParamDescriptor,
  SongAccess,
} from 'tuneflow';

export class UpdateTrackSend extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-track-send';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '更新轨道发送',
      en: 'Update Track Send',
    };
  }

  static allowReset(): boolean {
    return false;
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
      outputBusRank: {
        displayName: {
          zh: '输出母线',
          en: 'Output Bus',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
          config: {
            minValue: 1,
            maxValue: Song.NUM_BUSES,
            step: 1,
          } as InputNumberWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
      gainLevel: {
        displayName: {
          zh: '发送增益',
          en: 'Gain Level',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        optional: true,
      },
      position: {
        displayName: {
          zh: '发送位置',
          en: 'Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        optional: true,
      },
      muted: {
        displayName: {
          zh: '是否停用',
          en: 'Muted',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
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
    const outputBusRank = this.getParam<number>(params, 'outputBusRank');
    const gainLevel = this.getParam<number>(params, 'gainLevel');
    const position = this.getParam<number>(params, 'position');
    const muted = this.getParam<boolean>(params, 'muted');
    let send = track.getSendAt(sendIndex);
    if (!send) {
      send = new TrackSend({
        outputBusRank,
        gainLevel,
        position,
        muted,
      });
      track.setSendAt(sendIndex, send);
    } else {
      send.setOutputBusRank(outputBusRank);
      send.setGainLevel(gainLevel);
      send.setPosition(position);
      send.setMuted(muted);
    }
  }
}
