import { ClipType, InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ClipInfo, LabelText, ParamDescriptor, Song, SongAccess, ReadAPIs } from 'tuneflow';
import _ from 'underscore';

export class UpdateClipAudioPath extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-clip-audio-path';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '替换片段音频文件',
      en: 'Replace Clip Audio File',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      editingClipInfo: {
        displayName: {
          zh: '编辑片段',
          en: 'Editing Clip',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        injectFrom: InjectSource.EditingClipInfo,
      },
      audioFile: {
        displayName: {
          zh: '新音频文件',
          en: 'New Audio File',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.FileSelector,
        },
        adjustable: false,
      },
    };
  }

  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }, readApis: ReadAPIs): Promise<void> {
    const editingClipInfo = this.getParam<ClipInfo | undefined>(params, 'editingClipInfo');
    const audioFile = this.getParam<string | undefined>(params, 'audioFile');
    if (!editingClipInfo) {
      return;
    }
    if (!audioFile) {
      throw new Error('Audio file path must be provided.');
    }
    const track = song.getTrackById(editingClipInfo.trackId);
    if (!track) {
      throw new Error(`Track ${editingClipInfo.trackId} is not found`);
    }
    const clip = track.getClipById(editingClipInfo.clipId);
    if (!clip) {
      throw new Error(
        `Clip ${editingClipInfo.clipId} is not found in track ${editingClipInfo.trackId}`,
      );
    }
    if (clip.getType() !== ClipType.AUDIO_CLIP) {
      throw new Error('Only audio clips can specify audio file');
    }

    const audioBuffer = await readApis.readAudioBuffer(audioFile);
    if (!audioBuffer) {
      throw new Error(`Error reading audio file`);
    }
    if (!_.isString(audioFile)) {
      throw new Error('Audio file path must be a string.');
    }
    const existingAudioClipData = clip.getAudioClipData();
    if (!existingAudioClipData) {
      clip.setAudioFile(audioFile, clip.getClipStartTick(), audioBuffer.duration);
    } else {
      clip.setAudioFile(audioFile, existingAudioClipData.startTick, existingAudioClipData.duration);
    }
  }
}
