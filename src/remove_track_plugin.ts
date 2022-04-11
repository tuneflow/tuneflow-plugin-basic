import type {
  LabelText,
  ParamDescriptor,
  Song,
  SongAccess,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackRemover extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-remover';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '删除轨道',
      en: 'Delete Track',
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
          type: WidgetType.TrackSelector,
          config: {} as TrackSelectorWidgetConfig,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    song.removeTrack(trackId);
  }
}
