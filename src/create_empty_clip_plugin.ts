import { Song, InjectSource, TrackType, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { TrackSelectorWidgetConfig, ParamDescriptor, ReadAPIs } from 'tuneflow';

export class CreateEmptyClip extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'create-empty-clip';
  }

  // TODO: Support different types of clips.
  params(): { [paramName: string]: ParamDescriptor } {
    return {
      insertAtTick: {
        displayName: {
          zh: '添加位置',
          en: 'Insert Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
        injectFrom: InjectSource.TickAtPlayheadSnappedToBeat,
      },
      trackId: {
        displayName: {
          zh: '添加到轨道',
          en: 'Insert to Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
        adjustable: false,
      },
      audioFilePath: {
        displayName: {
          zh: '音频文件',
          en: 'Audio File',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }, readApis: ReadAPIs): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const insertAtTick = this.getParam<number>(params, 'insertAtTick');
    const audioFilePath = this.getParam<string | undefined>(params, 'audioFilePath');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    if (track.getType() === TrackType.AUDIO_TRACK) {
      if (!audioFilePath) {
        throw new Error('Audio file path must be provided when creating an audio clip.');
      }
      const audioBuffer = await readApis.readAudioBuffer(audioFilePath);
      if (!audioBuffer) {
        throw new Error(`Error reading audio file`);
      }
      track.createAudioClip({
        clipStartTick: insertAtTick,
        audioClipData: {
          audioFilePath,
          startTick: insertAtTick,
          duration: audioBuffer.duration,
        },
      });
    } else if (track.getType() === TrackType.MIDI_TRACK) {
      const barBeats = song.getBarBeats(song.getLastTick());
      const leadingBar = Song.getLeadingBar(insertAtTick, barBeats);
      if (!leadingBar) {
        throw new Error('No leading bar was found.');
      }
      track.createMIDIClip({
        clipStartTick: insertAtTick,
        clipEndTick:
          insertAtTick + 4 * (leadingBar.ticksPerBeat as number) * (leadingBar.numerator as number),
      });
    }
  }
}
