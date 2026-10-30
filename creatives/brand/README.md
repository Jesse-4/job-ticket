# Job Ticket logo

The mark is a work-order ticket: notched sides, a dotted perforation, two written lines on the stub and a check. In plain terms, the job's written up and done. It's built from the app's own colors and type, and it's designed to stay readable as a small circle on TikTok.

## Which file to use

| Use | File |
|-----|------|
| **TikTok profile photo** (also Instagram, Facebook, YouTube) | `tiktok-profile-picture.png`: 1080×1080, full-bleed blue, ticket centered for the circle crop |
| App icon, favicon, square spots | `job-ticket-icon.png` (rounded square, transparent corners) |
| Light backgrounds: website, PDFs, flyers, video end cards | `job-ticket-logo-horizontal.png` or `job-ticket-logo-stacked.png` |
| Dark backgrounds | `…-on-dark.png` versions |
| Watermark or sticker on photos and videos | `job-ticket-mark-cream.png` (dark footage) or `job-ticket-mark-blue.png` (light footage) |
| Print, signs, truck decals, anything that must scale | The matching `.svg` files. Text is converted to outlines, so no fonts are needed. |

**Setting the TikTok photo:** Profile → Edit profile → Change photo → upload `tiktok-profile-picture.png`. Don't zoom when TikTok shows the circle; the file is already framed for it.

## Colors

| Name | Hex | Use |
|------|-----|-----|
| Carbon blue | `#2f45c4` | Main brand color (gradient `#3d56dc` → `#22349a`) |
| Paper cream | `#fffdf2` | The ticket, light backgrounds |
| Ink | `#161a2b` | Wordmark on light backgrounds |
| Soft blue | `#9fb0ff` | Tagline on dark backgrounds |

**Type:** Bricolage Grotesque ExtraBold for the wordmark and DM Mono for the tagline. Both are free Google Fonts under the Open Font License.

## Keep it looking right
- Leave clear space around the logo of at least half the icon's width.
- Don't stretch it, recolor the ticket, add outlines or shadows, or set "Job Ticket" in a different font.
- Below about 120 px wide, use the icon or mark alone instead of a lockup.

## Regenerating

```bash
pip install fonttools uharfbuzz
# put bricolage-800.ttf (Bricolage Grotesque 96pt ExtraBold) and dmmono-500.ttf (DM Mono Medium) in a folder, then:
python3 src/make_logo.py /path/to/fonts .
node src/render_png.js
```
