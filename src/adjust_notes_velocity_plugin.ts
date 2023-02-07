import type { ClipInfo, ParamDescriptor, Song } from 'tuneflow';
import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';

export class NoteVelocityAdjust extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'note-velocity-adjust';
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
      offsetVelocity: {
        displayName: {
          zh: '调整量',
          en: 'Offset Amount',
        },
        defaultValue: 0,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
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
    const offsetVelocity = this.getParam<number>(params, 'offsetVelocity');
    if (offsetVelocity === 0) {
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
    for (const note of notes) {
      note.setVelocity(note.getVelocity() + offsetVelocity);
    }
  }
}
