"""Build index.html (the hosted app) from app.html (the Claude preview version).

Run from the repository root:  python3 tools/build.py
app.html is the source; edit it, then run this.
"""
src = open("app.html", encoding="utf-8").read()
head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Make professional quotes and invoices for your trade business in a minute.">
<meta name="theme-color" content="#2f45c4">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Job Ticket">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script>window.JT_PRINT = true;</script>
"""
i = src.index('<div class="wrap">')
out = head + src[:i] + "</head>\n<body>\n" + src[i:] + "\n</body>\n</html>\n"
open("index.html", "w", encoding="utf-8").write(out)
print("index.html built")
