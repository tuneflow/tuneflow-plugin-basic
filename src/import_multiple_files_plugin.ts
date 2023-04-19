import { Song, TuneflowPlugin, WidgetType, SUPPORTED_AUDIO_FORMATS, TrackType } from 'tuneflow';
import type { ParamDescriptor, Track } from 'tuneflow';
import _ from 'underscore';

export class ImportMultipleFiles extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'import-multiple-files';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      fileList: {
        displayName: {
          zh: '文件',
          en: 'File',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
      insertTick: {
        displayName: {
          zh: '插入位置',
          en: 'Insert Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
      insertTrackId: {
        displayName: {
          zh: '插入轨道',
          en: 'Insert Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const fileList = this.getParam<File[]>(params, 'fileList');
    const insertTick = this.getParam<number>(params, 'insertTick');
    const insertTrackId = this.getParam<string>(params, 'insertTrackId');
    const allowedFileTypes = ['mid', 'midi', ...SUPPORTED_AUDIO_FORMATS];
    let insertTrackIndex = song.getTrackIndex(insertTrackId);
    if (insertTrackIndex < 0) {
      insertTrackIndex = song.getTracks().length;
    }
    for (const file of fileList) {
      const fileExtension = this.getAllowedFileExtension(file.name.toLowerCase(), allowedFileTypes);
      if (!fileExtension) {
        continue;
      }
      if (this.isMidiFileType(fileExtension)) {
        const fileContent = await file.arrayBuffer();
        // Overwrite tempos and time signatures if there are nothing in the project.
        const overwriteTemposAndTimeSignatures =
          song.getTracks().length === 0 ||
          !song.getTracks()[0].getClips() ||
          song.getTracks()[0].getClips().length === 0;
        const updatedTracks = Song.importMIDI(
          song,
          fileContent,
          insertTick,
          overwriteTemposAndTimeSignatures,
          /* insertAtIndex= */ insertTrackIndex,
        );
        insertTrackIndex += updatedTracks.length;
      } else if (this.isAudioFileType(fileExtension)) {
        let newAudioTrack: Track;
        if (insertTrackIndex < song.getTracks().length) {
          newAudioTrack = song.getTracks()[insertTrackIndex];
        } else {
          newAudioTrack = song.createTrack({
            type: TrackType.AUDIO_TRACK,
          });
        }
        insertTrackIndex += 1;
        let fileContent = await file.arrayBuffer();
        const audioBuffer = await this.readAsAudioBuffer(fileContent);
        fileContent = await file.arrayBuffer();
        newAudioTrack.createAudioClip({
          clipStartTick: insertTick,
          audioClipData: {
            startTick: insertTick,
            audioData: {
              format: fileExtension,
              data: new Uint8Array(fileContent),
            },
            duration: audioBuffer.duration,
          },
        });
      }
    }
  }

  private isMidiFileType(fileExtension: string) {
    return _.include(['mid', 'midi'], fileExtension);
  }

  private isAudioFileType(fileExtension: string) {
    return _.include(SUPPORTED_AUDIO_FORMATS, fileExtension);
  }

  private getAllowedFileExtension(fileName: string, allowedFileTypes: string[]) {
    if (!fileName) {
      return null;
    }
    const parts = fileName.split('.');
    const extension = parts[parts.length - 1];
    if (!_.includes(allowedFileTypes, parts[parts.length - 1])) {
      return null;
    }
    return extension;
  }

  private async readAsAudioBuffer(fileBuffer: ArrayBuffer) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContext();
    return audioCtx.decodeAudioData(fileBuffer);
  }
}
