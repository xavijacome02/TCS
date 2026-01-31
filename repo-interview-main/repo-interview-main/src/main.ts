import { createExpressServer } from "routing-controllers";
import 'dotenv/config';

let PORT = 3002;

// creates express app, registers all controller routes and returns you express app instance
/*const app = createExpressServer({
  //cors: true,
  routePrefix: "/bp", 

  controllers: [
    __dirname + "/controllers/*{.js,.ts}",
  ], // we specify controllers we want to use
});
*/
const app = createExpressServer({
  cors: true,
  routePrefix: "/bp",
  classTransformer:true,
  controllers: [ __dirname + "/controllers/*{.js,.ts}" ],
});

// run express application on port 3000
app.listen(PORT, () => {
  console.log(`Servidor Iniciado`);
  console.log(`Host: http://localhost:${PORT}`);
  console.log(`Fecha/Hora: ${new Date().toLocaleString()}`);
});
