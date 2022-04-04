import type { LabelText, ParamDescriptor, Song, SongAccess } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class ClipRemover extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-remover';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '删除片段',
      en: 'Delete Clip',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  songAccess(): SongAccess {
    return {
      removeTrack: true,
    };
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
    clip.deleteFromParent();
  }
}
