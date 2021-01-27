// eslint-disable-next-line no-unused-vars
export type Processor<T, Options> = (data: T, options: Options) => T;

export function applyProcessors<T, Options>(data: T, processors: Processor<T, Options>[], options:Options): T {
  for (const processor of processors) {
    data = processor(data, options);
  }
  return data;
}

export function bundleProcessors<T, Options>(processors: Processor<T, Options>[]): Processor<T, Options> {
  return (data: T, options: Options) => applyProcessors(data, processors, options);
}

export function deduplicate<T>(list: T[]): T[] {
  return Array.from(new Set(list));
}

export class ProcessedValue<T, Options> {
  original: T
  processors: Processor<T, Options>[]
  constructor(original: T, processors: Processor<T, Options>[]) {
    this.original = original;
    this.processors = processors;
  }
  value(options: Options) {
    return applyProcessors(this.original, this.processors, options);
  }
}

interface ControlToolPair {
  controlName: string;
  toolName: string;
}

export function switchTool({ controlName, toolName }: ControlToolPair): ControlToolPair {
  const startingControl = ui.controls.activeControl;
  const startingTool = ui.controls.activeTool;
  const control = ui.controls.controls.find((c) => c.name === controlName);
  ui.controls.activeControl = controlName;
  control.activeTool = toolName;
  canvas.layers.find((layer) => layer.name === control.layer).activate();
  ui.controls.render();
  return { controlName: startingControl, toolName: startingTool };
}
