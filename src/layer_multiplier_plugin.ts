import type {
  InstrumentSelectorWidgetConfig,
  LabelText,
  ParamDescriptor,
  Song,
  SongAccess,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class LayerMultiplier extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'layer-multiplier';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '音色叠加',
      en: 'Layer Multiplier',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '用一个不同音色的轨道来叠加选中轨道',
      en: 'Layer the selected track with a different instrument',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackId: {
        displayName: {
          zh: '原轨道',
          en: 'Track to layer',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
      },
      instrument: {
        displayName: {
          zh: '叠加乐器',
          en: 'Layering instrument',
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

  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const instrument = this.getParam<any>(params, 'instrument');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    const trackIndex = song.getTrackIndex(trackId);
    const newTrack = song.createTrack({
      index: trackIndex + 1,
    });
    newTrack.setInstrument({
      program: instrument.program,
      isDrum: instrument.isDrum,
    });
    for (const note of track.getNotes()) {
      const noteParam = {
        pitch: note.getPitch(),
        velocity: note.getVelocity(),
        startTick: note.getStartTick(),
        endTick: note.getEndTick(),
      };
      newTrack.createNote(noteParam);
    }
  }
}
