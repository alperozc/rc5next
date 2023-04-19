import React from "react"
import Head from "next/head"

import { Layout } from "@/components/layout"

export default function Info() {
  return (
    <Layout>
      <Head>
        <title>RC5</title>
        <meta name="description" content="NextJS RC5 Demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="flex flex-col p-2"></section>
    </Layout>
  )
}
