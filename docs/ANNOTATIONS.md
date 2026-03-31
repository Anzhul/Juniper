# Annotations

The viewer supports two categories of annotations: **IIIF annotations** parsed from manifests, and **custom annotations** created programmatically via the viewer API.

---

## IIIF Annotations

IIIF annotations follow the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) and are embedded in or linked from IIIF manifests. The viewer parses both Presentation API v2 and v3 formats.

### Target Types

Each annotation targets a region of the canvas. The viewer supports four target shapes:

| Target | Selector | Rendering |
|--------|----------|-----------|
| **Rectangle** | `FragmentSelector` with `xywh=x,y,w,h` | Colored border and background fill |
| **SVG** | `SvgSelector` with inline SVG markup | Parsed SVG rendered at the target bounds; shapes inherit motivation colors when unstyled |
| **Point** | `PointSelector` with `x`, `y` coordinates | Teardrop pin marker; does not scale with zoom |
| **Full canvas** | No selector, or target is just the canvas URI | Covers the entire canvas |

### Body

An annotation can have one or more bodies describing its content:

| Field | Description |
|-------|-------------|
| `value` | The text or HTML content |
| `format` | `text/plain` (default) or `text/html` for rich content |
| `type` | `TextualBody`, `Image`, etc. |
| `language` | Language code (e.g. `en`, `fr`) |
| `id` | URI reference for linked bodies |

HTML bodies are rendered with formatting preserved in the hover label. Dangerous tags (`<script>`, `<iframe>`, `<object>`, `<embed>`) and event handler attributes are sanitized.

### Motivation

The motivation describes why the annotation was created. Each motivation gets a distinct color for its border and background:

| Motivation | Border Color | Usage |
|------------|-------------|-------|
| commenting | `#ff9800` (orange) | General commentary |
| tagging | `#4caf50` (green) | Keywords or categories |
| describing | `#9c27b0` (purple) | Descriptive text about the target |
| highlighting | `#ffeb3b` (yellow) | Drawing attention to a region |
| bookmarking | `#2196f3` (blue) | Saving a reference point |
| linking | `#00bcd4` (cyan) | Linking to external resources |
| questioning | `#ff5722` (deep orange) | Questions about the target |
| classifying | `#607d8b` (blue-grey) | Formal classification |
| editing | `#795548` (brown) | Suggested edits |
| identifying | `#e91e63` (pink) | Identifying depicted content |
| *(unknown)* | `#f44336` (red) | Fallback for unrecognized motivations |

Open Annotation (`oa:`) prefixed variants (v2 format) map to the same colors.

### Optional Metadata

| Field | Description |
|-------|-------------|
| `creator` | Name or URI of the annotation's author |
| `created` | ISO 8601 timestamp |
| `stylesheet` | CSS stylesheet for custom styling (`type` + `value`) |
| `styleClass` | CSS class name referencing the stylesheet |

### Annotation Pages

Annotations are grouped into pages (AnnotationPage in v3, AnnotationList in v2). Each page appears as a row in the Annotations panel with:

- A **color swatch** derived from the dominant motivation
- A **label** summarizing the motivation type and count (e.g. "Commenting (5)")
- An **eye toggle** to show/hide all annotations in that page

Pages can be embedded inline in the manifest or referenced as external URLs that are fetched on demand.

### SVG Security

SVG content from external manifests is sanitized after DOM parsing:

- `<script>`, `<foreignObject>`, `<iframe>`, `<object>`, `<embed>` elements are removed
- All `on*` event handler attributes are stripped from every element

---

## Custom Annotations

Custom annotations are created via the viewer's public API and are independent of the IIIF manifest.

### API

```typescript
// Add an annotation — returns the annotation ID
const id = viewer.addAnnotation(x, y, width, height, element?, options?);

// Remove by ID
viewer.removeAnnotation(id);

// Clear all custom annotations
viewer.clearAnnotations();
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | `number` | X position in world (image) coordinates |
| `y` | `number` | Y position in world (image) coordinates |
| `width` | `number` | Width in world coordinates |
| `height` | `number` | Height in world coordinates |
| `element` | `HTMLElement \| string` | Optional content — an HTML element or text string |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `string` | auto-generated | Custom identifier for later removal |
| `style` | `Record<string, string>` | — | CSS properties applied to the annotation box (e.g. `{ border: '3px solid red' }`) |
| `scaleWithZoom` | `boolean \| { min, max }` | `true` | `false` = fixed size; `{ min, max }` = scales with zoom, clamped between bounds |
| `popup` | `string \| HTMLElement` | — | Popup content shown on click (rendered as independent div, not clipped by annotation) |
| `popupPosition` | `{ x, y }` | `{ x: 8, y: 0 }` | Popup offset from annotation's top-right corner |
| `popupScale` | `{ min, max }` | — | Clamp popup scale between bounds (e.g. `{ min: 0.5, max: 2 }`) |

### Examples

```typescript
// Simple text annotation
viewer.addAnnotation(100, 200, 300, 50, 'This region is interesting');

// HTML element with custom styling
const el = document.createElement('div');
el.innerHTML = '<strong>Note:</strong> damage visible here';
viewer.addAnnotation(500, 300, 200, 100, el, {
    id: 'damage-note',
    style: { border: '2px dashed #ff0000', backgroundColor: 'rgba(255,0,0,0.1)' },
});

// Fixed-size marker that doesn't scale
viewer.addAnnotation(750, 400, 20, 20, undefined, {
    scaleWithZoom: false,
    style: { borderRadius: '50%', backgroundColor: '#00ff00' },
});

// Clamped scaling — scales with zoom but never smaller than 0.5x or larger than 3x
viewer.addAnnotation(200, 100, 40, 40, undefined, {
    scaleWithZoom: { min: 0.5, max: 3 },
    style: { borderRadius: '50%', backgroundColor: '#ff9800' },
});

// Annotation with a popup (and clamped popup scaling)
viewer.addAnnotation(500, 500, 0, 0, 'pin', {
    scaleWithZoom: false,
    popup: '<h4>Point of Interest</h4><p>Detailed description here</p>',
    popupScale: { min: 0.5, max: 2 },
});

// Remove it later
viewer.removeAnnotation('damage-note');
```
