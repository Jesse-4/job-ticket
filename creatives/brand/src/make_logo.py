"""Generate the Job Ticket logo set as SVG (text converted to outlines).

Usage: python3 make_logo.py FONT_DIR OUT_DIR
FONT_DIR holds bricolage-800.ttf (Bricolage Grotesque ExtraBold, 96pt optical size)
and dmmono-500.ttf (DM Mono Medium), both from Google Fonts (OFL).
Needs: pip install fonttools uharfbuzz
"""
import os
import sys

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

CARBON, CARBON_HI, CARBON_LO = "#2f45c4", "#3d56dc", "#22349a"
CREAM, INK = "#fffdf2", "#161a2b"

# ---------- the mark: a work-order ticket with side notches, perforation and a check (1000-unit box)
X0, X1, Y0, Y1, R = 300, 700, 205, 795, 44
NY, NR = 395, 38  # notch centre line and radius


def ticket_path(dx=0, dy=0):
    x0, x1, y0, y1, ny = X0 + dx, X1 + dx, Y0 + dy, Y1 + dy, NY + dy
    return (f"M{x0 + R},{y0} H{x1 - R} A{R},{R} 0 0 1 {x1},{y0 + R} V{ny - NR} "
            f"A{NR},{NR} 0 0 0 {x1},{ny + NR} V{y1 - R} A{R},{R} 0 0 1 {x1 - R},{y1} "
            f"H{x0 + R} A{R},{R} 0 0 1 {x0},{y1 - R} V{ny + NR} A{NR},{NR} 0 0 0 {x0},{ny - NR} "
            f"V{y0 + R} A{R},{R} 0 0 1 {x0 + R},{y0} Z")


def mark(shadow=True, paper=CREAM, accent=CARBON, lines=INK, shadow_color=CARBON_LO):
    """The ticket, tilted, as SVG elements in a 1000x1000 box."""
    parts = []
    if shadow:
        parts.append(f'<path d="{ticket_path(18, 26)}" fill="{shadow_color}" opacity="0.55"/>')
    parts.append(f'<path d="{ticket_path()}" fill="{paper}"/>')
    # Perforation: round dots between the notches.
    parts.append(f'<line x1="{X0 + NR + 30}" y1="{NY}" x2="{X1 - NR - 30}" y2="{NY}" stroke="{accent}" '
                 f'stroke-width="13" stroke-linecap="round" stroke-dasharray="0.1 30.9"/>')
    # The stub: two written lines.
    parts.append(f'<rect x="{X0 + 64}" y="268" width="196" height="30" rx="15" fill="{lines}"/>')
    parts.append(f'<rect x="{X0 + 64}" y="320" width="122" height="30" rx="15" fill="{lines}" opacity="0.35"/>')
    # The body: a bold check.
    parts.append(f'<path d="M398,600 L470,672 L606,522" fill="none" stroke="{accent}" stroke-width="66" '
                 f'stroke-linecap="round" stroke-linejoin="round"/>')
    return f'<g transform="rotate(-8 500 500)">{"".join(parts)}</g>'


def gradient(id_):
    return (f'<linearGradient id="{id_}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="{CARBON_HI}"/><stop offset="0.55" stop-color="{CARBON}"/>'
            f'<stop offset="1" stop-color="{CARBON_LO}"/></linearGradient>')


# ---------- text to outlines
class Font:
    def __init__(self, path):
        self.tt = TTFont(path)
        self.upem = self.tt["head"].unitsPerEm
        blob = hb.Blob.from_file_path(path)
        self.hbfont = hb.Font(hb.Face(blob))
        self.gs = self.tt.getGlyphSet()
        self.order = self.tt.getGlyphOrder()

    def path(self, text, size, x, y, tracking=0.0):
        """SVG path data for text with its baseline at y, starting at x. Returns (d, width)."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hbfont, buf, {"kern": True, "liga": True})
        s = size / self.upem
        pen = SVGPathPen(self.gs)
        cx = 0
        n = len(buf.glyph_infos)
        for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
            name = self.order[info.codepoint]
            tp = TransformPen(pen, (s, 0, 0, -s, x + (cx + pos.x_offset) * s, y - pos.y_offset * s))
            self.gs[name].draw(tp)
            cx += pos.x_advance + (tracking * self.upem if i < n - 1 else 0)
        return pen.getCommands(), cx * s


def svg(w, h, body, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'{"<defs>" + defs + "</defs>" if defs else ""}{body}</svg>\n')


def main(font_dir, out):
    os.makedirs(out, exist_ok=True)
    display = Font(os.path.join(font_dir, "bricolage-800.ttf"))
    mono = Font(os.path.join(font_dir, "dmmono-500.ttf"))
    files = {}

    # App-icon style square (rounded) and the full-bleed profile picture.
    files["job-ticket-icon.svg"] = svg(1000, 1000, f'<rect width="1000" height="1000" rx="224" fill="url(#g)"/>{mark()}', gradient("g"))
    files["tiktok-profile.svg"] = svg(1000, 1000, f'<rect width="1000" height="1000" fill="url(#g)"/>'
                                      f'<g transform="translate(500 500) scale(1.0) translate(-500 -500)">{mark()}</g>', gradient("g"))
    # Mark alone on transparent, for light and dark backgrounds.
    files["job-ticket-mark-blue.svg"] = svg(1000, 1000, mark(shadow=False, paper=CARBON, accent=CREAM, lines=CREAM))
    files["job-ticket-mark-cream.svg"] = svg(1000, 1000, mark(shadow=False))

    # Horizontal lockups: icon + wordmark.
    def horizontal(text_color, sub_color):
        icon_h = 300
        size = 236
        word, ww = display.path("Job Ticket", size, 0, 0, tracking=-0.004)
        gap, pad = 70, 0
        tx = icon_h + gap
        word, ww = display.path("Job Ticket", size, tx, 197, tracking=-0.004)
        tag, tw = mono.path("QUOTES & INVOICES", 50, tx + 6, 277, tracking=0.12)
        w = int(tx + max(ww, tw) + 10)
        icon = (f'<g transform="scale({icon_h / 1000})"><rect width="1000" height="1000" rx="224" fill="url(#g)"/>{mark()}</g>')
        body = icon + f'<path d="{word}" fill="{text_color}"/><path d="{tag}" fill="{sub_color}"/>'
        return svg(w, icon_h, body, gradient("g"))

    files["job-ticket-logo-horizontal.svg"] = horizontal(INK, CARBON)
    files["job-ticket-logo-horizontal-on-dark.svg"] = horizontal(CREAM, "#9fb0ff")

    # Stacked lockup: icon over wordmark, centered.
    def stacked(text_color, sub_color):
        w = 1200
        icon = 420
        word_probe, ww = display.path("Job Ticket", 200, 0, 0, tracking=-0.004)
        word, _ = display.path("Job Ticket", 200, (w - ww) / 2, icon + 230, tracking=-0.004)
        tag_probe, tw = mono.path("QUOTES & INVOICES", 46, 0, 0, tracking=0.12)
        tag, _ = mono.path("QUOTES & INVOICES", 46, (w - tw) / 2, icon + 320, tracking=0.12)
        ic = (f'<g transform="translate({(w - icon) / 2} 0) scale({icon / 1000})">'
              f'<rect width="1000" height="1000" rx="224" fill="url(#g)"/>{mark()}</g>')
        return svg(w, icon + 350, ic + f'<path d="{word}" fill="{text_color}"/><path d="{tag}" fill="{sub_color}"/>', gradient("g"))

    files["job-ticket-logo-stacked.svg"] = stacked(INK, CARBON)
    files["job-ticket-logo-stacked-on-dark.svg"] = stacked(CREAM, "#9fb0ff")

    for name, data in files.items():
        with open(os.path.join(out, name), "w") as f:
            f.write(data)
        print(name)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
