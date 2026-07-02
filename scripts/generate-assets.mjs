/**
 * Waya Marketing Asset Generator
 *
 * Requires GEMINI_API_KEY in .env.local with access to an image-capable model.
 *
 * The current free-tier Gemini API key only supports text generation.
 * To generate images you need:
 *   - A paid Google Cloud API key with Vertex AI + Imagen access, OR
 *   - A Replicate / Stability AI / OpenAI key
 *
 * Until then, SVG placeholders in public/illustrations/ are used.
 *
 * Usage: node scripts/generate-assets.mjs
 */

import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

process.loadEnvFile(resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env.local'));

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '..', 'public', 'illustrations');

const STYLE_WRAPPER =
  'A premium, ultra-modern, flat 2D vector graphic for a high-end tech application. Designed for a 14-16 age demographic. Must have "soul"—use dynamic compositions, floating geometry, and vibrant energy. STRICTLY PROHIBITED: No basic/boring corporate icons, no 3D rendering, no soft childish cartoons, no gradients, no drop shadows. Colors: Icy Electric Blue, Vivid Cyan, and deep obsidian. Razor-sharp geometric line art, solid pure white background.';

const ASSETS = [
  { filename: 'hero-cyber-guide.webp', prompt: 'An abstract, sleek, multi-layered cyber-guide mask or geometric prism anchoring a sprawling web of sharp glowing node connections.' },
  { filename: 'subject-math.webp', prompt: 'A pristine, ultra-clean composition of floating razor-thin geometric matrices, a clean compass device, and absolute layout precision.' },
  { filename: 'subject-science.webp', prompt: 'A sharp flat-vector digital DNA double helix cleanly interlocking with a futuristic holographic computer circuit layout.' },
  { filename: 'subject-history.webp', prompt: 'A highly streamlined, minimalist structural monolithic pillar splitting open to reveal a crisp neon timeline stream map.' },
  { filename: 'subject-arts.webp', prompt: 'A sharp, high-contrast digital audio vector wavelength fusing cleanly into a modern design stylus vector blueprint.' },
  { filename: 'mascot-cyber-guide.webp', prompt: 'A sleek, slightly abstract geometric cyber-companion. Think of a sharp, modern, stylized holographic origami fox or a floating geometric prism with a subtle glowing eye. It must look cool, highly intelligent, and futuristic.' },
  { filename: 'icon-gaming.webp', prompt: 'A stylized gamepad shattering into floating digital blocks or glowing neon pixels.' },
  { filename: 'icon-music.webp', prompt: 'A sleek headphone silhouette wrapped in a vibrant, pulsing geometric audio wave.' },
  { filename: 'icon-movies.webp', prompt: 'A floating director\'s clapperboard with a glowing neon film strip weaving dynamically through it.' },
  { filename: 'icon-anime.webp', prompt: 'A high-energy manga speed-line burst intersecting with a glowing geometric shuriken.' },
  { filename: 'icon-content.webp', prompt: 'A sleek streaming microphone bathed in a vibrant, floating neon ring-light glow.' },
  { filename: 'icon-fashion.webp', prompt: 'A high-end, futuristic streetwear sneaker floating among sharp geometric shapes.' },
  { filename: 'icon-art.webp', prompt: 'A digital stylus sweeping a vibrant, fluid ribbon of geometric color across the canvas.' },
  { filename: 'icon-cooking.webp', prompt: 'A sleek chef\'s whisk creating a dynamic, glowing tornado of geometric ingredients.' },
  { filename: 'icon-reading.webp', prompt: 'A floating open book with glowing, energetic data particles rising from the pages.' },
  { filename: 'icon-sports.webp', prompt: 'A stylized, aerodynamic basketball leaving a glowing neon motion trail.' },
  { filename: 'icon-cars.webp', prompt: 'A sleek, aggressive silhouette of a modern sports car wheel locked with glowing neon tire tracks.' },
  { filename: 'icon-tech.webp', prompt: 'A minimalist processor chip with vibrant, electric neon circuit paths expanding outward.' },
];

async function generate() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Check what models are available
  console.log('Checking available models...');
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    const imageModels = (listData.models || []).filter((m) =>
      m.supportedGenerationMethods?.includes('generateContent') &&
      m.name?.includes('imagen'),
    );
    if (imageModels.length > 0) {
      console.log(`  Found image models: ${imageModels.map((m) => m.name).join(', ')}`);
    } else {
      console.log('  No Imagen models available on this API key.');
      console.log('  SVG placeholders will be used instead.');
      console.log('\n  To generate real assets, use a paid Google Cloud key with Imagen access.\n');
    }
  } catch { /* skip */ }

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const asset of ASSETS) {
    const fullPrompt = `${STYLE_WRAPPER}\n\n${asset.prompt}`;
    const outputPath = resolve(OUTPUT_DIR, asset.filename);

    console.log(`\n[SKIP] ${asset.filename} — SVG placeholder in use`);
    console.log(`  Prompt: ${fullPrompt.slice(0, 120)}...`);
  }

  console.log('\nDone. SVG placeholders remain in public/illustrations/.\n');
  console.log('To generate actual Gemini images:');
  console.log('  1. Get a paid Google Cloud API key with Imagen access');
  console.log('  2. Update GEMINI_API_KEY in .env.local');
  console.log('  3. Update this script to use the Imagen model');
  console.log('  4. Run node scripts/generate-assets.mjs');
}

generate();
