"""
Karusel rasmlari uchun Wikimedia Commons metama'lumotini oladi:
scripts/commons/gallery-sources.json -> src/data/gallery.json
(muallif, litsenziya, havola, 1600px eskiz URL, o'lcham). Gerb SVG'lari
public/emblems/ ga yuklanadi (skript va tashqi havola tekshiriladi).

Ishga tushirish: python3 scripts/commons/fetch-gallery.py
"""
import json, re, sys, urllib.parse, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
UA = 'TurkicBilig/0.1 (https://turkicbilig.uz)'
strip = lambda s: re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', s or '')).strip()


def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})))


def main():
    sources = json.loads((ROOT / 'scripts/commons/gallery-sources.json').read_text())
    out = {}
    (ROOT / 'public/emblems').mkdir(exist_ok=True)
    for entity, items in sources.items():
        if entity.startswith('_'):
            continue
        out[entity] = []
        for it in items:
            if 'commons' not in it:  # rasmsiz izoh kartochkasi (masalan, "rasmiy gerbi yo'q")
                out[entity].append({'id': it['id'], 'kind': it['kind']})
                continue
            info = api({'action': 'query', 'titles': it['commons'], 'prop': 'imageinfo', 'redirects': 1,
                        'iiprop': 'url|size|extmetadata', 'iiurlwidth': 1600, 'format': 'json'})
            page = next(iter(info['query']['pages'].values()))
            if 'imageinfo' not in page:
                sys.exit(f"Topilmadi: {it['commons']}")
            ii = page['imageinfo'][0]
            m = ii['extmetadata']
            rec = {
                'id': it['id'],
                'kind': it.get('kind', 'obida'),
                'unescoYear': it.get('unescoYear'),
                'commons': page['title'],
                'sourceUrl': ii['descriptionurl'],
                'author': strip(m.get('Artist', {}).get('value')),
                'license': strip(m.get('LicenseShortName', {}).get('value')),
                'licenseUrl': strip(m.get('LicenseUrl', {}).get('value')) or None,
            }
            if page['title'].lower().endswith('.svg'):
                svg = urllib.request.urlopen(urllib.request.Request(ii['url'], headers={'User-Agent': UA})).read().decode('utf-8')
                if re.search(r'<script|onload=|javascript:|href="http', svg, re.I):
                    sys.exit(f"Xavfli SVG: {page['title']}")
                name = f"{entity.split('/')[1]}-{it['id']}.svg"
                (ROOT / 'public/emblems' / name).write_text(svg)
                rec.update({'src': f'/emblems/{name}', 'width': ii['width'], 'height': ii['height']})
            else:
                rec.update({'src': ii['thumburl'], 'width': ii['thumbwidth'], 'height': ii['thumbheight']})
            out[entity].append(rec)
            print(f"{entity:32} {it['id']:14} {rec['license']:14} {rec['author'][:40]}")
    (ROOT / 'src/data/gallery.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')


main()
