import { Clip, ClipInfo, LabelText, ParamDescriptor, Song } from 'tuneflow';
import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import _ from 'underscore';

export class NoteClone extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'note-clone';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '复制音符',
      en: 'Clone Notes',
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
      cloningNoteIds: {
        displayName: {
          zh: '待复制音符',
          en: 'Cloning Notes',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      pasteTick: {
        displayName: {
          zh: '移动量',
          en: 'Ticks Offset',
        },
        defaultValue: 0,
        widget: {
          type: WidgetType.None,
        },
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
    const cloningNoteIds = this.getParam<number[]>(params, 'cloningNoteIds');
    if (!cloningNoteIds || cloningNoteIds.length === 0) {
      return;
    }
    const pasteTick = this.getParam<number>(params, 'pasteTick');
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
    const notes = clip.getNotesByIds(cloningNoteIds);
    if (notes.length === 0) {
      return;
    }
    const minTick = _.min(notes.map(note => note.getStartTick()));
    for (const note of notes) {
      const offsetFromFirstNote = note.getStartTick() - minTick;
      const newStartTick = pasteTick + offsetFromFirstNote;
      const newEndTick = pasteTick + offsetFromFirstNote + note.getEndTick() - note.getStartTick();
      if (
        !Clip.isNoteInClip(newStartTick, newEndTick, clip.getClipStartTick(), clip.getClipEndTick())
      ) {
        continue;
      }
      clip.createNote({
        pitch: note.getPitch(),
        velocity: note.getVelocity(),
        startTick: newStartTick,
        endTick: newEndTick,
        updateClipRange: false,
      });
    }
  }
}
