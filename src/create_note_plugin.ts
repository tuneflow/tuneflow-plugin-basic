import type { ClipInfo, ParamDescriptor, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType, InjectSource } from 'tuneflow';

export class NoteCreate extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'note-create';
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
      notePitch: {
        displayName: {
          zh: '音高',
          en: 'Pitch',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      noteStartTick: {
        displayName: {
          zh: '起始位置',
          en: 'Start Tick',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      noteEndTick: {
        displayName: {
          zh: '结束位置',
          en: 'End Tick',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      noteVelocity: {
        displayName: {
          zh: '力度',
          en: 'Velocity',
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
    const editingClipInfo = this.getParam<ClipInfo>(params, 'editingClipInfo');
    const notePitch = this.getParam<number>(params, 'notePitch');
    const noteStartTick = this.getParam<number>(params, 'noteStartTick');
    const noteEndTick = this.getParam<number>(params, 'noteEndTick');
    const noteVelocity = this.getParam<number>(params, 'noteVelocity');
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
    clip.createNote({
      pitch: notePitch,
      startTick: noteStartTick,
      endTick: noteEndTick,
      velocity: noteVelocity,
      updateClipRange: false,
    });
  }
}
