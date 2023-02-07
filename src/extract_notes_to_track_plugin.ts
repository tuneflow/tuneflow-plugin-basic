import { TuneflowPlugin, WidgetType, InjectSource, TrackType, AudioPlugin } from 'tuneflow';
import type { ClipInfo, ParamDescriptor, Song } from 'tuneflow';

export class ExtractNotesToTrack extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'extract-notes-to-track';
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

    const newTrack = song.createTrack({
      type: TrackType.MIDI_TRACK,
      index: song.getTrackIndex(track.getId()),
    });
    newTrack.setSamplerPlugin(newTrack.createAudioPlugin(AudioPlugin.DEFAULT_SYNTH_TFID));
    const newClip = newTrack.createMIDIClip({
      clipStartTick: clip.getClipStartTick(),
      clipEndTick: clip.getClipEndTick(),
      insertClip: true,
    });
    for (const note of notes) {
      note.deleteFromParent();
      newClip.createNote({
        pitch: note.getPitch(),
        velocity: note.getVelocity(),
        startTick: note.getStartTick(),
        endTick: note.getEndTick(),
        updateClipRange: false,
        resolveClipConflict: false,
      });
    }
  }
}
