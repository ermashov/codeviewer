import './assets/main.css'

import { createApp } from 'vue'

import { EditorState,Compartment } from '@codemirror/state';
import {
    EditorView, keymap, highlightSpecialChars, drawSelection,
    highlightActiveLine, dropCursor, rectangularSelection,
    crosshairCursor, lineNumbers, highlightActiveLineGutter
} from "@codemirror/view"
import {basicSetup} from "codemirror"
import { StreamLanguage } from "@codemirror/language";
import {javascript} from "@codemirror/lang-javascript"
import {angular} from "@codemirror/lang-angular"
import {css} from "@codemirror/lang-css"
import {go} from "@codemirror/lang-go"
import {html} from "@codemirror/lang-html"
import {java} from "@codemirror/lang-java"
import {json} from "@codemirror/lang-json"
import {less} from "@codemirror/lang-less"
import {lezer} from "@codemirror/lang-lezer"
import {liquid} from "@codemirror/lang-liquid"
import {markdown} from "@codemirror/lang-markdown"
import {php} from "@codemirror/lang-php"
import {python} from "@codemirror/lang-python"
import {rust} from "@codemirror/lang-rust"
import {sass} from "@codemirror/lang-sass"
import {vue} from "@codemirror/lang-vue"
import {wast} from "@codemirror/lang-wast"
import {xml} from "@codemirror/lang-xml"
import {yaml} from "@codemirror/lang-yaml"
import {twig} from '@ssddanbrown/codemirror-lang-twig';
import {cpp} from '@codemirror/lang-cpp';

//legacy
import {nginx} from '@codemirror/legacy-modes/mode/nginx';
import {clojure} from '@codemirror/legacy-modes/mode/clojure';
import {diff} from '@codemirror/legacy-modes/mode/diff';
import {fortran} from '@codemirror/legacy-modes/mode/fortran';
import {groovy} from '@codemirror/legacy-modes/mode/groovy';
import {haskell} from '@codemirror/legacy-modes/mode/haskell';
import {properties} from '@codemirror/legacy-modes/mode/properties';
import {julia} from '@codemirror/legacy-modes/mode/julia';
import {stex} from '@codemirror/legacy-modes/mode/stex';
import {lua} from '@codemirror/legacy-modes/mode/lua';
import {octave} from '@codemirror/legacy-modes/mode/octave';
import {pascal} from '@codemirror/legacy-modes/mode/pascal';
import {perl} from '@codemirror/legacy-modes/mode/perl';
import { powerShell } from "@codemirror/legacy-modes/mode/powershell";
//import {python} from '@codemirror/legacy-modes/mode/python';

import { r } from "codemirror-lang-r";
//import {ruby} from '@codemirror/legacy-modes/mode/ruby';
//import {rust} from '@codemirror/legacy-modes/mode/rust';
import {sas} from '@codemirror/legacy-modes/mode/sas';
import {scheme} from '@codemirror/legacy-modes/mode/scheme';
import {shell} from '@codemirror/legacy-modes/mode/shell';
import {swift} from '@codemirror/legacy-modes/mode/swift';
//import {twig} from '@codemirror/legacy-modes/mode/twig';
import {vb} from '@codemirror/legacy-modes/mode/vb';
import {vbScript} from '@codemirror/legacy-modes/mode/vbScript';


//import {csharp} from '@codemirror/legacy-modes/mode/csharp';
import { csharp } from "@codemirror/legacy-modes/mode/clike";
//import {c} from '@codemirror/legacy-modes/mode/c';
//import {dart} from '@codemirror/legacy-modes/mode/dart';
import { dart } from "@codemirror/legacy-modes/mode/clike";
import { scala } from "@codemirror/legacy-modes/mode/clike";
import { fSharp } from "@codemirror/legacy-modes/mode/mllike";

import { kotlin } from "@codemirror/legacy-modes/mode/clike";

import {sql, MySQL, MSSQL, PLSQL, PostgreSQL, SQLite } from "@codemirror/lang-sql";

///import {ocaml} from '@codemirror/legacy-modes/mode/ocaml';
import { oCaml } from "@codemirror/legacy-modes/mode/mllike";

import {smarty} from '@ssddanbrown/codemirror-lang-smarty';


const languageConf = new Compartment();

function initCodemirrorTextarea(textarea, container) {
    const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
            // Синхронизируем значение с textarea
            textarea.value = update.state.doc.toString();
        }
    });
    const state = EditorState.create({
        doc: '', // Начальное значение
        extensions: [
            basicSetup,
            languageConf.of(javascript()),
            updateListener // Подключаем слушатель изменений
        ]
    });
    const view = new EditorView({
        state,
        parent: container,
    });
    function switchToLang(lang) {
        let fn = getExtention(lang);
        window.viewCode.dispatch({
            effects: languageConf.reconfigure(fn), // Переконфигурируем отсек языка
            changes: { from: 0, to: view.state.doc.length, insert: view.state.doc.toString() } // Меняем текст
        });
    }
    window.viewCode = view;
    window.switchToLang = switchToLang;
    textarea.value = view.state.doc.toString();
}

function initCodemirrorViewer() {
    const codeBlocks = document.querySelectorAll('pre > code');
    codeBlocks.forEach((codeElement) => {

        const id = codeElement.parentElement.id;

        const lang = codeElement.className.replace(/language-/g, "");
        const initialText = codeElement.textContent;

        const container = document.createElement('div');
        container.className = 'codemirror-wrapper';

        codeElement.parentNode.replaceChild(container, codeElement);

        let fn = getExtention(lang);

        if(typeof  window.editorViewerList != "object")
            window.editorViewerList = [];

        window.editorViewerList[id] = new EditorView({
            state: EditorState.create({
                doc: initialText,
                extensions: [
                    basicSetup,
                    fn,
                    EditorState.readOnly.of(true), // Делаем код только для чтения
                    EditorView.editable.of(false)  // Отключаем фокус ввода для read-only режима
                ]
            }),
            parent: container
        });
    });
}

function getExtention(lang){
    let fn = function(){};


    switch (lang) {
        case "bash":
        case "shell":
            fn =  StreamLanguage.define(shell);
        break;
        case "c": fn = cpp(); break;
        //c#
        case "csharp": fn =  StreamLanguage.define(csharp);break;
        //c++
        case "cpp": fn =  cpp();break;
        case "clojure": fn =  StreamLanguage.define(clojure);break;
        case "css": fn =  css(); break;
        case "dart": fn =  StreamLanguage.define(dart);break;
        case "diff": fn =  StreamLanguage.define(diff);break;
        //F#
        case "fsharp": fn =  StreamLanguage.define(fSharp);break;
        case "fortran": fn =  StreamLanguage.define(fortran); break;
        case "go": fn =  go();break;
        case "groovy": fn =  StreamLanguage.define(groovy); break;
        case "haskell": fn =  StreamLanguage.define(haskell);
            break;
        case "html": fn =  html(); break;
        //ini
        case "properties": fn =  StreamLanguage.define(properties); break;
        case "java": fn =  java(); break;
        case "javascript": fn = javascript(); break;
        case "json": fn = json();break;
        case "julia": fn =  StreamLanguage.define(julia); break;
        case "kotlin": fn =  StreamLanguage.define(kotlin);break;
        case "latex": fn =  StreamLanguage.define(stex); break;
        case "lua": fn =  StreamLanguage.define(lua); break;
        case "markdown": fn =  markdown();break;
        case "matlab": fn =  StreamLanguage.define(octave); break;
        case "mssql": fn =  sql({ dialect: MSSQL }); break;
        case "mysql": fn =  sql({ dialect: MySQL }); break;
        case "nginx": fn =  StreamLanguage.define(nginx); break;
        case "ocaml": fn =  StreamLanguage.define(ocaml); break;
        case "octave": fn =  StreamLanguage.define(octave); break;
        case "pascal": fn =  StreamLanguage.define(pascal); break;
        case "perl": fn =  StreamLanguage.define(perl); break;
        case "php": fn = php({ plain: true }); break;
        case "plSQL": fn = sql({ dialect: PLSQL }); break;
        case "PostgreSQL": fn =  sql({ dialect: PostgreSQL }); break;
        case "Powershell": fn =  StreamLanguage.define(powerShell); break;
        case "python": fn =  python(); break;
        case "R": fn =  r(); break;
        case "Ruby": fn =  StreamLanguage.define(ruby); break;
        case "rust": fn =  rust(); break;
        case "sas": fn =  StreamLanguage.define(sas); break;
        case "scala": fn =  StreamLanguage.define(scala); break;
        case "scheme": fn =  StreamLanguage.define(scheme); break;
        case "shell": fn =  StreamLanguage.define(shell); break;
        case "smarty": fn =  StreamLanguage.define(smarty); break;
        case "sql": fn = sql();break;
        case "sqlite": fn = SQLite(); break;
        case "swift": fn =  StreamLanguage.define(swift); break;
        case "twig": fn =  twig(); break;
        case "typescript": fn = async () => javascript({typescript: true}); break;
        //vb.net
        case "vb": fn =  StreamLanguage.define(vb); break;
        case "vbs": fn =  StreamLanguage.define(vbScript); break;
        case "vbscript": fn =  StreamLanguage.define(vbScript); break;
        case "xml": fn = xml(); break;
        case "yaml": fn = yaml(); break;
        case "vue": fn = vue(); break;
        case "sass": fn = sass(); break;
        case "less": fn = less(); break;
        case "wast": fn = wast(); break;
        case "lezer": fn = lezer(); break;
        case "liquid": fn = liquid(); break;
        case "angular": fn = angular(); break;
    }
    return fn;
}

window.EditorView = EditorView;
window.initCodemirrorTextarea = initCodemirrorTextarea;
window.initCodemirrorViewer = initCodemirrorViewer;


// Запускаем функцию после полной загрузки DOM-дерева
/*document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('hiddenTextarea');
    const container = document.getElementById('editor-container');

    window.initCodemirrorTextarea(textarea, container);
    window.initCodemirrorViewer();

});*/


