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
      en: 'Delete Clips',
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
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const clipInfos = this.getParam<any[]>(params, 'clipInfos');
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
      clip.deleteFromParent();
    }
  }
}
