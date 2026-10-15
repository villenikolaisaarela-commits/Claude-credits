import json, os, sys
os.chdir(sys.argv[1])
src = open('build.py').read()
src = src.split('\nurls = []')[0]
g = {'__name__': 'x', '__file__': os.path.abspath('build.py')}
exec(src, g)
out = {}
for L in ('fi', 'en'):
    g['LANG'] = L
    works = g['works_list']()
    keys = ['slug','name','title','desc','ala','city','work','site','concept','start','solution','does','made','mobile','credits','short','alt']
    out[L] = {
      'works': [{k: w.get(k) for k in keys} for w in works],
      'terms': g['terms_doc'](),
      'privacy': g['g']['PRIVACY'] if L == 'fi' else [(h, [p.replace('{MAIL}', g['MAIL']).replace('{TEL_H}', g['TEL_H']).replace('{TEL}', g['TEL']) for p in ps]) for h, ps in g['PRIVACY_EN']],
    }
    for k in ('TRADES','STICKERS','DO','FOR','STEPS','ASKS','PAINS','VS','PERKS','REQ','YEAR1','INCLUDED','EXCLUDED','FAQ','REQ_TAG'):
        out[L][k] = g[k][L]
    out[L]['TERMS'] = [list(x) for x in g['terms_list']()] if callable(g.get('terms_list')) else None
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1, default=list)
print('ok', len(out['fi']['works']))
