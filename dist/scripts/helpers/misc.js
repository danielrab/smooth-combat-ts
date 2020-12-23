export function applyProcessors(data, processors, options) {
    for (const processor of processors) {
        data = processor(data, options);
    }
    return data;
}
export function bundleProcessors(processors) {
    return (data, options) => applyProcessors(data, processors, options);
}
export function deduplicate(list) {
    return Array.from(new Set(list));
}
export class ProcessedValue {
    constructor(original, processors) {
        this.original = original;
        this.processors = processors;
    }
    value(options) {
        return applyProcessors(this.original, this.processors, options);
    }
}
export function switchTool({ controlName, toolName }) {
    const startingControl = ui.controls.activeControl;
    const startingTool = ui.controls.activeTool;
    const control = ui.controls.controls.find((c) => c.name === controlName);
    ui.controls.activeControl = controlName;
    control.activeTool = toolName;
    canvas.layers.find((layer) => layer.name === control.layer).activate();
    ui.controls.render();
    return { controlName: startingControl, toolName: startingTool };
}
