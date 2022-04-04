import type { LabelText, ParamDescriptor, Song, SongAccess } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';
import _ from 'underscore';

export class ClipClone extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-clone';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '复制片段',
      en: 'Clone Clips',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      clipInfos: {
        displayName: {
          zh: '原片段',
          en: 'Clips to clone',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      pasteToTrackId: {
        displayName: {
          zh: '粘贴至轨道',
          en: 'Track to paste to',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      playheadTick: {
        displayName: {
          zh: '当前指针位置',
          en: 'Playhead Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const clipInfos = this.getParam<any[]>(params, 'clipInfos');
    const pasteToTrackId = this.getParam<string>(params, 'pasteToTrackId');
    const playheadTick = this.getParam<number>(params, 'playheadTick');
    if (clipInfos.length === 0) {
      return;
    }
    if (playheadTick === undefined || playheadTick === null) {
      throw new Error('Playhead position not provided.');
    }
    if (clipInfos.length === 1) {
      // Clone 1 clip into the selected track.
      const clipInfo = clipInfos[0];
      const trackToClone = song.getTrackById(clipInfo.trackId);
      if (!trackToClone) {
        throw new Error('Track to clone not found.');
      }
      const clipToClone = trackToClone.getClipById(clipInfo.clipId);
      if (!clipToClone) {
        throw new Error('Clip to clone not found.');
      }
      const newTrack = song.getTrackById(pasteToTrackId);
      if (!newTrack) {
        throw new Error('Paste to track not found.');
      }
      const newClip = this.cloneClip(song, clipInfo.trackId, clipInfo.clipId, pasteToTrackId);
      newClip.moveClipTo(playheadTick);
      newTrack.insertClip(newClip);
    } else {
      // Clone multiple clips, each clip will be pasted into
      // its original track at the playhead position.
      // Clone all clips first and paste them later so that
      // clips won't be modified during copy process.
      for (const clipInfo of clipInfos) {
        const newClip = this.cloneClip(song, clipInfo.trackId, clipInfo.clipId, pasteToTrackId);
        clipInfo.newClip = newClip;
      }
      const minStartTick = _.min(clipInfos.map(item => item.newClip.getClipStartTick()));
      const offsetTick = playheadTick - minStartTick;
      for (const clipInfo of clipInfos) {
        clipInfo.newClip.moveClip(offsetTick);
        const track = song.getTrackById(clipInfo.trackId);
        if (!track) {
          throw new Error('Track not found.');
        }
        track.insertClip(clipInfo.newClip);
      }
    }
  }

  private cloneClip(song: Song, trackId: string, clipId: string, pasteToTrackId: string) {
    const trackToClone = song.getTrackById(trackId);
    if (!trackToClone) {
      throw new Error('Track to clone not found.');
    }
    const clipToClone = trackToClone.getClipById(clipId);
    if (!clipToClone) {
      throw new Error('Clip to clone not found.');
    }
    const newTrack = song.getTrackById(pasteToTrackId);
    if (!newTrack) {
      throw new Error('Paste to track not found.');
    }
    return newTrack.cloneClip(clipToClone);
  }
}
