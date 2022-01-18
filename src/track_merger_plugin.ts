import type {
  LabelText,
  ParamDescriptor,
  Song,
  SongAccess,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackMerger extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-merger';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '轨道合并',
      en: 'Track Merger',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '将选中的两个轨道合并成一轨',
      en: 'Merge the two selected tracks into one.',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackId1: {
        displayName: {
          zh: '轨道1',
          en: 'Track 1',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
      },
      trackId2: {
        displayName: {
          zh: '轨道2',
          en: 'Track 2',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
      },
    };
  }

  songAccess(): SongAccess {
    return {
      createTrack: true,
      removeTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId1 = this.getParam<string>(params, 'trackId1');
    const trackId2 = this.getParam<string>(params, 'trackId2');
    const track1 = song.getTrackById(trackId1);
    if (!track1) {
      throw new Error('track not ready');
    }
    const track2 = song.getTrackById(trackId2);
    if (!track2) {
      throw new Error('track not ready');
    }
    const track1Index = song.getTrackIndex(trackId1);
    const track2Index = song.getTrackIndex(trackId2);

    const mergeTrack = song.createTrack({
      index: Math.min(track1Index, track2Index),
    });
    mergeTrack.setInstrument({
      program: track1.getInstrument().getProgram(),
      isDrum: track1.getInstrument().getIsDrum(),
    });
    for (const note of track1.getNotes()) {
      const noteParam = {
        pitch: note.getPitch(),
        velocity: note.getVelocity(),
        startTick: note.getStartTick(),
        endTick: note.getEndTick(),
      };
      mergeTrack.createNote(noteParam);
    }
    for (const note of track2.getNotes()) {
      const noteParam = {
        pitch: note.getPitch(),
        velocity: note.getVelocity(),
        startTick: note.getStartTick(),
        endTick: note.getEndTick(),
      };
      mergeTrack.createNote(noteParam);
    }
    song.removeTrack(trackId1);
    song.removeTrack(trackId2);
  }
}
