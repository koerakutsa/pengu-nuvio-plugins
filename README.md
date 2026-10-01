# PenguStream Ultra — Nuvio Plugins

Eesti kataloogid ja nende streamid paigalda Nuvios **Addons** jaotises:

```
https://raw.githubusercontent.com/koerakutsa/pengu-catalogs/main/manifest.json
```

Nuvio Android TV ei käivita kohalikke JS pluginaid `duoplay:`, `err:` ega
`lasteekraan:` ID-dega. Eesti kataloogi addon avaldab seetõttu streami vastused
otse. DuoPlay ja ERR pluginad proovivad kohandatud ID puhul esmalt GitHubi
`stream/` faili ning kasutavad vajaduse korral lähte-API-d varuvariandina.

## Install

```
https://raw.githubusercontent.com/koerakutsa/pengu-nuvio-plugins/main/manifest.json
```

## Providers

| Provider | Notes |
|----------|--------|
| **VidZee** | Very fast (tik / Hindi) |
| **Vidrock** | Very fast (Atlas ≈ VidZee CDN) |
| **Vixsrc** | API and HLS playlist |
| PlayIMDb | Backup, slower CDN |
| DuoPlay | Eesti saated ja filmid |
| ERR Jupiter | ERRi saated ja filmid |

Videasy, VidSrcME, VidLink ja MovieBlast jäävad manifesti, kuid on vaikimisi
välja lülitatud. Videasy teenus suleti, VidSrcME krüptimise versioon muutus,
VidLinki voolingid vastasid kontrollis HTTP 429-ga ning MovieBlasti voohosti
domeen ei lahene enam. Vanad MP4Hydra ja M4uHD skriptid on repos alles, kuid
neid ei laadita manifestist (M4uHD vajab WebAssembly tuge).

DebugPing on vaikimisi välja lülitatud, sest selle testvideo ei ole kataloogi
saate voog. Värskenda pluginad Nuvios pärast uuendusi.
