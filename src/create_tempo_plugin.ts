import type { ParamDescriptor } from 'tuneflow';
import { TuneflowPlugin, WidgetType, Song } from 'tuneflow';

export class TempoCreate extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-create';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      insertAtTick: {
        displayName: {
          zh: '添加至',
          en: 'Insert At',
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
    let insertAtTick = this.getParam<number>(params, 'insertAtTick');
    const barBeats = song.getBarBeats(insertAtTick + 1);
    const leadingBeat = Song.getLeadingBeat(insertAtTick, barBeats);
    if (!leadingBeat) {
      throw new Error('Cannot find leading beat for insert position.');
    }
    insertAtTick = leadingBeat.tick;
    const leadingTempo = song.getTempoAtTick(insertAtTick);
    if (leadingTempo.getTicks() === insertAtTick) {
      return;
    }
    song.createTempoChange({
      ticks: insertAtTick,
      bpm: leadingTempo.getBpm(),
    });
  }
}
