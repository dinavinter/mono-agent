// import {AnyEventObject, createMachine, forwardTo, spawnChild} from 'xstate';
//
// function connectWebsocket() {
//   const websocket = new WebSocket('ws://localhost:3000');
//   websocket.onmessage = (event) => {
//     console.log(event.data);
//   };
//   websocket.onclose = () => {
//     console.log('closed');
//   };
//   return websocket;
// }
//
// createMachine({
//   context: {
//     url: (input: { url: string | URL;  }) => input.url ||'ws://localhost:3000',
//   },
//   entry: [
//     spawnChild( 'websocket', {
//       id: 'websocket',
//       src:  ({context: {url}}: {context:{url: string | URL; }}) =>  (send, onReceive) =>{
//        
//       }
//     }),
//   ],
//   on: {
//     SEND: {
//       actions: forwardTo('websocket'),
//     },
//   },
//   invoke: {
//     id: 'websocket',
//     src:  ({context: {url}}: {context:{url: string | URL; }}) =>  (send, onReceive) =>{
//       const socket = new WebSocket(url);
//       socket.addEventListener("open", (event) => {
//         socket.onmessage
//       });
//
//       socket.onmessage = (event) => {
//         send({type:event.type|| "message", ...JSON.parse(event.data)});
//       }
//       onReceive((event: AnyEventObject) => {
//           socket.send(JSON.stringify(event));
//         
//       });
//
//       return () => {
//         socket.close();
//       };
//     },
//   },
// });
//
