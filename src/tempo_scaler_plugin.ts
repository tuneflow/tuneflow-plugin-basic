import type { LabelText, ParamDescriptor, SliderWidgetConfig, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TempoScaler extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-scaler';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '播放速度',
      en: 'Playback Speed',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      scale: {
        displayName: {
          zh: '速率(%)',
          en: 'Speed Raio(%)',
        },
        defaultValue: 100,
        widget: {
          type: WidgetType.Slider,
          config: {
            step: 10,
            minValue: 10,
            maxValue: 500,
            unit: '%',
          } as SliderWidgetConfig,
        },
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(
    song: Song,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputs: { [inputName: string]: any },
    params: { [paramName: string]: any },
  ): Promise<void | { [artifactId: string]: any }> {
    for (const tempoEvent of song.getTempoChanges()) {
      song.updateTempo(tempoEvent, (tempoEvent.getBpm() * params.scale) / 100);
    }
  }
}
