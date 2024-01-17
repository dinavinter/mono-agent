const swc = await import("../../../node_modules/@swc/wasm-web/wasm-web.js");
await swc.default();
export class CompilerElement extends HTMLElement {
    public static observedAttributes = [];

    public initialized = false;
    constructor() {
        super();
    }

     

    connectedCallback() {
        
        this.innerHTML = `
        <div class="app">
            <textarea id="code" style="width: 100%; height: 100px"></textarea>
            <button id="compile">Compile</button>
            <textarea id="result"></textarea>
        </div>
        `;
        const code = this.querySelector<HTMLTextAreaElement>('#code')!;
        const compile = this.querySelector<HTMLButtonElement>('#compile')!;
        const result = this.querySelector<HTMLTextAreaElement>('#result')!;
        compile.addEventListener('click', () => {
            try {
                const compiled = swc.transformSync(code.value, {
                     
                });
                result.textContent = compiled.code;
            } catch (e: any) {
                result.textContent = e.toString();
            }
        });
    }

}

customElements.define('compiler-element', CompilerElement);
