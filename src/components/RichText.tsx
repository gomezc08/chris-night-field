import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableText as PortableTextValue } from "@/sanity/types";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string | undefined = value?.href;
      const external = href?.startsWith("http");
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

export function RichText({ value }: { value?: PortableTextValue | null }) {
  if (!value?.length) return null;
  return <PortableText value={value} components={components} />;
}
