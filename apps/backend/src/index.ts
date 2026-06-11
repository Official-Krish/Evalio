import { app } from "./app"
import { startWsServer } from "./ws"

const port = parseInt(Bun.env.PORT ?? "3000")

app.listen({ port }, ({ hostname, port }) => {
  console.log(`backend running at http://${hostname}:${port}`)
})

startWsServer()
