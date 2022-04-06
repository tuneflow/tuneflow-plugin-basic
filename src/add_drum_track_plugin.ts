import type {
  LabelText,
  ParamDescriptor,
  SelectWidgetConfig,
  SelectWidgetOption,
  Song,
  SongAccess,
  SwitchWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';
import _ from 'underscore';
// Dynamic import all presets since they are pretty large in size.
const musicgatewayPresets = () => import('./add_drum_track_plugin_presets/musicgateway.com');

const drumPatterns = {
  musicgateway: {
    credit: 'musicgateway.com',
    patterns: musicgatewayPresets,
  },
};

export class AddDrumTrack extends TuneflowPlugin {
  private drumOptions: SelectWidgetOption[] = [];

  static LOAD_PRESETS_PROMISE: Promise<void> | null = null;
  static PRESETS_LOADED = false;

  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'add-drum-track';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '添加鼓点',
      en: 'Add Drum Track',
    };
  }

  static pluginDescription(): LabelText | null {
    return null;
  }

  async init(): Promise<void> {
    if (!AddDrumTrack.LOAD_PRESETS_PROMISE) {
      AddDrumTrack.LOAD_PRESETS_PROMISE = new Promise((resolve, reject) => {
        Promise.all(
          _.keys(drumPatterns).map(async key => {
            const drumPatternsEntry = (drumPatterns as any)[key];
            drumPatternsEntry.patterns = (await drumPatternsEntry.patterns()).preset;
          }),
        ).then(
          () => {
            AddDrumTrack.PRESETS_LOADED = true;
            resolve();
          },
          () => {
            reject();
          },
        );
      });
    }

    try {
      await AddDrumTrack.LOAD_PRESETS_PROMISE;
    } catch (e) {
      console.error(e);
    }

    if (AddDrumTrack.PRESETS_LOADED) {
      this.drumOptions = _.flatten(
        _.keys(drumPatterns).map(drumPatternsKey => {
          const patternsConfig = (drumPatterns as any)[drumPatternsKey];
          return patternsConfig.patterns.map((item: any, index: number) => {
            console.log(item);
            return {
              label: item[0],
              value: `${drumPatternsKey}~_~${index}`,
            };
          });
        }),
      );
    }
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      preset: {
        displayName: {
          zh: '鼓点类型',
          en: 'Pattern',
        },
        description: {
          zh: '制作: musicgateway.com',
          en: 'Credit: musicgateway.com',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Select,
          config: {
            options: this.drumOptions,
            placeholder: {
              zh: '选择鼓点类型',
              en: 'Select a drum pattern',
            },
            allowSearch: true,
          } as SelectWidgetConfig,
        },
      },
      loopPattern: {
        displayName: {
          zh: '循环',
          en: 'Loop',
        },
        description: {
          zh: '是否循环鼓点片段直到歌曲结尾',
          en: 'Whether to repeat the pattern until the end of the song',
        },
        defaultValue: false,
        widget: {
          type: WidgetType.Switch,
          config: {} as SwitchWidgetConfig,
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
    const presetKey = this.getParam<string>(params, 'preset');
    const loopPattern = this.getParam<boolean>(params, 'loopPattern');
    const presetKeyParts = presetKey.split('~_~');
    const drumPatternsGroup = presetKeyParts[0];
    const drumPatternIndex = Number(presetKeyParts[1]);
    const drumPattern = (drumPatterns as any)[drumPatternsGroup].patterns[drumPatternIndex][1];
    const newTrack = song.createTrack({
      index: song.getTracks().length,
    });
    newTrack.setInstrument({
      program: 0,
      isDrum: true,
    });
    let firstNoteTick = Number.MAX_VALUE;
    for (const track of song.getTracks()) {
      if (track.getClips().length > 0 && track.getClips()[0].getNotes().length > 0) {
        firstNoteTick = Math.min(track.getClips()[0].getNotes()[0].getStartTick(), firstNoteTick);
      }
    }

    const lastTick = song.getLastTick();
    const newClip = newTrack.createClip({
      clipStartTick: 0,
      sortedNotes: [],
    });
    newClip.adjustClipRange(firstNoteTick, lastTick);
    let lastEndTick = firstNoteTick;
    let reachedEnd = false;

    while (!reachedEnd) {
      const offset = lastEndTick;
      for (const track of drumPattern.tracks) {
        // This track.notes is an exception:
        // We use a special format to save drum patterns,
        // which simplifies track.clips.notes to track.notes.
        for (const note of track.notes) {
          const pitch = note[1];
          const velocity = Math.max(64, note[3]);
          const startTicksRaw = note[0];
          const endTicksRaw = note[0] + note[2];
          const startTick = offset + (startTicksRaw / drumPattern.ppq) * song.getResolution();
          if (startTick >= lastTick) {
            reachedEnd = true;
            break;
          }
          const endTick = offset + (endTicksRaw / drumPattern.ppq) * song.getResolution();
          lastEndTick = Math.max(lastEndTick, endTick);
          const noteParam = {
            pitch,
            velocity,
            startTick,
            endTick,
          };
          newClip.createNote(noteParam);
        }
        if (reachedEnd) {
          break;
        }
      }
      if (!loopPattern) {
        // Don't loop until the end.
        break;
      }
      if (lastEndTick <= offset) {
        // offset is not increasing.
        break;
      }
    }
  }
}
