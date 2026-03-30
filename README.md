# Juniper IIIF

A high-performance [IIIF](https://iiif.io/) image viewer with WebGPU, WebGL, and Canvas 2D rendering backends. Built for smooth interaction with deep-zoom images, annotations, and comparison workflows.

## Features

- **Multiple renderers** — WebGPU (4x MSAA), WebGL, Canvas 2D with automatic fallback
- **Tiled rendering** — multi-level tile management with LRU caching, priority loading, and GPU batching
- **Spring physics camera** — smooth zoom-to-cursor, pan, pinch, and keyboard navigation
- **IIIF v2 & v3** — manifest parsing, multi-canvas navigation, ranges/TOC, metadata
- **Annotations** — IIIF annotations + custom HTML annotations with popups
- **HTML overlays** — arbitrary DOM elements positioned in world coordinates
- **Minimap** — draggable viewport navigator with rotate and mirror controls
- **Comparison mode** — synchronized side-by-side viewing of multiple images
- **Responsive** — per-breakpoint panel visibility for desktop, tablet, and mobile
- **Fully themeable** — CSS custom properties for colors, sizing, and layout
- **TypeScript** — full type definitions included

## Installation

```bash
npm install juniper-iiif
```

## Quick Start

```ts
import { IIIFViewer } from 'juniper-iiif';
import 'juniper-iiif/style.css';

const container = document.getElementById('viewer');
const viewer = await IIIFViewer.create(container, 'https://example.org/manifest.json');
```

### With Options

```ts
const viewer = await IIIFViewer.create(container, url, {
  preset: 'full',            // 'minimal' | 'viewer' | 'full'
  renderer: 'auto',          // 'webgpu' | 'webgl' | 'canvas2d' | 'auto'
  camera: {
    wheelZoomFactor: 1.5,    // Wheel/button/keyboard zoom multiplier
    pinchSensitivity: 1.0,   // Pinch-to-zoom sensitivity (>1 amplifies, <1 dampens)
    doubleTapZoomFactor: 2.0, // Double-tap zoom multiplier
    minZoom: 0.2,            // Min zoom (multiplier of fit-to-view scale)
    maxZoom: 10,             // Max zoom (multiplier of fit-to-view scale)
    springStiffness: 6.5,    // Animation spring tension
    animationTime: 1.25,     // Spring duration (seconds)
    zoomThrottle: 80,        // Min ms between wheel events
  },
  distanceDetail: 0.65,      // Tile detail (0-1, lower = sharper)
  panels: {
    navigation: 'show',
    pages: 'show',
    minimap: 'show',
    annotations: 'show',
    settings: 'show-closed',
    manifest: 'show-closed',
    compare: 'show',
    gesture: 'show-closed',
  },
  enableOverlays: true,
  enableCompare: true,
});
```

### JSON Configuration

Load images and settings from a config object:

```ts
const viewer = new IIIFViewer(container, { preset: 'full', autoStart: true });

await viewer.loadConfig({
  images: [
    { url: 'https://example.org/iiif/image1/info.json', label: 'Image 1' },
    { url: 'https://example.org/iiif/image2/info.json', placement: { x: 1000, y: 0 } },
  ],
  settings: {
    backgroundColor: '#1a1a1a',
    theme: 'dark',
  },
  viewport: {
    centerX: 500,
    centerY: 500,
    zoom: 1.5,
  },
  annotations: [
    { x: 100, y: 200, content: 'Note here', type: 'Notes' },
  ],
});
```

## Navigation

```ts
// Zoom
viewer.zoom(targetScale, duration?);
viewer.zoomByFactor(2.0, duration?);

// Pan
viewer.pan(deltaX, deltaY, duration?);

// Navigate to point
viewer.lookAt(x, y);
viewer.lookAt(x, y, { zoom: 3, duration: 600 });

// Fit a rectangular region (image pixel coordinates)
viewer.fitBounds(x, y, width, height);
viewer.fitBounds(100, 200, 400, 300, { padding: 80, duration: 800 });

// Fit entire image in view
viewer.fitToWorld();

// Navigate to absolute position
viewer.to(worldX, worldY, cameraZ, duration?);

// Canvas navigation (multi-page manifests)
await viewer.loadCanvas(index);
await viewer.nextCanvas();
await viewer.previousCanvas();
viewer.canvasCount;    // total canvases
viewer.currentCanvas;  // current index
```

## Events

```ts
const off = viewer.on('zoom', ({ zoom, scale }) => {
  console.log('Zoom level:', zoom);
});

// Available events:
viewer.on('load',            ({ url, type }) => {});
viewer.on('canvasChange',    ({ index, label }) => {});
viewer.on('viewportChange',  ({ centerX, centerY, zoom, scale }) => {});
viewer.on('zoom',            ({ zoom, scale }) => {});
viewer.on('rendererReady',   ({ type }) => {});
viewer.on('tileLoadStart',   ({ totalPending }) => {});
viewer.on('tileLoadEnd',     () => {});
viewer.on('error',           ({ message, source, originalError }) => {});
viewer.on('destroy',         () => {});

// Unsubscribe
off();
```

## Annotations

Add custom HTML annotations positioned in image pixel coordinates:

```ts
// Simple text label
viewer.addAnnotation(200, 100, 400, 60, 'Detail of interest', {
  id: 'label-1',
  type: 'Notes',
  color: '#3e73c9',
  style: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
  },
});

// Point marker with popup
viewer.addAnnotation(800, 600, 0, 0, 'pin', {
  id: 'pin-1',
  type: 'Markers',
  scaleWithZoom: false,
  popup: '<h4>Point of Interest</h4><p>Description here</p>',
  popupPosition: { x: 28, y: 0 },
});

// Custom HTML element
const el = document.createElement('div');
el.innerHTML = '<div class="hotspot-pulse"></div>';
viewer.addAnnotation(500, 300, 0, 0, el, {
  scaleWithZoom: true,
  style: { overflow: 'visible' },
});

// Remove / clear
viewer.removeAnnotation('label-1');
viewer.clearAnnotations();
```

### Annotation Options

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `string` | Category (shown in annotation panel) |
| `color` | `string` | Panel indicator color |
| `scaleWithZoom` | `boolean` | Scale with zoom or stay fixed size |
| `style` | `Record<string, string>` | CSS styles applied to the element |
| `activeClass` | `string` | CSS class when annotation is visible |
| `inactiveClass` | `string` | CSS class when annotation is hidden |
| `targetUrl` | `string` | Only show for this manifest URL |
| `targetPage` | `number` | Only show on this canvas index |
| `popup` | `string \| HTMLElement` | Popup content on click |
| `popupPosition` | `{ x, y }` | Popup offset in screen pixels |

## State

```ts
viewer.getZoom();          // Current scale (1 = 1:1 pixels)
viewer.getCenter();        // { x, y } in world coordinates
viewer.getBounds();        // { left, top, right, bottom }
viewer.getRendererType();  // 'webgpu' | 'webgl' | 'canvas2d'
viewer.isLoading();        // Whether tiles are being fetched
```

## Layout Persistence

Save and restore the full viewer state including viewport, panel positions, and settings:

```ts
const state = viewer.saveLayout();
localStorage.setItem('viewer-layout', JSON.stringify(state));

// Later:
const saved = JSON.parse(localStorage.getItem('viewer-layout'));
await viewer.loadLayout(saved);
```

## Theming

### CSS Custom Properties

Import the default stylesheet, then override variables:

```ts
import 'juniper-iiif/style.css';
```

```css
:root {
  /* Colors (RGB format for opacity control) */
  --iiif-color-primary: 100, 200, 150;
  --iiif-panel-bg: rgba(20, 20, 30, 0.9);
  --iiif-text-primary: #f0f0f0;

  /* Layout */
  --iiif-toolbar-height: 3rem;
  --iiif-border-radius: 12px;
  --iiif-nav-btn-size: 32px;

  /* Typography */
  --iiif-font-family: 'Inter', sans-serif;
}
```

### Theme File

A complete, documented theme file is shipped for direct editing:

```bash
# Copy from node_modules into your project
cp node_modules/juniper-iiif/dist/iiif-theme.css ./src/my-theme.css
```

Or import it to see all available variables:

```ts
import 'juniper-iiif/theme.css';
```

### Light Theme

Add the `theme-light` class to the container:

```ts
container.classList.add('theme-light');
```

### CSS Variables Reference

**Colors:** `--iiif-color-primary`, `--iiif-color-danger`, `--iiif-color-success`, `--iiif-color-info`, `--iiif-color-error`

**Panel:** `--iiif-panel-bg`, `--iiif-panel-blur`, `--iiif-panel-shadow`, `--iiif-panel-z-index`, `--iiif-panel-header-font-size`, `--iiif-panel-body-font-size`

**Text:** `--iiif-text-primary`, `--iiif-text-secondary`, `--iiif-text-muted`, `--iiif-text-dimmed`, `--iiif-text-hover`

**Borders:** `--iiif-border-color`, `--iiif-border-light`, `--iiif-border-radius`

**Interactive:** `--iiif-hover-bg`, `--iiif-active-bg`, `--iiif-active-border`, `--iiif-focus-color`

**Buttons:** `--iiif-button-bg`, `--iiif-button-bg-hover`, `--iiif-button-border`

**Inputs:** `--iiif-input-bg`, `--iiif-input-border`, `--iiif-input-placeholder`

**Layout:** `--iiif-toolbar-height`, `--iiif-toolbar-btn-min-width`, `--iiif-toolbar-offset`, `--iiif-nav-btn-size`, `--iiif-canvas-nav-width`, `--iiif-canvas-nav-max-height`, `--iiif-toc-min-width`, `--iiif-toc-max-width`, `--iiif-annotation-max-height`

**Typography:** `--iiif-font-family`, `--iiif-font-mono`

**Transitions:** `--iiif-transition-duration`, `--iiif-transition-fast`

## Presets

Three built-in presets configure which UI elements are available:

| Preset | Toolbar | Panels | Compare | Overlays |
|---|---|---|---|---|
| `minimal` | No | None | No | No |
| `viewer` | Yes | Navigation, Pages, Map, Settings | No | Yes |
| `full` | Yes | All | Yes | Yes |

```ts
IIIFViewer.create(container, url, { preset: 'minimal' });
```

Individual options override preset defaults.

## Responsive Panel Visibility

Each panel can be configured differently for desktop, tablet, and mobile breakpoints:

```ts
const viewer = await IIIFViewer.create(container, url, {
  panels: {
    // Simple string - same on all breakpoints
    navigation: 'show',

    // Responsive object - different per breakpoint
    pages: { desktop: 'show', tablet: 'show-closed', mobile: 'hide' },
    minimap: { desktop: 'show', mobile: 'hide' },
    annotations: { desktop: 'show', tablet: 'hide' },
    settings: { desktop: 'show-closed', mobile: 'hide' },
    manifest: 'show-closed',
  },
});
```

### Breakpoints

| Breakpoint | Width |
|---|---|
| `mobile` | <= 480px |
| `tablet` | 481px - 1024px |
| `desktop` | > 1024px |

Omitted breakpoints fall back to the next larger size: `mobile` falls back to `tablet`, which falls back to `desktop`. If `desktop` is omitted it defaults to `'show'`.

### Visibility Values

| Value | Behavior |
|---|---|
| `'show'` | Panel visible and expanded |
| `'show-closed'` | Panel visible but collapsed |
| `'show-open'` | Alias for `'show'` |
| `'hide'` | Panel hidden at this breakpoint |

## Minimap

The Map panel provides a thumbnail overview of the current canvas with a draggable viewport rectangle for quick navigation.

- Click or drag anywhere on the minimap to navigate
- Viewport rectangle shows the current visible area in real time
- **Rotate** — 90 degree clockwise and counter-clockwise rotation
- **Mirror** — horizontal and vertical flip

All transforms work across all three renderers and input controls automatically compensate so panning and zooming remain natural.

The Map panel can be toggled at runtime from the Settings panel.

## Comparison Mode

```ts
// Enter comparison mode
await viewer.enterCompareMode();

// Exit
viewer.exitCompareMode();
```

Comparison mode creates synchronized side-by-side viewers. Configure via the Compare panel or programmatically.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Fit to view |
| Arrow keys | Pan |
| `PageUp` / `[` | Previous canvas |
| `PageDown` / `]` | Next canvas |
| `F` | Toggle fullscreen |

## Cleanup

```ts
viewer.destroy();
```

Removes all event listeners, stops the render loop, and cleans up GPU resources.

## Browser Support

| Renderer | Requirements |
|---|---|
| WebGPU | Chrome 113+, Edge 113+, Firefox behind flag |
| WebGL | All modern browsers |
| Canvas 2D | All browsers (fallback) |

The viewer automatically selects the best available renderer when using `renderer: 'auto'` (default).

## License

[MIT](LICENSE)
