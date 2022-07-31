import {
  AutomationTarget,
  AutomationTargetType,
  InjectSource,
  TempoEvent,
  TimeSignatureEvent,
  TrackType,
  TuneflowPlugin,
  WidgetType,
} from 'tuneflow';
import type {
  FileSelectorWidgetConfig,
  LabelText,
  ParamDescriptor,
  Song,
  SelectWidgetConfig,
  SongAccess,
  AutomationValue,
} from 'tuneflow';
import { Midi } from '@tonejs/midi';

export class ImportMIDI extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'import-midi';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '导入MIDI',
      en: 'Import MIDI',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '导入本地MIDI文件',
      en: 'Import a local MIDI file',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      file: {
        displayName: {
          zh: '文件',
          en: 'File',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.FileSelector,
          config: {
            allowedExtensions: ['mid', 'MID', 'midi', 'MIDI'],
          } as FileSelectorWidgetConfig,
        },
      },
      insertPosition: {
        displayName: {
          zh: '插入位置',
          en: 'Insert Position',
        },
        defaultValue: 'playhead',
        widget: {
          type: WidgetType.Select,
          config: {
            options: [
              {
                label: {
                  zh: '歌曲开始',
                  en: 'Start of the song',
                },
                value: 'start',
              },
              {
                label: {
                  zh: '播放头',
                  en: 'Playhead',
                },
                value: 'playhead',
              },
            ],
          } as SelectWidgetConfig,
        },
      },
      playheadTick: {
        displayName: {
          zh: '播放头位置',
          en: 'Playhead Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        injectFrom: InjectSource.TickAtPlayhead,
      },
      overwriteTemposAndTimeSignatures: {
        displayName: {
          zh: '覆盖现有 Tempo 和 Time Signature',
          en: 'Overwrite existing tempos and time signatures.',
        },
        defaultValue: false,
        widget: {
          type: WidgetType.Switch,
        },
      },
    };
  }

  public allowManualApplyAdjust(): boolean {
    return true;
  }
  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const file = this.getParam<File>(params, 'file');
    const fileBuffer = await file.arrayBuffer();
    const playheadTick = this.getParam<number>(params, 'playheadTick');
    const insertPosition = this.getParam<string>(params, 'insertPosition');
    const overwriteTemposAndTimeSignatures = this.getParam<boolean>(
      params,
      'overwriteTemposAndTimeSignatures',
    );
    const midi = new Midi(fileBuffer);

    const insertOffset = insertPosition === 'playhead' ? playheadTick : 0;

    // Optionally overwrite tempos and time signatures.
    if (overwriteTemposAndTimeSignatures) {
      const newTempoEvents = [];
      if (insertOffset > 0) {
        // Insert a default tempo event at the beginning.
        newTempoEvents.push(
          new TempoEvent({
            ticks: 0,
            time: 0,
            bpm: 120,
          }),
        );
      }
      for (const rawTempoEvent of midi.header.tempos) {
        newTempoEvents.push(
          new TempoEvent({
            ticks: insertOffset + rawTempoEvent.ticks,
            time: rawTempoEvent.time as number,
            bpm: rawTempoEvent.bpm,
          }),
        );
      }
      song.overwriteTempoChanges(newTempoEvents);
      const newTimeSignatureEvents = [];
      for (const rawTimeSignatureEvent of midi.header.timeSignatures) {
        newTimeSignatureEvents.push(
          new TimeSignatureEvent({
            ticks: insertOffset + rawTimeSignatureEvent.ticks,
            // TODO: Verify if this order is correct.
            numerator: rawTimeSignatureEvent.timeSignature[0],
            denominator: rawTimeSignatureEvent.timeSignature[1],
          }),
        );
      }
      song.overwriteTimeSignatures(newTimeSignatureEvents);
    }

    // Add tracks and notes.
    for (const track of midi.tracks) {
      const songTrack = song.createTrack({ type: TrackType.MIDI_TRACK });
      songTrack.setInstrument({
        program: track.instrument.number,
        isDrum: track.instrument.percussion,
      });
      const trackClip = songTrack.createMIDIClip({ clipStartTick: insertOffset });
      let minStartTick = Number.MAX_SAFE_INTEGER;
      // Add notes.
      for (const note of track.notes) {
        trackClip.createNote({
          pitch: note.midi,
          velocity: Math.round(note.velocity * 127),
          startTick: insertOffset + note.ticks,
          endTick: insertOffset + note.ticks + note.durationTicks,
        });
        minStartTick = Math.min(minStartTick, insertOffset + note.ticks);
      }
      // Add volume automation.
      if (track.controlChanges[7]) {
        const volumeTarget = new AutomationTarget(AutomationTargetType.VOLUME);
        songTrack.getAutomation().addAutomation(volumeTarget);
        const volumeTargetValue = songTrack
          .getAutomation()
          .getAutomationValueByTarget(volumeTarget) as AutomationValue;
        for (const cc of track.controlChanges[7]) {
          volumeTargetValue.addPoint(cc.ticks, cc.value);
        }
      }
      // Add pan automation.
      if (track.controlChanges[10]) {
        const panTarget = new AutomationTarget(AutomationTargetType.PAN);
        songTrack.getAutomation().addAutomation(panTarget);
        const panTargetValue = songTrack
          .getAutomation()
          .getAutomationValueByTarget(panTarget) as AutomationValue;
        for (const cc of track.controlChanges[10]) {
          panTargetValue.addPoint(cc.ticks, cc.value);
        }
      }
      if (minStartTick !== Number.MAX_SAFE_INTEGER) {
        trackClip.adjustClipLeft(minStartTick);
      }
    }
  }
}
