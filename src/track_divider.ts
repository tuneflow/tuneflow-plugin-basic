import type {
  LabelText,
  ParamDescriptor,
  PitchWidgetConfig,
  Song,
  SongAccess,
  Track,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackDivider extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-divider';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '高低声部分离',
      en: 'Treble Bass Separator',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      track: {
        displayName: {
          zh: '轨道',
          en: 'Track',
        },
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            multiSelection: false,
          } as TrackSelectorWidgetConfig,
        },
      },
      pitch: {
        displayName: {
          zh: '分割音高',
          en: 'Dividing Pitch',
        },
        defaultValue: 60,
        widget: {
          type: WidgetType.Pitch,
          config: {} as PitchWidgetConfig,
        },
        description: {
          zh: '将本轨道分成高低声部两轨：从此音高以上（包含）划分为高音 (Treble) 轨，其余音符划分为低音 (Bass) 轨。',
          en: 'Track will be divided into Treble and Bass: Treble contains notes higher(including) this pitch, and Bass contains notes lower than this pitch.',
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(
    song: Song,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputs: { [inputName: string]: any },
    params: { [paramName: string]: any },
  ): Promise<void | { [artifactId: string]: any }> {
    const trackId = this.getParam<string>(params, 'track');
    let track: Track | undefined;
    let trackIndex = -1;
    for (trackIndex = 0; trackIndex < song.getTracks().length; trackIndex += 1) {
      if (song.getTracks()[trackIndex].getId() === trackId) {
        track = song.getTracks()[trackIndex];
        break;
      }
    }
    const pitch = this.getParam<number>(params, 'pitch');
    if (!track) {
      return;
    }
    const bassTrack = song.createTrack({
      index: trackIndex,
    });
    const trebleTrack = song.createTrack({
      index: trackIndex,
    });
    for (const note of track.getNotes()) {
      const noteParam = {
        pitch: note.getPitch(),
        velocity: note.getVelocity(),
        startTick: note.getStartTick(),
        endTick: note.getEndTick(),
      };
      if (note.getPitch() >= pitch) {
        trebleTrack.createNote(noteParam);
      } else {
        bassTrack.createNote(noteParam);
      }
    }
    song.removeTrack(trackId);
  }
}
