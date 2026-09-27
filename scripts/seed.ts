/**
 * Seeds one placeholder document per content type so every section renders.
 * Safe to re-run: documents are created only if they don't already exist.
 *
 *   npm run seed
 *
 * Uses your Sanity CLI login (`npx sanity login`), so no write token is stored.
 */
import { deflateSync } from "node:zlib";

import type { IdentifiedSanityDocumentStub } from "next-sanity";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-09-01" });

// --- Placeholder assets -----------------------------------------------------

/** Solid-color PNG with a soft vertical gradient, built without dependencies. */
function placeholderPng(width: number, height: number, [r, g, b]: [number, number, number]) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const shade = 0.6 + 0.4 * (y / height);
    const row = y * (width * 3 + 1);
    for (let x = 0; x < width; x++) {
      raw[row + 1 + x * 3] = r * shade;
      raw[row + 2 + x * 3] = g * shade;
      raw[row + 3 + x * 3] = b * shade;
    }
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** One-page PDF that just says "Placeholder resume". */
function placeholderPdf() {
  const text = "BT /F1 24 Tf 72 720 Td (Placeholder resume - replace in Studio) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

async function uploadImage(filename: string, color: [number, number, number]) {
  const asset = await client.assets.upload("image", placeholderPng(800, 600, color), {
    filename,
  });
  return { _type: "imageWithAlt", asset: { _type: "reference", _ref: asset._id } };
}

// --- Helpers ----------------------------------------------------------------

let keyCounter = 0;
const key = () => `seed${(keyCounter++).toString(36)}`;

const para = (text: string) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

// --- Documents --------------------------------------------------------------

async function main() {
  console.log("Uploading placeholder assets…");
  const [photo, projectShot, placePhoto] = await Promise.all([
    uploadImage("placeholder-portrait.png", [70, 90, 120]),
    uploadImage("placeholder-project.png", [40, 110, 70]),
    uploadImage("placeholder-place.png", [120, 90, 60]),
  ]);
  const resume = await client.assets.upload("file", placeholderPdf(), {
    filename: "placeholder-resume.pdf",
    contentType: "application/pdf",
  });

  const docs: IdentifiedSanityDocumentStub[] = [
    {
      _id: "profile",
      _type: "profile",
      name: "Your Name",
      headline: "Software engineer · Placeholder headline",
      photo: { ...photo, alt: "Placeholder portrait" },
      bio: [
        para("This is placeholder bio text. Replace it in Studio under About me."),
        para("A second paragraph, so you can see how spacing looks."),
      ],
      email: "you@example.com",
      location: "Your City",
      contactNote: "Best way to reach me",
    },
    {
      _id: "seed-project",
      _type: "project",
      title: "Placeholder project",
      slug: { _type: "slug", current: "placeholder-project" },
      blurb: "One or two sentences about the project for its card.",
      description: [para("Longer project description. Replace this in Studio.")],
      images: [{ ...projectShot, _key: key(), alt: "Placeholder project screenshot" }],
      role: "Founder",
      stack: ["TypeScript", "Next.js", "Sanity"],
      links: [{ _type: "linkItem", _key: key(), label: "Website", url: "https://example.com" }],
      featured: true,
      orderRank: "0|100000:",
    },
    {
      _id: "seed-experience",
      _type: "experience",
      company: "Placeholder Co.",
      role: "Software Engineer",
      startDate: "2023-01-01",
      location: "Remote",
      summary: [para("What you did there. Replace this in Studio.")],
      orderRank: "0|100000:",
    },
    {
      _id: "seed-education",
      _type: "education",
      school: "Placeholder University",
      degree: "B.S.",
      field: "Computer Science",
      startDate: "2016-09-01",
      endDate: "2020-05-01",
      honors: "Placeholder honors",
      publications: [
        { _type: "publication", _key: key(), title: "Placeholder paper", venue: "Conference 2020" },
      ],
      orderRank: "0|100000:",
    },
    {
      _id: "seed-place",
      _type: "place",
      city: "Placeholder City",
      region: "State",
      years: "2019–2023",
      photo: { ...placePhoto, alt: "Placeholder city photo" },
      note: "A sentence or two about living here.",
      orderRank: "0|100000:",
    },
    {
      _id: "seed-skillGroup",
      _type: "skillGroup",
      label: "Languages",
      items: ["TypeScript", "Python", "SQL"],
      orderRank: "0|100000:",
    },
    {
      _id: "links",
      _type: "links",
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/",
      otherLinks: [],
      resume: { _type: "file", asset: { _type: "reference", _ref: resume._id } },
    },
    {
      _id: "credits",
      _type: "credits",
      tracks: [{ _type: "track", _key: key(), title: "Placeholder track", artist: "Artist" }],
      thanks: [para("Thanks to everyone who helped. Replace this in Studio.")],
      builtWith: "Next.js, Sanity, and a canvas",
    },
    {
      _id: "siteSettings",
      _type: "siteSettings",
      scoreboardName: "GOMEZ FC",
      seoTitle: "Your Name",
      seoDescription: "Placeholder site description.",
    },
  ];

  const tx = client.transaction();
  for (const doc of docs) tx.createIfNotExists(doc);
  await tx.commit();
  console.log(`Seeded ${docs.length} documents (existing ones were left untouched).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
