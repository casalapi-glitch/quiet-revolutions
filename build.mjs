import { cp, mkdir, rm } from 'node:fs/promises';

// Publish only the browser-facing site. Keep SQL, Supabase function source,
// documentation, and Git metadata out of the Vercel static output.
const publicFiles = [
  'index.html',
  'admin.html',
  'app.js',
  'admin.js',
  'styles.css',
  'admin.css',
  'supabase-config.js',
];

await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
for (const file of publicFiles) await cp(file, `dist/${file}`);
await cp('assets/quiet-revolutions-logo.jpg', 'dist/assets/quiet-revolutions-logo.jpg');
