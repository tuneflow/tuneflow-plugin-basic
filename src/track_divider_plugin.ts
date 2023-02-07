import { TrackType, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song, TrackPitchSelectorWidgetConfig } from 'tuneflow';

export class TrackDivider extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-divider';
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
            trackSelectorConfig: {
              allowedTrackTypes: [TrackType.MIDI_TRACK],
            },
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

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackPitch = this.getParam<any>(params, 'trackPitch');
    const trackId = trackPitch.track as string;
    const pitch = trackPitch.pitch as number;
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track is not ready');
    }
    const bassTrack = song.cloneTrack(track);
    if (!bassTrack) {
      throw new Error('Cannot clone the selected track');
    }
    for (const clip of bassTrack.getClips()) {
      const rawNotes = clip.getRawNotes();
      for (let i = rawNotes.length - 1; i >= 0; i -= 1) {
        if (rawNotes[i].getPitch() >= pitch) {
          clip.deleteNoteAt(i);
        }
      }
    }
    const trebleTrack = song.cloneTrack(track);
    if (!trebleTrack) {
      throw new Error('Cannot clone the selected track');
    }
    for (const clip of trebleTrack.getClips()) {
      const rawNotes = clip.getRawNotes();
      for (let i = rawNotes.length - 1; i >= 0; i -= 1) {
        if (rawNotes[i].getPitch() < pitch) {
          clip.deleteNoteAt(i);
        }
      }
    }
    track.deleteFromParent();
  }
}
