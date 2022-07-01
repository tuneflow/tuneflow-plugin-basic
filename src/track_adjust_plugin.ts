import type {
  InstrumentSelectorWidgetConfig,
  LabelText,
  ParamDescriptor,
  SliderWidgetConfig,
  Song,
  SwitchWidgetConfig,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';
import _ from 'underscore';

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
      en: 'Track Adjustment',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '调整选中轨道的音量，乐器等',
      en: 'Adjust the volume, instrument, etc. of the track',
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
        adjustable: false,
        hidden: true,
      },
      volume: {
        displayName: {
          zh: '音量',
          en: 'Volume',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Slider,
          config: {
            minValue: 0,
            maxValue: 100,
            step: 1,
          } as SliderWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
      pan: {
        displayName: {
          zh: '声像 (Pan)',
          en: 'Pan',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Slider,
          config: {
            minValue: -64,
            maxValue: 63,
            step: 1,
          } as SliderWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
      muted: {
        displayName: {
          zh: '静音',
          en: 'Mute',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Switch,
          config: {} as SwitchWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
      solo: {
        displayName: {
          zh: '独奏',
          en: 'Solo',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Switch,
          config: {} as SwitchWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
      instrument: {
        displayName: {
          zh: '乐器',
          en: 'Instrument',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InstrumentSelector,
          config: {} as InstrumentSelectorWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const volume = this.getParam<number | undefined>(params, 'volume');
    const pan = this.getParam<number | undefined>(params, 'pan');
    const mute = this.getParam<boolean | undefined>(params, 'mute');
    const solo = this.getParam<boolean | undefined>(params, 'solo');
    const instrument = this.getParam<any>(params, 'instrument');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    if (_.isNumber(volume)) {
      track.setVolume(volume / 100);
    }
    if (_.isNumber(pan)) {
      track.setPan(pan);
    }
    if (_.isBoolean(mute)) {
      track.setMuted(mute);
    }
    if (_.isBoolean(solo)) {
      track.setSolo(solo);
    }
    if (instrument) {
      track.setInstrument({
        program: instrument.program,
        isDrum: instrument.isDrum,
      });
    }
  }
}
