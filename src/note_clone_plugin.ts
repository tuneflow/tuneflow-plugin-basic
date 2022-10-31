import { Clip, InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ClipInfo, LabelText, ParamDescriptor, Song } from 'tuneflow';
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
      cloningNotes: {
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
    const cloningNotes = this.getParam<any[]>(params, 'cloningNotes');
    if (!cloningNotes || cloningNotes.length === 0) {
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
    const minTick = _.min(cloningNotes.map(note => note.startTick));
    for (const note of cloningNotes) {
      const offsetFromFirstNote = note.startTick - minTick;
      const newStartTick = pasteTick + offsetFromFirstNote;
      const newEndTick = pasteTick + offsetFromFirstNote + note.endTick - note.startTick;
      if (
        !Clip.isNoteInClip(newStartTick, newEndTick, clip.getClipStartTick(), clip.getClipEndTick())
      ) {
        continue;
      }
      clip.createNote({
        pitch: note.pitch,
        velocity: note.velocity,
        startTick: newStartTick,
        endTick: newEndTick,
        updateClipRange: false,
      });
    }
  }
}
