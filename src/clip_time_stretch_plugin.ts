import type { Clip, ParamDescriptor, SelectWidgetConfig, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType, InjectSource } from 'tuneflow';
import _ from 'underscore';

export class ClipTimeStretch extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-time-stretch';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      clipInfos: {
        displayName: {
          zh: '缩放片段',
          en: 'Clips to time-stretch',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        injectFrom: InjectSource.SelectedClipInfos,
      },
      stretchPosition: {
        displayName: {
          zh: '缩放位置',
          en: 'Time-stretch Position',
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
    const stretchPosition = this.getParam<string>(params, 'stretchPosition');
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
    if (stretchPosition === 'left' && offsetTicks < 0) {
      // Moving left edges to the left.
      // Sort the clips so that clips that start first will be stretched first.
      clipsToAdjust.sort((a: Clip, b: Clip) => a.getClipStartTick() - b.getClipStartTick());
    } else if (stretchPosition === 'right' && offsetTicks > 0) {
      // Moving right edges to the right.
      // Sort the clips so that clips that end last will be stretched first.
      clipsToAdjust.sort((a: Clip, b: Clip) => b.getClipEndTick() - a.getClipEndTick());
    }
    for (const clip of clipsToAdjust) {
      if (stretchPosition === 'left') {
        clip.timeStretchFromClipLeft(clip.getClipStartTick() + offsetTicks);
      } else if (stretchPosition === 'right') {
        clip.timeStretchFromClipRight(clip.getClipEndTick() + offsetTicks);
      }
    }
  }
}
