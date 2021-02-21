import * as React from "react"
import { Link } from "gatsby"
import { Container, Header } from "semantic-ui-react"
import 'jsoneditor-react/es/editor.min.css'
import 'semantic-ui-css/semantic.min.css'

// styles
const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <Container text>
        <Header as='h1' dividing style={{paddingBottom: '2em'}}>
          Valheim Tools
        </Header>
        <Link to="/character">
          <Header as='h3'>CharData Editor</Header>
        </Link>
        <p>
          Edit character saves, including inventory contents &amp; skill levels.
        </p>
      </Container>
    </main>
  )
}

export default IndexPage
