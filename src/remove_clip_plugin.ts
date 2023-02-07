import type { ParamDescriptor, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class ClipRemover extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'clip-remover';
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
      clip.deleteFromParent(/* deleteAssociatedTrackAutomation= */ true);
    }
  }
}
