import { TuneflowPlugin, WidgetType, InjectSource } from 'tuneflow';
import type { ClipInfo, LabelText, ParamDescriptor, Song, SliderWidgetConfig } from 'tuneflow';
import _ from 'underscore';

export class RandomizeNoteVelocity extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'randomize-note-velocity';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '音符力度随机化',
      en: 'Randomize Note Velocity',
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
      editingNoteIds: {
        displayName: {
          zh: '编辑音符',
          en: 'Editing Notes',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        injectFrom: InjectSource.EditingNoteIds,
      },
      randomizeRange: {
        displayName: {
          zh: '随机幅度',
          en: 'Randomize Range',
        },
        description: {
          zh: '在原力度的基础上偏移的程度',
          en: 'How much offset is applied upon the original velocity',
        },
        defaultValue: 0,
        widget: {
          type: WidgetType.Slider,
          config: {
            minValue: 1,
            maxValue: 127,
            step: 1,
          } as SliderWidgetConfig,
        },
        adjustableWhenPluginIsApplied: true,
      },
      velocityLowerLimit: {
        displayName: {
          zh: '力度下限',
          en: 'Velocity Lower Limit',
        },
        defaultValue: 16,
        widget: {
          type: WidgetType.Slider,
          config: {
            minValue: 1,
            maxValue: 127,
            step: 1,
          } as SliderWidgetConfig,
        },
        adjustableWhenPluginIsApplied: true,
      },
      velocityUpperLimit: {
        displayName: {
          zh: '力度上限',
          en: 'Velocity Upper Limit',
        },
        defaultValue: 111,
        widget: {
          type: WidgetType.Slider,
          config: {
            minValue: 1,
            maxValue: 127,
            step: 1,
          } as SliderWidgetConfig,
        },
        adjustableWhenPluginIsApplied: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const editingClipInfo = this.getParam<ClipInfo | undefined>(params, 'editingClipInfo');
    if (!editingClipInfo) {
      return;
    }
    const editingNoteIds = this.getParam<number[]>(params, 'editingNoteIds');
    if (!editingNoteIds || editingNoteIds.length === 0) {
      return;
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
    const notes = clip.getNotesByIds(editingNoteIds);
    const randomizeRange = this.getParam<number>(params, 'randomizeRange');
    const velocityUpperLimit = this.getParam<number>(params, 'velocityUpperLimit');
    const velocityLowerLimit = this.getParam<number>(params, 'velocityLowerLimit');
    if (
      !_.isNumber(randomizeRange) ||
      !_.isNumber(velocityLowerLimit) ||
      !_.isNumber(velocityUpperLimit)
    ) {
      throw new Error('randomize range is not a number');
    }
    if (velocityLowerLimit > velocityUpperLimit) {
      throw new Error('velocity lower limit is larger than upper limit');
    }
    for (const note of notes) {
      const offset = _.random(-randomizeRange, randomizeRange);
      note.setVelocity(
        Math.min(velocityUpperLimit, Math.max(velocityLowerLimit, note.getVelocity() + offset)),
      );
    }
  }
}
