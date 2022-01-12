import type {
  LabelText,
  ParamDescriptor,
  Song,
  SongAccess,
  Track,
  TrackPitchSelectorWidgetConfig,
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
      trackPitch: {
        displayName: {
          zh: '分割音高',
          en: 'Dividing Pitch',
        },
        defaultValue: {
          track: undefined,
          pitch: 60,
        },
        widget: {
          type: WidgetType.TrackPitchSelector,
          config: {
            trackSelectorConfig: {},
            pitchSelectorConfig: {},
          } as TrackPitchSelectorWidgetConfig,
        },
        description: {
          zh: '将选中的轨道分成高低声部两轨：从此音高以上（包含）划分为高音 (Treble) 轨，其余音符划分为低音 (Bass) 轨。',
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
    const trackPitch = this.getParam<any>(params, 'trackPitch');
    const trackId = trackPitch.track as string;
    let track: Track | undefined;
    let trackIndex = -1;
    for (trackIndex = 0; trackIndex < song.getTracks().length; trackIndex += 1) {
      if (song.getTracks()[trackIndex].getId() === trackId) {
        track = song.getTracks()[trackIndex];
        break;
      }
    }
    const pitch = trackPitch.pitch as number;
    if (!track) {
      throw new Error('Track is not ready');
    }
    const bassTrack = song.createTrack({
      index: trackIndex,
    });
    bassTrack.setInstrument({
      program: track.getInstrument().getProgram(),
      isDrum: track.getInstrument().getIsDrum(),
    });
    const trebleTrack = song.createTrack({
      index: trackIndex,
    });
    trebleTrack.setInstrument({
      program: track.getInstrument().getProgram(),
      isDrum: track.getInstrument().getIsDrum(),
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
