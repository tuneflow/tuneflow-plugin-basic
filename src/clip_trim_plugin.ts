import type { Clip, ParamDescriptor, SelectWidgetConfig, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType, InjectSource } from 'tuneflow';
import _ from 'underscore';

export class ClipTrim extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-trim';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      clipInfos: {
        displayName: {
          zh: '剪裁片段',
          en: 'Clips to trim',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        injectFrom: InjectSource.SelectedClipInfos,
      },
      trimPosition: {
        displayName: {
          zh: '裁剪位置',
          en: 'Trim Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Select,
          config: {
            options: [
              {
                value: 'left',
                label: {
                  zh: '左侧',
                  en: 'Left',
                },
              },
              {
                value: 'right',
                label: {
                  zh: '右侧',
                  en: 'Right',
                },
              },
            ],
          } as SelectWidgetConfig,
        },
        hidden: true,
      },
      offsetTicks: {
        displayName: {
          zh: '移动量',
          en: 'Ticks Offset',
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
    const trimPosition = this.getParam<string>(params, 'trimPosition');
    let offsetTicks = this.getParam<number>(params, 'offsetTicks');

    if (!_.isNumber(offsetTicks)) {
      return;
    }
    offsetTicks = Math.round(offsetTicks);
    if (Math.abs(offsetTicks) < 1) {
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
    if (clipsToAdjust.length === 0) {
      return;
    }

    // TODO: Sort by track id first before sorting by start/end ticks.
    // Check for conditions where the adjusted clips might overlap with each other.
    if (trimPosition === 'left' && offsetTicks < 0) {
      // Moving left edges to the left.
      // Sort the clips so that clips that start first will be trimmed first.
      clipsToAdjust.sort((a: Clip, b: Clip) => a.getClipStartTick() - b.getClipStartTick());
    } else if (trimPosition === 'right' && offsetTicks > 0) {
      // Moving right edges to the right.
      // Sort the clips so that clips that end last will be trimmed first.
      clipsToAdjust.sort((a: Clip, b: Clip) => b.getClipEndTick() - a.getClipEndTick());
    }
    for (const clip of clipsToAdjust) {
      if (trimPosition === 'left') {
        clip.adjustClipLeft(clip.getClipStartTick() + offsetTicks);
      } else if (trimPosition === 'right') {
        clip.adjustClipRight(clip.getClipEndTick() + offsetTicks);
      }
    }
  }
}
