import type { ClipInfo, LabelText, ParamDescriptor, SelectWidgetConfig, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType, InjectSource } from 'tuneflow';

export class NoteTrim extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'note-trim';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '剪裁音符',
      en: 'Trim Notes',
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
      offsetTick: {
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
    const editingClipInfo = this.getParam<ClipInfo | undefined>(params, 'editingClipInfo');
    if (!editingClipInfo) {
      return;
    }
    const editingNoteIds = this.getParam<number[]>(params, 'editingNoteIds');
    if (!editingNoteIds || editingNoteIds.length === 0) {
      return;
    }
    const trimPosition = this.getParam<string>(params, 'trimPosition');
    const offsetTick = this.getParam<number>(params, 'offsetTick');
    if (!trimPosition || offsetTick === 0) {
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
    if (trimPosition === 'left') {
      for (const note of notes) {
        note.adjustLeft(offsetTick);
      }
    } else if (trimPosition === 'right') {
      for (const note of notes) {
        note.adjustRight(offsetTick);
      }
    } else {
      throw new Error(`Unknown trim position ${trimPosition}`);
    }
  }
}
