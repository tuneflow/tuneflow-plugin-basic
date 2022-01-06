import type { ParamDescriptor, SliderWidgetConfig, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TempoScaler extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-scaler';
  }

  static providerDisplayName(): string {
    return 'Andantei';
  }

  static pluginDisplayName(): string {
    return 'Tempo Scaler';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      scale: {
        displayName: 'Scale',
        widget: {
          type: WidgetType.Slider,
          config: {
            defaultValue: 1,
            step: 0.1,
            minValue: 0.1,
            maxValue: 5,
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
      song.updateTempo(tempoEvent, tempoEvent.getBpm() * params.scale);
    }
  }
}
