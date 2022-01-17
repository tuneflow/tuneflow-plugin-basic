import type {
  InstrumentSelectorWidgetConfig,
  LabelText,
  ParamDescriptor,
  SliderWidgetConfig,
  Song,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackAdjust extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-adjust';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '调整轨道',
      en: 'Track Adjust',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '调整选中轨道的音量，乐器等',
      en: 'Adjust the volume, instrument, etc. of the track',
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
      },
      volume: {
        displayName: {
          zh: '音量',
          en: 'Volume',
        },
        defaultValue: 100,
        widget: {
          type: WidgetType.Slider,
          config: {
            minValue: 0,
            maxValue: 100,
            step: 1,
          } as SliderWidgetConfig,
        },
      },
      instrument: {
        displayName: {
          zh: '乐器',
          en: 'Instrument',
        },
        defaultValue: {
          program: 0,
          isDrum: false,
        },
        widget: {
          type: WidgetType.InstrumentSelector,
          config: {} as InstrumentSelectorWidgetConfig,
        },
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const volume = this.getParam<number>(params, 'volume');
    const instrument = this.getParam<any>(params, 'instrument');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    track.setVolume(volume / 100);
    track.setInstrument({
      program: instrument.program,
      isDrum: instrument.isDrum,
    });
  }
}
