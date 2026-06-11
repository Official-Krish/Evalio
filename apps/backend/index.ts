import { app } from "./src/app"
import { startWsServer } from "./src/ws"

const port = parseInt(Bun.env.PORT ?? "3000")

app.listen({ port }, ({ hostname, port }) => {
  console.log(`backend running at http://${hostname}:${port}`)
})

startWsServer()

export { app }
export type App = typeof app
