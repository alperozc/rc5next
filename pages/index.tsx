import { useEffect, useState } from "react"
import Head from "next/head"
import { Label } from "@radix-ui/react-dropdown-menu"
import RC5 from "rc5"

import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function IndexPage() {
  const [key, setKey] = useState("")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState(false)
  const [err, setErr] = useState("")

  const encrypt = () => {
    const rc5 = new RC5(key)
    const encrypted = rc5.encrypt(input)
    console.log("encrypted", encrypted, encrypted.toString())
    setOutput(encrypted.toString("base64"))
  }

  const decrypt = () => {
    const rc5 = new RC5(key)
    const _input = Buffer.from(input, "base64")
    const decrypted = rc5.decrypt(_input)
    setOutput(decrypted.toString())
  }

  useEffect(() => {
    if (!key && input) return setErr("Anahtar boş olamaz.")
    else setErr("")

    if (key && input) {
      if (mode) decrypt()
      else encrypt()
    } else setOutput("")
  }, [input, key, mode])

  const renderEncrypt = () => (
    <div className="flex flex-col justify-between gap-2 md:flex-row">
      <div className="grid w-full gap-1.5">
        <Label>Mesajınız</Label>
        <Textarea
          placeholder="Şifrelenecek Mesajı Giriniz."
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
      </div>
      <div className="grid w-full gap-1.5">
        <Label>Şifrelenen Mesaj</Label>
        <Textarea placeholder="Şifrelenen Mesaj" readOnly value={output} />
      </div>
    </div>
  )

  const renderDecrypt = () => (
    <div className="flex flex-col justify-between gap-2 md:flex-row">
      <div className="grid w-full gap-1.5">
        <Label>Şifrelenmiş Mesaj</Label>
        <Textarea
          placeholder="Şifrelenmiş Mesajı Giriniz."
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
      </div>
      <div className="grid w-full gap-1.5">
        <Label>Çözülmüş Mesaj</Label>
        <Textarea
          placeholder="Şifresi Çözülmüş Mesaj"
          readOnly
          value={output}
        />
      </div>
    </div>
  )

  const saveFile = () => {
    const element = document.createElement("a")
    const file = new Blob([output, `\n${key}`], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "output.txt"
    document.body.appendChild(element)
    element.click()
  }

  const readFile = (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result as string
        //console.log("text", text)
        const [output, key] = text.split("\n")
        console.log("output", output, "key", key)
        if (!output || !key) return alert("Dosya formatı hatalı.")
        setInput(output)
        setKey(key)
      }
      reader.readAsText(file)
    } catch (err) {
      console.log("err", err)
    }
  }

  return (
    <Layout>
      <Head>
        <title>RC5</title>
        <meta name="description" content="NextJS RC5 Demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex items-center gap-2 text-center">
          <div className="flex w-full max-w-[320px] items-center gap-2 text-center">
            <Label>Anahtar</Label>
            <Input
              placeholder="XXX"
              onChange={(e) => setKey(e.target.value)}
              value={key}
            />
          </div>
          {err && <span className="text-sm text-red-500">{err}</span>}
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <Switch
              className="bg-gray-300 text-black"
              onCheckedChange={() => {
                console.log("trigger")
                setMode(!mode)
              }}
            />
            <Label>{`Mod: ${mode ? "Şifre Çöz" : "Şifrele"}`}</Label>
          </div>
          {mode ? (
            <div className="grid w-full max-w-sm items-center">
              <Label>Şifrelenen Dosyayı Yükle</Label>
              <Input type="file" onChange={(e) => readFile(e)} />
            </div>
          ) : (
            input &&
            key && (
              <Button variant="default" onClick={() => saveFile()}>
                TXT Dosyasını İndir
              </Button>
            )
          )}
        </div>
        {mode ? renderDecrypt() : renderEncrypt()}

        <div className="flex max-w-[980px] flex-col items-start gap-2"></div>
      </section>
    </Layout>
  )
}
