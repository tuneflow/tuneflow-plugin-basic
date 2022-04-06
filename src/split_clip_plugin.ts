import type { LabelText, ParamDescriptor, Song } from 'tuneflow';
import { Clip, TuneflowPlugin, WidgetType } from 'tuneflow';

export class SplitClip extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'split-clip';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '分割片段',
      en: 'Split Clips',
    };
  }

  static pluginDescription(): LabelText {
    return {
      zh: '在当前位置将选中的片段分割成两段',
      en: 'Split the selected clip into two at playhead',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      clipInfos: {
        displayName: {
          zh: '待分割片段',
          en: 'Clips to split',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      playheadTick: {
        displayName: {
          zh: '当前指针位置',
          en: 'Playhead Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const clipInfos = this.getParam<any[]>(params, 'clipInfos');
    const playheadTick = this.getParam<number>(params, 'playheadTick');
    for (const clipInfo of clipInfos) {
      const { trackId, clipId } = clipInfo;
      const track = song.getTrackById(trackId);
      if (!track) {
        throw new Error('Track not found.');
      }
      const clip = track.getClipById(clipId);
      if (!clip) {
        throw new Error('Clip not found.');
      }
      if (playheadTick <= clip.getClipStartTick() || playheadTick >= clip.getClipEndTick()) {
        console.log('Skipping clip', clip.getId());
        continue;
      }
      const newClipStartTick = clip.getClipStartTick();
      const newClipEndTick = playheadTick - 1;
      const leftNotes = clip
        .getNotes()
        .filter(item =>
          Clip.isNoteInClip(
            item.getStartTick(),
            item.getEndTick(),
            newClipStartTick,
            newClipEndTick,
          ),
        )
        .map(item => item.clone());
      track.createClip({
        clipStartTick: newClipStartTick,
        clipEndTick: newClipEndTick,
        sortedNotes: leftNotes,
      });
    }
  }
}
