import sharp from 'sharp'
for (const s of [192, 512]) await sharp('public/icon.svg').resize(s, s).png().toFile(`public/icon-${s}.png`)
