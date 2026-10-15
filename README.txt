LUMA EDIT — STARTER KIT (V0.1)

WHAT THIS IS
A first-stage Progressive Web App (PWA) photo-editor prototype. It processes images locally in the browser and can be hosted for free on GitHub Pages, then added to the iPhone Home Screen.

CURRENT LIMITS
- This is a prototype, not a Lightroom replacement yet.
- RAW .ARW files are not decoded by this starter. A browser-compatible RAW decoder (for example, a properly compiled WebAssembly build of LibRaw) needs to be integrated and tested.
- HEIC/HEIF decoding depends on the browser/device. If it fails, try JPEG.
- Highlights and shadows are approximate, not equivalent to Lightroom's RAW development.
- Very large images can use a lot of memory on an iPhone. Test on copies first.
- The app does not upload your photos, but if you host it on a public GitHub Pages site, the source code and app URL are public. Do not add private photos or credentials to the repository.

FREE INSTALL PATH
1. Extract this ZIP.
2. Create a GitHub account if you do not already have one.
3. Create a NEW PUBLIC repository, for example: luma-edit.
4. Upload the contents of this folder (index.html, style.css, app.js, manifest.webmanifest, sw.js, icon.svg, README.txt) to the repository root.
5. In the repository, open Settings > Pages.
6. Under Build and deployment, choose Deploy from a branch; select main and /(root), then Save.
7. Wait for the published site URL, typically https://YOUR-USERNAME.github.io/luma-edit/.
8. Open that URL in Safari on your iPhone. Tap Share > Add to Home Screen. If offered, enable Open as Web App, then tap Add.
9. Open the app once while online. Then test airplane mode to confirm the cached shell works.

IMPORTANT PRIVACY NOTE
GitHub Pages hosts the app files publicly. Photo editing happens on your device in this prototype, not on GitHub's servers. The app has no analytics or upload code.

NEXT DEVELOPMENT STEPS
1. Improve rendering quality and use a proper image-processing pipeline.
2. Add crop/rotate, HSL, curves, presets, undo/redo, and export options.
3. Evaluate a WebAssembly RAW decoder for Sony A7 III ARW.
4. Add local AI models only if their performance and storage footprint are realistic on iPhone 12.
5. Consider a native iOS app later. Building/signing a native iOS app normally requires Xcode on a Mac.
