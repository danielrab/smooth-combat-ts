interface ControlToolPair {
  controlName: string;
  toolName: string;
}

export default function switchTool({ controlName, toolName }: ControlToolPair): ControlToolPair {
  const startingControl = ui.controls.activeControl;
  const startingTool = ui.controls.activeTool;
  const control = ui.controls.controls.find((c) => c.name === controlName);
  ui.controls.activeControl = controlName;
  control.activeTool = toolName;
  canvas.layers.find((layer) => layer.name === control.layer).activate();
  ui.controls.render();
  return { controlName: startingControl, toolName: startingTool };
}
