import { NavItem } from "@/types/nav"

interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  links: {
    [key: string]: string
  }
}

export const siteConfig: SiteConfig = {
  name: "RC5",
  description: "RC5 Demo",
  mainNav: [
    {
      title: "Anasayfa",
      href: "/",
    },
    {
      title: "Hakkında",
      href: "/info",
    },
  ],
  links: {},
}
