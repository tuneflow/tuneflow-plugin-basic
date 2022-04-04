import type { LabelText, ParamDescriptor, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class ClipTrim extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-trim';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '剪裁片段',
      en: 'Trim Clip',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackId: {
        displayName: {
          zh: '轨道',
          en: 'Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      clipId: {
        displayName: {
          zh: '片段',
          en: 'Clip',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      clipStartTick: {
        displayName: {
          zh: '片段起始',
          en: 'Clip Start',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        optional: true,
      },
      clipEndTick: {
        displayName: {
          zh: '片段结束',
          en: 'Clip End',
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
    const trackId = this.getParam<string>(params, 'trackId');
    const clipId = this.getParam<string>(params, 'clipId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    const clip = track.getClipById(clipId);
    if (!clip) {
      throw new Error('Clip not ready');
    }
    const clipStartTick = this.getParam<number>(params, 'clipStartTick');
    if (
      clipStartTick !== undefined &&
      clipStartTick !== null &&
      typeof clipStartTick === 'number'
    ) {
      clip.adjustClipLeft(clipStartTick);
    }
    const clipEndTick = this.getParam<number>(params, 'clipEndTick');
    if (clipEndTick !== undefined && clipEndTick !== null && typeof clipEndTick === 'number') {
      clip.adjustClipRight(clipEndTick);
    }
  }
}
