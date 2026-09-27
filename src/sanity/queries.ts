import { defineQuery } from "next-sanity";

// Keep asset refs, crop and hotspot for urlFor(), plus dimensions and a blur placeholder.
const IMAGE = /* groq */ `{
  _type,
  asset,
  crop,
  hotspot,
  alt,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip
}`;

const FILE = /* groq */ `{
  "url": asset->url,
  "filename": asset->originalFilename,
  "size": asset->size
}`;

const PROFILE = /* groq */ `*[_type == "profile" && _id == "profile"][0]{
  name,
  headline,
  photo ${IMAGE},
  bio,
  email,
  location,
  contactNote
}`;

const PROJECTS = /* groq */ `*[_type == "project" && defined(slug.current)] | order(orderRank asc){
  _id,
  title,
  "slug": slug.current,
  blurb,
  description,
  images[] ${IMAGE},
  role,
  stack,
  links[]{ _key, label, url },
  featured
}`;

const EXPERIENCE = /* groq */ `*[_type == "experience"] | order(startDate desc, orderRank asc){
  _id,
  company,
  role,
  startDate,
  endDate,
  location,
  summary,
  logo ${IMAGE}
}`;

const EDUCATION = /* groq */ `*[_type == "education"] | order(orderRank asc){
  _id,
  school,
  degree,
  field,
  startDate,
  endDate,
  honors,
  publications[]{ _key, title, venue, url },
  logo ${IMAGE}
}`;

const SKILL_GROUPS = /* groq */ `*[_type == "skillGroup"] | order(orderRank asc){
  _id,
  label,
  items
}`;

const PLACES = /* groq */ `*[_type == "place"] | order(orderRank asc){
  _id,
  city,
  region,
  years,
  photo ${IMAGE},
  note
}`;

const LINKS = /* groq */ `*[_type == "links" && _id == "links"][0]{
  github,
  linkedin,
  otherLinks[]{ _key, label, url },
  resume ${FILE}
}`;

const ACCOMPLISHMENTS = /* groq */ `*[_type == "accomplishment"] | order(orderRank asc){
  _id,
  title,
  organization,
  date,
  description,
  url
}`;

const SITE_SETTINGS = /* groq */ `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  scoreboardName,
  seoTitle,
  seoDescription,
  ogImage ${IMAGE},
  "ambientTrack": ambientTrack ${FILE}
}`;

// One query per section, for pages that only need part of the content.
export const PROFILE_QUERY = defineQuery(PROFILE);
export const PROJECTS_QUERY = defineQuery(PROJECTS);
export const EXPERIENCE_QUERY = defineQuery(EXPERIENCE);
export const EDUCATION_QUERY = defineQuery(EDUCATION);
export const SKILL_GROUPS_QUERY = defineQuery(SKILL_GROUPS);
export const PLACES_QUERY = defineQuery(PLACES);
export const LINKS_QUERY = defineQuery(LINKS);
export const ACCOMPLISHMENTS_QUERY = defineQuery(ACCOMPLISHMENTS);
export const SITE_SETTINGS_QUERY = defineQuery(SITE_SETTINGS);

// Every section in one round trip. Used by /press and the scene at /.
export const PRESS_QUERY = defineQuery(`{
  "profile": ${PROFILE},
  "projects": ${PROJECTS},
  "experience": ${EXPERIENCE},
  "education": ${EDUCATION},
  "skillGroups": ${SKILL_GROUPS},
  "places": ${PLACES},
  "links": ${LINKS},
  "accomplishments": ${ACCOMPLISHMENTS},
  "siteSettings": ${SITE_SETTINGS}
}`);

// Every document type the site reads. Used as cache tags.
export const CONTENT_TAGS = [
  "profile",
  "project",
  "experience",
  "education",
  "skillGroup",
  "place",
  "links",
  "accomplishment",
  "siteSettings",
];
