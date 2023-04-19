class RC5 {
  constructor(key) {
    this.key = key
    this.blockSize = 16
    this.wordSize = 32
    this.rounds = 12
    this.numSubKeys = (this.rounds + 1) * 2
    this.subKeys = []
    this.keySchedule()
  }

  stringToWords(str) {
    let words = []
    for (let i = 0; i < str.length; i += 4) {
      words.push(
        (str.charCodeAt(i) << 24) |
          (str.charCodeAt(i + 1) << 16) |
          (str.charCodeAt(i + 2) << 8) |
          str.charCodeAt(i + 3)
      )
    }
    return words
  }

  wordsToString(words) {
    let str = ""
    for (let i = 0; i < words.length; i++) {
      str += String.fromCharCode(
        (words[i] >>> 24) & 0xff,
        (words[i] >>> 16) & 0xff,
        (words[i] >>> 8) & 0xff,
        words[i] & 0xff
      )
    }
    return str
  }

  rotateLeft(word, bits) {
    return ((word << bits) | (word >>> (32 - bits))) >>> 0
  }

  rotateRight(word, bits) {
    return ((word >>> bits) | (word << (32 - bits))) >>> 0
  }

  keySchedule() {
    let words = this.stringToWords(this.key)
    let numWords = words.length
    let numBytes = numWords * 4
    let magic = 0xb7e15163
    let mod = (1 << this.wordSize) - 1

    if (numBytes < this.blockSize) {
      let padding = new Array(this.blockSize - numBytes)
      padding.fill(0)
      words = words.concat(this.stringToWords(String.fromCharCode(...padding)))
      numWords = words.length
    }

    let L = new Array(numWords)
    for (let i = numWords - 1; i >= 0; i--) {
      L[i] = 0
    }

    for (let i = numWords - 1; i >= 0; i--) {
      L[i] = (L[i] << 8) | (words[i] & 0xff)
    }

    this.subKeys[0] = magic
    for (let i = 1; i < this.numSubKeys; i++) {
      this.subKeys[i] = (this.subKeys[i - 1] + mod) & mod
    }

    let i = 0
    let j = 0
    let A = 0
    let B = 0
    for (let k = 0; k < 3 * Math.max(numWords, this.numSubKeys); k++) {
      A = this.subKeys[i] = this.rotateLeft((this.subKeys[i] + A + B) & mod, 3)
      B = L[j] = this.rotateLeft(
        (L[j] + A + B) & mod,
        (A + B) & (this.wordSize - 1)
      )
      i = (i + 1) % this.numSubKeys
      j = (j + 1) % numWords
    }
  }

  encryptBlock(block) {
    let words = this.stringToWords(block)
    let numWords = words.length
    let A = words[0] + this.subKeys[0]
    let B = words[1] + this.subKeys[1]
    let mod = (1 << this.wordSize) - 1
    let mask = (1 << (this.wordSize >> 1)) - 1
    for (let i = 1; i <= this.rounds; i++) {
      A = this.rotateLeft(A ^ B, B & mask) + this.subKeys[2 * i]
      B = this.rotateLeft(B ^ A, A & mask) + this.subKeys[2 * i + 1]
      A = A & mod
      B = B & mod
    }
    words[0] = A
    words[1] = B
    return this.wordsToString(words)
  }

  decryptBlock(block) {
    let words = this.stringToWords(block)
    let numWords = words.length
    let A = words[0]
    let B = words[1]
    let mod = (1 << this.wordSize) - 1
    let mask = (1 << (this.wordSize >> 1)) - 1
    for (let i = this.rounds; i >= 1; i--) {
      B = this.rotateRight(B - this.subKeys[2 * i + 1], A & mask) ^ A
      A = this.rotateRight(A - this.subKeys[2 * i], B & mask) ^ B
      A = A & mod
      B = B & mod
    }
    A -= this.subKeys[0]
    B -= this.subKeys[1]
    A = A & mod
    B = B & mod
    words[0] = A
    words[1] = B
    return this.wordsToString(words)
  }

  encrypt(data) {
    let result = ""
    let paddedData = data.padEnd(this.blockSize, "\0")
    for (let i = 0; i < paddedData.length; i += this.blockSize) {
      let block = paddedData.substr(i, this.blockSize)
      let encryptedBlock = this.encryptBlock(block)
      result += encryptedBlock
    }
    return result
  }

  decrypt(data) {
    let result = ""
    for (let i = 0; i < data.length; i += this.blockSize) {
      let block = data.substr(i, this.blockSize)
      let decryptedBlock = this.decryptBlock(block)
      result += decryptedBlock
    }
    return result.replace(/\0+$/g, "")
  }
}
