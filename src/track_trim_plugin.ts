import type {
  InputNumberWidgetConfig,
  LabelText,
  ParamDescriptor,
  Song,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackTrim extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-trim';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '剪裁轨道',
      en: 'Trim Track',
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
      trackStartTick: {
        displayName: {
          zh: '轨道起始',
          en: 'Track Start',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
          config: {
            minValue: 0,
            maxValue: Number.MIN_SAFE_INTEGER,
          } as InputNumberWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
      trackEndTick: {
        displayName: {
          zh: '轨道结束',
          en: 'Track End',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
          config: {
            minValue: 0,
            maxValue: Number.MIN_SAFE_INTEGER,
          } as InputNumberWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    const trackStartTick = this.getParam<number>(params, 'trackStartTick');
    if (
      trackStartTick !== undefined &&
      trackStartTick !== null &&
      typeof trackStartTick === 'number'
    ) {
      track.adjustTrackLeft(trackStartTick);
    }
    const trackEndTick = this.getParam<number>(params, 'trackEndTick');
    if (trackEndTick !== undefined && trackEndTick !== null && typeof trackEndTick === 'number') {
      track.adjustTrackRight(trackEndTick);
    }
  }
}
