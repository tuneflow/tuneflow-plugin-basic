import type { Clip, ClipInfo, ParamDescriptor, Song, Track } from 'tuneflow';
import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';

export class ClipClone extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-clone';
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
        hidden: true,
      },
      playheadTick: {
        displayName: {
          zh: '当前指针位置',
          en: 'Playhead Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        injectFrom: InjectSource.TickAtPlayhead,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const clipInfos = this.getParam<ClipInfo[]>(params, 'clipInfos');
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
      newClip.moveClipTo(playheadTick, /* moveAssociatedTrackAutomationPoints= */ false);
      newTrack.insertClip(newClip);
    } else {
      const sourceTrackIdSet = new Set<string>(clipInfos.map(clipInfo => clipInfo.trackId));
      let targetTrack: Track | undefined;
      if (sourceTrackIdSet.size === 1) {
        // All cloning clips come from the same track.
        // We can clone the clips to the target track.
        targetTrack = song.getTrackById(pasteToTrackId);
      }
      // Clone multiple clips, each clip will be pasted into
      // its original track at the playhead position.
      // Clone all clips first and paste them later so that
      // clips won't be modified during copy process.
      const clipMapping: any = {};
      let minStartTick = Number.MAX_VALUE;
      for (const clipInfo of clipInfos) {
        const newClip = this.cloneClip(song, clipInfo.trackId, clipInfo.clipId, pasteToTrackId);
        clipMapping[`${clipInfo.trackId}__${clipInfo.clipId}`] = newClip;
        minStartTick = Math.min(minStartTick, newClip.getClipStartTick());
      }
      const offsetTick = playheadTick - minStartTick;
      for (const clipInfo of clipInfos) {
        const newClip = clipMapping[`${clipInfo.trackId}__${clipInfo.clipId}`] as Clip;
        if (!newClip) {
          throw new Error(
            `Did not find clip info in mapping for ${clipInfo.trackId}__${clipInfo.clipId}`,
          );
        }
        newClip.moveClip(offsetTick, /* moveAssociatedTrackAutomationPoints= */ false);
        const track = targetTrack ? targetTrack : song.getTrackById(clipInfo.trackId);
        if (!track) {
          throw new Error('Track not found.');
        }
        track.insertClip(newClip);
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
