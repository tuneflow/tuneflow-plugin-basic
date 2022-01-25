import type {
  InputNumberWidgetConfig,
  LabelText,
  ParamDescriptor,
  Song,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackMove extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-move';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '移动轨道',
      en: 'Move Track',
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
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
        adjustable: false,
        hidden: true,
      },
      offsetTick: {
        displayName: {
          zh: '移动量',
          en: 'Track End',
        },
        defaultValue: 0,
        widget: {
          type: WidgetType.InputNumber,
          config: {
            minValue: Number.MIN_SAFE_INTEGER,
            maxValue: Number.MIN_SAFE_INTEGER,
          } as InputNumberWidgetConfig,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    const offsetTick = this.getParam<number>(params, 'offsetTick');
    if (offsetTick !== undefined && offsetTick !== null && typeof offsetTick === 'number') {
      track.moveTrack(offsetTick);
    }
  }
}
