import './style.css'
import '@gigya/wc'
import './compiler-element.ts'
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>  
     <my-element>
      <h1>Vite + Lit</h1>
     </my-element>
     <compiler></compiler>
  </div>
`

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
