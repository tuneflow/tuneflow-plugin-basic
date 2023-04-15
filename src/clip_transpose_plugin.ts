import { ClipType, InjectSource, TuneflowPlugin, WidgetType, Note, Clip } from 'tuneflow';
import type { ParamDescriptor, SelectWidgetConfig, Song } from 'tuneflow';

export class ClipTranspose extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-transpose';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      clipInfos: {
        displayName: {
          zh: '待转调片段',
          en: 'Clips to transpose',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        injectFrom: InjectSource.SelectedClipInfos,
      },
      pitchOffset: {
        displayName: {
          zh: '调整半音数',
          en: 'Shift Pitches By',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Select,
          config: {
            options: [
              {
                label: {
                  zh: '+12 (升八度)',
                  en: '+12 (One Octave Up)',
                },
                value: 12,
              },
              {
                label: {
                  zh: '-12 (降八度)',
                  en: '-12 (One Octave Down)',
                },
                value: -12,
              },
              {
                label: {
                  zh: '+1 (升半音)',
                  en: '+1 (One Semiton Up)',
                },
                value: 1,
              },
              {
                label: {
                  zh: '-1 (降半音)',
                  en: '-1 (One Semitone Down)',
                },
                value: -1,
              },
            ],
          } as SelectWidgetConfig,
        },
        adjustable: false,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const clipInfos = this.getParam<any[]>(params, 'clipInfos');
    const pitchOffset = this.getParam<number>(params, 'pitchOffset');
    for (const clipInfo of clipInfos) {
      const { trackId, clipId } = clipInfo;
      const track = song.getTrackById(trackId);
      if (!track) {
        throw new Error('Track not found.');
      }
      const clip = track.getClipById(clipId);
      if (!clip) {
        throw new Error('Clip not found.');
      }
      if (clip.getType() === ClipType.MIDI_CLIP) {
        for (let i = clip.getRawNotes().length - 1; i >= 0; i -= 1) {
          const note = clip.getRawNotes()[i];
          const newPitch = note.getPitch() + pitchOffset;
          if (!Note.isValidPitch(newPitch)) {
            clip.deleteNoteAt(i);
            continue;
          }
          note.setPitch(newPitch);
        }
      } else if (clip.getType() === ClipType.AUDIO_CLIP) {
        const currentPitchOffset = clip.getAudioPitchOffset();
        clip.setAudioPitchOffset(
          Math.min(
            Clip.MAX_AUDIO_PITCH_OFFSET,
            Math.max(Clip.MIN_AUDIO_PITCH_OFFSET, currentPitchOffset + pitchOffset),
          ),
        );
      }
    }
  }
}
