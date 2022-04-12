import type { Clip, LabelText, ParamDescriptor, Song } from 'tuneflow';
import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';

export class ClipMove extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-move';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '移动片段',
      en: 'Move Clip',
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
        injectFrom: InjectSource.SelectedClipInfos,
      },
      offsetTick: {
        displayName: {
          zh: '移动量',
          en: 'Offset',
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

    if (offsetTick === undefined || offsetTick === null || typeof offsetTick !== 'number') {
      return;
    }
    offsetTick = Math.round(offsetTick);
    if (Math.abs(offsetTick) < 1) {
      return;
    }

    // Get clips.
    const clipsToAdjust = [];
    for (const clipInfo of clipInfos) {
      const { trackId, clipId } = clipInfo;
      const track = song.getTrackById(trackId);
      if (!track) {
        continue;
      }
      const clip = track.getClipById(clipId);
      if (!clip) {
        continue;
      }
      clipsToAdjust.push(clip);
    }
    // Sort the order by when these clips are moved.
    // If moving to the right, we should start from the rightmost clips, in order to prevent the other
    // clips from being removed by earlier moves.
    // Otherwise we start from the leftmost clips.
    // (the clips in the same track are non-overlappable so it should be fine to sort by either start tick or end tick).
    if (offsetTick > 0) {
      // Sort the clips so that clips to the right will be moved first.
      clipsToAdjust.sort((a: Clip, b: Clip) => b.getClipStartTick() - a.getClipStartTick());
    } else if (offsetTick < 0) {
      // Sort the clips so that clips to the left will be moved first.
      clipsToAdjust.sort((a: Clip, b: Clip) => a.getClipStartTick() - b.getClipStartTick());
    }
    // Adjust clips.
    for (const clip of clipsToAdjust) {
      clip.moveClip(offsetTick);
    }
  }
}
