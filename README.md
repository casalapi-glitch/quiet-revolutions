# Quiet Revolutions — vinyl gallery

This static front end includes the public collection and a protected owner collection desk. It uses Supabase Auth, Postgres, and Storage when configured. The public collection starts empty.

## Connect a free Supabase project

1. Create a Supabase project. The Free plan is currently $0 and includes 1 GB of file storage and a 500 MB database quota; free projects can pause after one week of inactivity. Check the [current plan limits](https://supabase.com/docs/guides/platform/billing-on-supabase) before relying on it for a live café. Staying within the quota avoids usage charges, but Supabase may pause an inactive free project.
2. In **Authentication → Users**, create the owner's account. Keep public sign-ups disabled. Copy the owner's user UUID.
3. Open `supabase.sql`. Replace every `OWNER_AUTH_USER_UUID` with that UUID, then run the complete file once in the Supabase SQL Editor. This creates the albums table, owner-only write policies, and the public album-cover bucket. The bucket is public so customers can view the record sleeves; only the owner UUID can upload or change files.
4. In **Project Settings → API**, copy the Project URL and the **publishable** key (older projects call this the `anon` key). Add them to `supabase-config.js`:

   ```js
   window.QR_SUPABASE_CONFIG = {
     url: 'https://YOUR_PROJECT.supabase.co',
     key: 'YOUR_PUBLISHABLE_OR_ANON_KEY'
   };
   ```

   That file is public website code. Never put a `service_role` or secret key there. The database and storage row security policies protect writes.
5. Put the contents of `outputs` at the root of a GitHub repository, then import that repository in Vercel. Set the framework to **Other**, the build command to `npm run build`, and the output directory to `dist`. The included `build.mjs` copies only the public site into `dist`; database scripts and Edge Function source stay out of the website deployment. Connect GitHub in Vercel to deploy on each push to the production branch. Vercel Hobby is currently free for personal, non-commercial projects; confirm its terms for a café site before using Hobby in production. [Vercel Hobby plan](https://vercel.com/docs/plans/hobby).
6. Note the production Vercel URL, then deploy the MusicBrainz Edge Function. It adds the required application User-Agent. On Windows, install Node.js 20 or later, open a terminal in your local repository folder, and run:

   ```sh
   npx --yes supabase@latest login
   npx --yes supabase@latest link --project-ref YOUR_PROJECT_ID
   npx --yes supabase@latest secrets set QR_PUBLIC_SITE_URL=https://your-project.vercel.app
   npx --yes supabase@latest functions deploy musicbrainz-search
   ```

   Use the exact Vercel origin only, without a trailing slash or path. The function checks the request origin and requires an authenticated Supabase session.
7. Visit your Vercel site's `/admin.html` and sign in with the owner account from step 2. Do not rely on double-click `file://` for camera or database access; use the HTTPS site URL. From the owner desk, add, edit, or delete records. The public page reads published records and shows actual uploaded artwork.

## Adding albums

Use the owner desk at `/admin.html`. The **Scan a sleeve** workflow requests the rear-facing camera on supported phones, with an image upload option if camera access is unavailable. Adjust a square crop by dragging and zooming, then choose **Read cover text with OCR**. Tesseract.js runs in the browser; the captured image is not uploaded until you save it. Correct the recognized text if needed, search MusicBrainz, and choose a possible match. The owner still reviews and edits artist, title, genre, and cover before saving. OCR and matching are suggestions; they can be inaccurate. MusicBrainz may return no result, in which case enter the metadata manually.

Artist, title, and genre are required. Choose a JPEG, PNG, or WebP cover image up to 10 MB. The dashboard checks for duplicate artist/title pairs, uploads the cover, and publishes the record after saving. The database also enforces a case-insensitive unique artist/title pair. Public visitors can read published metadata and cover files; only the configured owner can change the collection. Camera access requires HTTPS (or localhost) and the browser's permission. OCR language data and scripts load from a CDN, so the first scan requires internet access. MusicBrainz requests are manual and spaced at least one second apart to respect its rate limit.

## Branding and limits

The original logo supplied by the owner is saved at `assets/quiet-revolutions-logo.jpg` and used in both public and owner headers with its proportions preserved. The collection starts empty; no sample album records are included. The hero illustration is a room motif, not a record listing.

The gallery and scanner use the Supabase and Tesseract.js JavaScript clients plus Google Fonts via CDNs. A database connection failure leaves the public collection empty and is logged in the browser console. This deliverable does not include automatic artwork-boundary detection, perspective correction, or QR generation. Crop framing is manual; OCR and MusicBrainz matches require owner review.
