var cterm;

function printInTerminal(terminal, text, end="\n") {
    terminal.textContent += text + end;
}

function inputInTerminal(terminal, text) {
    printInTerminal(terminal, text)
    return prompt(text) ?? "s5";
}

let pyodide;
(async () => {
    pyodide = await loadPyodide();
})();

function initCodeEditor(codeContainer) {
    const codeElem = codeContainer.querySelector("code");
    const editor = codeContainer.querySelector(".editor-mask");

    //Estilização

    const estilizar = () => {
        codeElem.textContent = editor.value;
        hljs.highlightElement(codeElem);
        codeElem.removeAttribute("data-highlighted")

        codeElem.scrollTo(editor.scrollLeft, editor.scrollTop);
    }

    editor.addEventListener("input", estilizar, false);

    editor.addEventListener("scroll", () => {
        codeElem.scrollTo(editor.scrollLeft, editor.scrollTop);
    }, false);

    estilizar();

    //Execução de código
    const runBtn = codeContainer.querySelector(".runBtn");
    const tabBtn = codeContainer.querySelector(".tabBtn");
    const terminalElem = codeContainer.querySelector(".terminal");

    tabBtn.addEventListener("click", () => {
        const p = editor.selectionStart;
        const value = editor.value;
        editor.value = value.slice(0,p) + "  " + value.slice(p);
        estilizar();
        editor.focus();
        editor.selectionStart = p + 2;
        editor.selectionEnd = p + 2;
    }, false);

    runBtn.addEventListener("click", () => {
        if(pyodide) {
            terminalElem.textContent = "";
            pyodide.setStderr({raw: (msg) => printInTerminal(terminalElem, msg)});
            pyodide.setStdout({isatty: false, batched: (msg) => printInTerminal(terminalElem, msg)});
            pyodide.setStdin({error: false});
            cterm = terminalElem;
            const precode = "from time import sleep\nfrom js import inputInTerminal as prompt, printInTerminal as pit, cterm\ndef input(text):\n pit(cterm, text, '')\n return prompt(text)\n"
            
            try {
                pyodide.runPython(precode + editor.value);
            } catch (erro) {
                terminalElem.textContent = erro
            }

            cterm = undefined;
        }
        else {
            terminalElem.textContent = "Ainda estamos baixando o interpretador Python Tenha paciência";
        }
    }, false);
}