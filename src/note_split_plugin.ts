import type { ClipInfo, LabelText, ParamDescriptor, Song } from 'tuneflow';
import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';

export class NoteSplit extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'note-split';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '分割音符',
      en: 'Split Notes',
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
      noteIds: {
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
      },
      splitAtTick: {
        displayName: {
          zh: '分割位置',
          en: 'Split Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        injectFrom: InjectSource.TickAtPlayhead,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const editingClipInfo = this.getParam<ClipInfo | undefined>(params, 'editingClipInfo');
    if (!editingClipInfo) {
      return;
    }
    const noteIds = this.getParam<number[]>(params, 'noteIds');
    if (!noteIds || noteIds.length === 0) {
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
    const notes = clip.getNotesByIds(noteIds);
    const splitAtTick = this.getParam<number>(params, 'splitAtTick');
    for (const note of notes) {
      if (note.getStartTick() >= splitAtTick || note.getEndTick() <= splitAtTick) {
        continue;
      }
      clip.createNote({
        pitch: note.getPitch(),
        velocity: note.getVelocity(),
        startTick: note.getStartTick(),
        endTick: splitAtTick - 1,
        updateClipRange: false,
        resolveClipConflict: false,
      });
      note.adjustLeftTo(splitAtTick);
    }
  }
}
