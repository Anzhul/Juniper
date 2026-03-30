import './IIIF/ui/iiif-styles.css';

// Main viewer and types
export { IIIFViewer, PanelManager, setupInputHandlers } from './IIIF/iiif';
export type { IIIFViewerOptions, IIIFViewerPanels, PanelVisibility, PanelVisibilityConfig, ResponsivePanelVisibility, LayoutState, ViewerConfig, ViewerConfigImage, ViewerConfigAnnotation, LookAtOptions, FitBoundsOptions, CameraConfig } from './IIIF/types';

// Annotation types
export type { OverlayElement } from './IIIF/features/iiif-overlay';
export type { CustomAnnotation, Annotation, IIIFAnnotation } from './IIIF/features/iiif-annotations';

// Parser types
export type { WorldPlacement } from './IIIF/core/iiif-world';
export type { ParsedRange, ParsedManifestMetadata, ParsedMetadataItem } from './IIIF/iiif-parser';

// Comparison types
export type { CompareEntry, CompareOptions } from './IIIF/types';

// Events
export { ViewerEventEmitter } from './IIIF/core/iiif-events';
export type { ViewerEventMap } from './IIIF/core/iiif-events';

// Renderer interface
export type { IIIFRenderer } from './IIIF/rendering/iiif-renderer';

// Configuration
export { CAMERA_CONFIG, TILE_CONFIG, PANEL_CONFIG, COMPARE_CONFIG, CV_CONFIG, VIEWER_PRESETS } from './IIIF/config';
