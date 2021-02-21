import * as React from "react"
import { Container, Header, Divider } from "semantic-ui-react"
import { JsonEditor } from "jsoneditor-react"
import {CharFileParser as CharFile, PlayerProfileParser as PlayerProfile, PlayerDataParser as PlayerData} from "../lib/parser"
import {modifyKeysRecursive, dedent, fixPlayerProfile, fixPlayerData, downloadBlob} from "../lib/utils"
import 'jsoneditor-react/es/editor.min.css'
import 'semantic-ui-css/semantic.min.css'
import {Buffer} from "buffer"

// styles
const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

// markup
const CharacterPage = () => {
  const [charFileName, setCharFileName] = React.useState(null)
  const [originalCharFile, setOriginalCharFile] = React.useState(null)
  const [charFileView, setCharFileView] = React.useState(null)
  const fileInputRef = React.useRef(null)
  const editorRef = React.useRef(null)

  const handleSelect = async (e) => {
    e.preventDefault()

    console.log(e.currentTarget[0].files[0].name)
    setCharFileName(e.currentTarget[0].files[0].name)
    const buf = Buffer.from(await e.currentTarget[0].files[0].arrayBuffer())
    console.log("original buffer", buf)
    const parsedFile = CharFile.parse(buf)
    console.log("parsed file", parsedFile)
    setOriginalCharFile(parsedFile)

    console.log("re-encoded file")
    // re-encode to check encoder working
    const buf2 = CharFile.encode(parsedFile)
    console.log(buf2)
    console.log("parsed playerData")
    console.log(parsedFile.profile.playerData)
    //PlayerData.alias = null
    const buf3 = PlayerData.encode(parsedFile.profile.playerData)
    console.log("re-encoded playerData")
    console.log(buf3)

    // extract the portion we want to display
    let playerProfile = parsedFile.profile
    console.log(playerProfile)
    // clean it up... hide keys they wouldnt want to modify, etc.
    playerProfile = modifyKeysRecursive(playerProfile, ([k, v]) => {
      // we automatically generate these values, they shouldnt manually edit them
      if (k.endsWith("__strlen") || k.endsWith("__buflen") || k.endsWith("__arrlen"))
        return null
      // same as above
      if (k === "__playerdatalength__" || k === "__playerprofilelength__" || k === "__hash__")
        return null
      // no reason to modify
      if (k === "__magic__") return null 
      // too large to render
      if (k === "worldData") return null
      return [[k,v]]
    })
    console.log(playerProfile)

    // update state
    setCharFileView(playerProfile)
    // jsoneditor is an uncontrolled component, so we need to update it manually
    if (editorRef) {
      editorRef.current.jsonEditor.set(playerProfile)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (editorRef) {
      let playerProfile = editorRef.current.jsonEditor.get()

      // rebuild player data
      let playerData = playerProfile.playerData
      console.log("playerData", playerData)
      playerData = fixPlayerData(playerData)
      console.log("playerData_fix", playerData)
      let playerDataEnc = PlayerData.encode(playerData)
      console.log("playerdatalength", playerDataEnc.length)
      // rebuild player profile
      playerProfile.playerData = {
        "__playerdatalength__": playerDataEnc.length,
        ...playerData
      }
      playerProfile.worldData = originalCharFile.profile.worldData
      playerProfile = fixPlayerProfile(playerProfile)
      console.log("playerProfile_fix", playerProfile)
      let playerProfileEnc = PlayerProfile.encode(playerProfile)
      console.log(playerProfileEnc)
      console.log("playerprofilelength", playerProfileEnc.length)

      // rebuild char file
      let charFile = {
        "__playerprofilelength__": playerProfileEnc.length,
        "profile": playerProfile,
        "__hash____buflen": 64,
        "__hash____buf": Buffer.from(await crypto.subtle.digest("SHA-512", playerProfileEnc))
      }
      console.log("charfile", charFile)
      let charFileEnc = CharFile.encode(charFile)
      console.log(charFileEnc)

      const blob = new Blob([charFileEnc])
      console.log(blob)
      downloadBlob(blob, `${charFileName}.modified`)
    }
  }

  return (
    <main style={pageStyles}>
      <Container text>
        <Header as='h1' dividing>
          Valheim CharData Editor
        </Header>
        <p>
          You can use this tool to load Valheim character data files and edit them. You can modify inventory contents, skill levels, and more.
        </p>
        <p>
          Simply load your character .fch file (located in <code>C:\Users\[Username]\AppData\LocalLow\IronGate\Valheim\characters</code> by default), modify the fields you want, and save it. It is <strong>highly encouraged</strong> to make a backup beforehand. 
        </p>

        <form onSubmit={handleSelect}>
          <label>
            select character file:
            <input id="charselect" type="file" accept=".fch" ref={fileInputRef} />
          </label>
          <button type="submit">load</button>
        </form>
        <form onSubmit={handleSave}>
          <button type="submit">save</button>
        </form>
        
      </Container>
      <Divider/>
      <Container>
        {charFileView &&
        <JsonEditor
            value={charFileView}
            ref={editorRef}
        />
        }
      </Container>
      <Divider/>
      <Container text>
        <Header as='h3'>Notes</Header>
        <pre style={{overflowX: 'scroll'}}>
            <code>
              {dedent`
              hairItem: HairNone, Hair1-4 (braided), Hair5 (long), Hair6-9 (ponytail), Hair10-11 (short), Hair12-14 (sideswept)
              beardItem: BeardNone, Beard1-10
              modelIndex: must be 0 (male) for beards to work. All setting to 1 does is disable beards. Other values other than 0,1 do nothing
              playerData.skinColor: {x: red, y: blue, z: green} where each value is in the range from 0.0 to 1.0. {x: 1.0, y: 0, z: 0} gives you pure red.
              playerData.hairColor: same as above

              Item data dump (names, attributes, etc.): https://gist.github.com/balu92/49c189f1d51fb0c84c5fa2daace6bdcf

              TODO -- insert additional docs here
              `}
            </code>
        </pre>
      </Container>
    </main>
  )
}

export default CharacterPage
