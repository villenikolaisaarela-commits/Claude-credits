# Lähteet

Sivugeneraattorit, joilla villesaarela.com ja konseptisivustot Kallistus ja Lauha on tehty. Jekyll ei julkaise alaviivalla alkavaa kansiota.

- `villesaarela/build.py`: villesaarela.com (`LIVE=1 python3 build.py` kirjoittaa juureen, ilman sitä esikatseluun /esikatselu/uusi-ilme/). Lukee työt ja kysymykset vanhasta generaattorista (ns.py) ja uudet työt tiedostosta `newworks.py`.
- `kallistus/build.py` ja `lauha/build.py`: demot kansioihin /demot/kallistus/ ja /demot/lauha/.
- `proc.py` ja `*.spec`: kuvien rajaus ja sävytys Pexels-alkuperäisistä.
- `mklogo_k.py`, `mklogo_l.py`, `wordpath.py`: logot fonttien ääriviivoista.

Polut viittaavat työympäristön väliaikaiskansioon, joten ne pitää päivittää, jos skriptejä ajetaan muualla.
