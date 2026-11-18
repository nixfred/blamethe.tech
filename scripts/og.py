#!/usr/bin/env python3
"""Share card (link preview) for blamethe.tech.

Renders public/og.png (1200x630) with headless Chrome from an HTML template,
then injects one set of OG/Twitter tags into public/index.html and public/404.html.
The image URL is cache-busted by the first 8 hex of its sha256.
"""
from __future__ import annotations
import hashlib
import html as H
import re
import subprocess
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PUB = REPO / "public"
SITE = "https://blamethe.tech"
TITLE = "blamethe.tech: the problem is Windows"
DESC = "A sourced, funny-savage look at why Windows is a worse daily driver than Omarchy, with macOS in the middle. An opinion site by Fred Nix."
ALT = "Share card for blamethe.tech: a fake Blue Screen of Death that reads Your PC ran into a problem. The problem is Windows."
THEME = "#0b3cc8"
CHROME = "google-chrome"


def card_html() -> str:
    fonts = (PUB / "assets/fonts").resolve().as_uri()
    logo = (PUB / "assets/brand/nixfred-icon.svg").resolve().as_uri()
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Geist;src:url("{fonts}/geist-latin-wght.woff2") format("woff2");font-weight:100 900}}
@font-face{{font-family:Tektur;src:url("{fonts}/tektur-latin-wght.woff2") format("woff2");font-weight:400 900}}
@font-face{{font-family:Plex;src:url("{fonts}/ibm-plex-mono-bold.woff2") format("woff2");font-weight:700}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1200px;height:630px;overflow:hidden;background:#07060b}}
body{{position:relative;font-family:Geist,sans-serif;color:#f3f7ff}}
.bsod{{position:absolute;inset:0;background:linear-gradient(180deg,#0a34b8 0%,#07248a 100%)}}
.scan{{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);pointer-events:none}}
.face{{position:absolute;left:88px;top:70px;font-size:190px;font-weight:300;line-height:.8;letter-spacing:-10px}}
.main{{position:absolute;left:88px;top:270px;width:740px}}
h1{{font-family:Tektur,sans-serif;font-weight:800;font-size:58px;line-height:1.02;letter-spacing:-1px;max-width:740px}}
.sub{{margin-top:18px;font-size:24px;font-weight:500;color:#d7e4ff;max-width:680px}}
.stop{{position:absolute;left:88px;bottom:72px;font-family:Plex,monospace;font-size:20px;letter-spacing:.06em}}
.logo{{position:absolute;right:90px;top:150px;width:260px;height:260px;filter:drop-shadow(0 0 40px rgba(255,255,255,.25))}}
.host{{position:absolute;right:90px;bottom:72px;font-family:Plex,monospace;font-size:18px;letter-spacing:.14em;color:#d7e4ff}}
</style></head><body>
<div class="bsod"></div><div class="scan"></div>
<div class="face">:(</div>
<img class="logo" src="{logo}" alt="">
<div class="main">
  <h1>Your PC ran into a problem. The problem is Windows.</h1>
  <p class="sub">A sourced rap sheet. Stop blaming yourself.</p>
</div>
<div class="stop">STOP CODE: BLAME_THE_TECH</div>
<div class="host">BLAMETHE.TECH</div>
</body></html>"""


def render() -> str:
    html = card_html()
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "og.html"
        raw = Path(td) / "og.png"
        src.write_text(html, encoding="utf-8")
        subprocess.run(
            [
                CHROME, "--headless=new", "--no-sandbox", "--disable-gpu",
                "--hide-scrollbars", "--force-device-scale-factor=1",
                "--window-size=1200,630", "--virtual-time-budget=3000",
                f"--screenshot={raw}", src.as_uri(),
            ],
            check=True, capture_output=True, timeout=90,
        )
        from PIL import Image
        im = Image.open(raw).convert("RGB")
        assert im.size == (1200, 630), im.size
        out = PUB / "og.png"
        im.save(out, optimize=True)
        if out.stat().st_size > 300_000:
            im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(out, optimize=True)
    digest = hashlib.sha256((PUB / "og.png").read_bytes()).hexdigest()[:8]
    return digest


def tags(img_v: str) -> str:
    e = lambda s: H.escape(s, quote=False).replace('"', "&quot;")
    img = f"{SITE}/og.png?v={img_v}"
    return (
        "<!-- share card (scripts/og.py) -->"
        f'<meta property="og:site_name" content="blamethe.tech">'
        f'<meta property="og:title" content="{e(TITLE)}">'
        f'<meta property="og:description" content="{e(DESC)}">'
        '<meta property="og:type" content="website">'
        f'<meta property="og:url" content="{SITE}/">'
        f'<meta property="og:image" content="{img}">'
        f'<meta property="og:image:secure_url" content="{img}">'
        '<meta property="og:image:type" content="image/png">'
        '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
        f'<meta property="og:image:alt" content="{e(ALT)}">'
        '<meta name="twitter:card" content="summary_large_image">'
        '<meta name="twitter:site" content="@nixfred"><meta name="twitter:creator" content="@nixfred">'
        f'<meta name="twitter:title" content="{e(TITLE)}">'
        f'<meta name="twitter:description" content="{e(DESC)}">'
        f'<meta name="twitter:image" content="{img}">'
        f'<meta name="twitter:image:alt" content="{e(ALT)}">'
        f'<meta name="theme-color" content="{THEME}">'
    )


def inject(path: Path, block: str) -> None:
    text = path.read_text(encoding="utf-8")
    text, n = re.subn(
        r"<!-- SHARE_TAGS -->|<!-- share card \(scripts/og.py\).*?<meta name=\"theme-color\" content=\"[^\"]+\">",
        block,
        text,
        count=1,
        flags=re.S,
    )
    if n != 1:
        raise SystemExit(f"og: could not inject tags into {path.name}")
    path.write_text(text, encoding="utf-8")


def main() -> int:
    ver = render()
    block = tags(ver)
    inject(PUB / "index.html", block)
    inject(PUB / "404.html", block)
    print(f"og: wrote public/og.png v={ver} ({(PUB / 'og.png').stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
