import './style.scss'
import { IIIFViewer } from '../src/IIIF/iiif';
import type { ViewerConfig } from '../src/IIIF/types';

const container = document.getElementById('iiif-container');
if (container) {
    const params = new URLSearchParams(window.location.search);
    const manifestUrl = params.get('manifest');
    const configParam = params.get('config'); // URL to a config JSON file

    const defaultManifest = 'https://iiif.harvardartmuseums.org/manifests/object/299843';
    const url = manifestUrl ?? defaultManifest;

    const viewer = new IIIFViewer(container, {
        panels: {
            settings: 'show-closed',
            navigation: 'show',
            pages: 'show',
            manifest: 'show-closed',
            annotations: 'show',
            compare: 'show',
            gesture: 'show-closed'
        },
        enableOverlays: true
    });

    // Expose viewer globally for debugging/testing
    (window as any).viewer = viewer;

    viewer.listen();
    viewer.startRenderLoop();

    // Load from config JSON URL if provided, otherwise use manifest URL
    const loadPromise = configParam
        ? fetch(configParam)
            .then(res => res.json())
            .then((config: ViewerConfig) => viewer.loadConfig(config))
        : viewer.loadUrl(url);

    loadPromise
        .then(() => {
            // Helper: create a white circle with an expanding ripple ring
            // Size is in world (image pixel) units — the overlay manager scales it
            const makeCircle = () => {
                const el = document.createElement('div');
                el.style.width = '100%';
                el.style.height = '100%';
                el.style.position = 'relative';
                el.style.cursor = 'pointer';
                el.innerHTML = `
                    <div style="
                        position:absolute; inset:15%;
                        background: radial-gradient(circle, #ffffff, #ffffffcc);
                        border-radius: 50%;
                        border: 2px solid rgba(255, 255, 255, 0.6);
                        box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
                    "></div>
                    <div style="
                        position:absolute; inset:0;
                        border-radius:50%;
                        border: 2px solid rgba(255, 255, 255, 0.8);
                        transform-origin: center center;
                        animation: iiif-ann-ripple 2s ease-out infinite;
                    "></div>
                `;
                return el;
            };

            // Helper: create a popup panel with custom HTML content
            const makePopup = (title: string, body: string) => {
                const el = document.createElement('div');
                el.innerHTML = `
                    <h4 style="margin:0 0 8px; font-family:sans-serif;">${title}</h4>
                    ${body}
                `;
                return el;
            };

            // 1. Circle with image popup
            viewer.addAnnotation(300, 200, 16, 16, makeCircle(), {
                targetUrl: url, targetPage: 0,
                id: 'circle-1',
                type: 'Circles',
                color: '#ffffff',
                scaleWithZoom: true,
                style: { overflow: 'visible' },
                activeClass: 'iiif-ann-translate-in',
                inactiveClass: 'iiif-ann-translate-out',
                popup: makePopup('Detail View', `
                    <img src="https://iiif.harvardartmuseums.org/manifests/object/299843/canvas/canvas-47174896/thumbnail"
                         alt="Detail" style="width:100%; border-radius:4px;" />
                    <p style="margin:8px 0 0; font-size:13px; font-family:sans-serif;">
                        A closer look at this area of the artwork.
                    </p>
                `),
                popupPosition: { x: 38, y: 0 },
            });

            // 2. Circle with animated gradient popup
            viewer.addAnnotation(800, 150, 16, 16, makeCircle(), {
                targetUrl: url, targetPage: 0,
                id: 'circle-2',
                type: 'Circles',
                color: '#ffffff',
                scaleWithZoom: true,
                style: { overflow: 'visible' },
                activeClass: 'iiif-ann-translate-in',
                inactiveClass: 'iiif-ann-translate-out',
                popup: makePopup('Color Analysis', `
                    <div style="
                        width:100%; height:80px; border-radius:6px;
                        background: linear-gradient(270deg, #00e5ff, #764ba2, #ff6b6b, #00e5ff);
                        background-size: 600% 600%;
                        animation: iiif-ann-gradient-shift 4s ease infinite;
                    "></div>
                    <p style="margin:8px 0 0; font-size:12px; font-family:sans-serif; opacity:0.8;">
                        Animated palette extracted from this region.
                    </p>
                `),
                popupPosition: { x: 38, y: 0 },
            });

            // 3. Circle with text description popup
            viewer.addAnnotation(1100, 500, 16, 16, makeCircle(), {
                targetUrl: url, targetPage: 0,
                id: 'circle-3',
                type: 'Circles',
                color: '#ffffff',
                scaleWithZoom: true,
                style: { overflow: 'visible' },
                activeClass: 'iiif-ann-translate-in',
                inactiveClass: 'iiif-ann-translate-out',
                popup: makePopup('Technique', `
                    <p style="margin:0 0 6px; font-size:13px; font-family:sans-serif; line-height:1.5;">
                        The brushwork in this area shows a layered impasto technique,
                        building up texture through successive applications of paint.
                    </p>
                    <p style="margin:0; font-size:12px; font-family:sans-serif; opacity:0.6;">
                        Oil on canvas, circa 1880
                    </p>
                `),
                popupPosition: { x: 38, y: 0 },
            });

            // 4. Circle with comparison layout popup
            viewer.addAnnotation(500, 600, 16, 16, makeCircle(), {
                targetUrl: url, targetPage: 0,
                id: 'circle-4',
                type: 'Circles',
                color: '#ffffff',
                scaleWithZoom: true,
                style: { overflow: 'visible' },
                activeClass: 'iiif-ann-translate-in',
                inactiveClass: 'iiif-ann-translate-out',
                popup: makePopup('Before & After', `
                    <div style="display:flex; gap:8px;">
                        <div style="
                            flex:1; height:80px; border-radius:4px;
                            background:#2a2a2a; display:flex; align-items:center; justify-content:center;
                            color:#888; font-size:11px; font-family:sans-serif;
                        ">Before restoration</div>
                        <div style="
                            flex:1; height:80px; border-radius:4px;
                            background:#3a3a3a; display:flex; align-items:center; justify-content:center;
                            color:#aaa; font-size:11px; font-family:sans-serif;
                        ">After restoration</div>
                    </div>
                `),
                popupPosition: { x: 38, y: 0 },
            });

            // 5. Circle with link list popup
            viewer.addAnnotation(200, 700, 16, 16, makeCircle(), {
                targetUrl: url, targetPage: 0,
                id: 'circle-5',
                type: 'Circles',
                color: '#ffffff',
                scaleWithZoom: true,
                style: { overflow: 'visible' },
                activeClass: 'iiif-ann-translate-in',
                inactiveClass: 'iiif-ann-translate-out',
                popup: makePopup('Related Works', `
                    <ul style="margin:0; padding:0 0 0 16px; font-size:13px; font-family:sans-serif; line-height:2;">
                        <li><a href="https://harvardartmuseums.org" target="_blank" style="color:#4fc3f7;">Study sketch (1878)</a></li>
                        <li><a href="https://harvardartmuseums.org" target="_blank" style="color:#4fc3f7;">Companion piece</a></li>
                        <li><a href="https://harvardartmuseums.org" target="_blank" style="color:#4fc3f7;">Artist biography</a></li>
                    </ul>
                `),
                popupPosition: { x: 38, y: 0 },
            });

            // 6. Circle with stats popup
            viewer.addAnnotation(900, 750, 16, 16, makeCircle(), {
                targetUrl: url, targetPage: 0,
                id: 'circle-6',
                type: 'Circles',
                color: '#ffffff',
                scaleWithZoom: true,
                style: { overflow: 'visible' },
                activeClass: 'iiif-ann-translate-in',
                inactiveClass: 'iiif-ann-translate-out',
                popup: makePopup('Condition Report', `
                    <div style="font-family:sans-serif; font-size:13px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>Surface wear</span>
                            <span style="color:#ff9800; font-weight:600;">Moderate</span>
                        </div>
                        <div style="height:6px; background:#333; border-radius:3px; overflow:hidden; margin-bottom:12px;">
                            <div style="width:55%; height:100%; background:linear-gradient(90deg, #4caf50, #ff9800); border-radius:3px;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>Color fidelity</span>
                            <span style="color:#4caf50; font-weight:600;">Good</span>
                        </div>
                        <div style="height:6px; background:#333; border-radius:3px; overflow:hidden;">
                            <div style="width:82%; height:100%; background:linear-gradient(90deg, #4caf50, #8bc34a); border-radius:3px;"></div>
                        </div>
                    </div>
                `),
                popupPosition: { x: 38, y: 0 },
            });

            // Start view
            viewer.lookAt([600, 'hm'], { fit: 'width' });
        })
        .catch((error) => console.error('Error loading:', error));
}
