import type { Clip, ParamDescriptor, Song, Track } from 'tuneflow';
import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import _ from 'underscore';

export class ClipMove extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-move';
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
        injectFrom: InjectSource.SelectedClipInfos,
      },
      offsetTick: {
        displayName: {
          zh: '时间轴移动量',
          en: 'Offset Ticks',
        },
        defaultValue: 0,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
      offsetTrackIndexes: {
        displayName: {
          zh: '轨道移动量',
          en: 'Offset Tracks',
        },
        defaultValue: 0,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const clipInfos = this.getParam<any[]>(params, 'clipInfos');
    let offsetTick = this.getParam<number>(params, 'offsetTick');
    const offsetTrackIndexes = this.getParam<number>(params, 'offsetTrackIndexes');

    if (!_.isNumber(offsetTick) || !_.isNumber(offsetTrackIndexes)) {
      return;
    }
    offsetTick = Math.round(offsetTick);
    if (Math.abs(offsetTick) < 1 && Math.abs(offsetTrackIndexes) < 1) {
      return;
    }

    const trackIdToIndexMap: any = {};
    const trackIndexToIdMap: any = {};

    for (let i = 0; i < song.getTracks().length; i += 1) {
      const track = song.getTracks()[i];
      trackIdToIndexMap[track.getId()] = i;
      trackIndexToIdMap[i] = track.getId();
    }

    // Get clips.
    const clipsToAdjust = [];
    for (const clipInfo of clipInfos) {
      const { trackId, clipId } = clipInfo;
      const trackIndex = trackIdToIndexMap[trackId];
      const track = song.getTracks()[trackIndex];
      if (!track) {
        continue;
      }
      const clip = track.getClipById(clipId);
      if (!clip) {
        continue;
      }

      const remappedTrackIndex = trackIndex + offsetTrackIndexes;
      const remappedTrackId = trackIndexToIdMap[remappedTrackIndex];
      const remappedTrack = song.getTracks()[remappedTrackIndex];
      clipsToAdjust.push({
        trackId,
        clipId,
        remappedTrackId,
        clip,
        trackIndex,
        remappedTrackIndex,
        remappedTrack,
      });
    }
    // Sort the order by when these clips are moved.
    // If moving to the right, we should start from the rightmost clips, in order to prevent the other
    // clips from being removed by earlier moves.
    // Otherwise we start from the leftmost clips.
    // (the clips in the same track are non-overlappable so it should be fine to sort by either start tick or end tick).
    // Similarly, if moving up, we should start from the lower track indices, otherwise if moving down, we should
    // start with larger track indices.
    clipsToAdjust.sort((a: any, b: any) => {
      // Sort tracks first.
      if (offsetTrackIndexes > 0) {
        // Moving down, large track index first.
        if (a.trackIndex !== b.trackIndex) {
          return b.trackIndex - a.trackIndex;
        }
        if (offsetTick > 0) {
          // Move to the right, larger start ticks first.
          return (b.clip as Clip).getClipStartTick() - (a.clip as Clip).getClipStartTick();
        } else {
          return (a.clip as Clip).getClipStartTick() - (b.clip as Clip).getClipStartTick();
        }
      } else {
        // Moving up, small track index first.
        if (a.trackIndex !== b.trackIndex) {
          return a.trackIndex - b.trackIndex;
        }
        if (offsetTick > 0) {
          // Move to the right, larger start ticks first.
          return (b.clip as Clip).getClipStartTick() - (a.clip as Clip).getClipStartTick();
        } else {
          return (a.clip as Clip).getClipStartTick() - (b.clip as Clip).getClipStartTick();
        }
      }
    });

    // Adjust clips.
    for (const clipMetadata of clipsToAdjust) {
      const clip = clipMetadata.clip as Clip;
      if (offsetTrackIndexes !== 0) {
        clip.deleteFromParent(/* deleteAssociatedTrackAutomation= */ false);
      }
      clip.moveClip(
        offsetTick,
        /* moveAssociatedTrackAutomationPoints= */ offsetTrackIndexes === 0,
      );
      const remappedTrack = clipMetadata.remappedTrack as Track;
      if (remappedTrack) {
        remappedTrack.insertClip(clip);
      }
    }
  }
}
