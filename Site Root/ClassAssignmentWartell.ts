/**
 * \author Zachary Wartell
 * \copyright Copyright 2015. Zachary Wartell.
 * \license Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
 - http://creativecommons.org/licenses/by-nc-sa/4.0/

 \status [STATUS=not deployed] work-in-progress
 */
import "./libs/jquery-3.5.1.min.js";
import "./libs/toc.min.js";
import * as Rubric from "./Rubric.js";


/**
 ** \brief AssignmentName contains various components used to describe the name/tile of the instruction's assignment.
 *
 *  These is are set the HTMLElement.innerText of various <span> elements which are distinguished by their having a number of special data- attributes.
 **/
export
class AssignmentName
{
    courseNumber: string;
    number: string;
    numberLongDir: string;
    name: string;
    git: string;

    constructor(
        courseNumber: string,
        number: string,
        numberLongDir: string,
        name: string
        )
    {
        this.courseNumber = courseNumber;
        this.number = number;
        this.numberLongDir = numberLongDir;
        this.name = name;
        this.git = this.courseNumber + "-" + this.numberLongDir;
    }

    insertText( doc : HTMLDocument) : void
    {
        let elements = doc.querySelectorAll('span[data-course-number]');
        for (let e of elements) {
            (<HTMLElement>e).innerText = this.courseNumber;
        }

        elements = doc.querySelectorAll('span[data-project-number]');
        for (let e of elements) {
            (<HTMLElement>e).innerText = this.number;
        }

        elements = doc.querySelectorAll('span[data-project-number-long-dir]');
        for (let e of elements) {
            (<HTMLElement>e).innerText = this.numberLongDir;
        }

        elements = doc.querySelectorAll('span[data-project-name-dir]');
        for (let e of elements) {
            (<HTMLElement>e).innerText = this.name;
        }

        elements = doc.querySelectorAll('span[data-project-git]');
        for (let e of elements) {
            (<HTMLElement>e).innerText = this.git;
        }

        /*
        *  remove DataField:before contents now that data text is inserted
        */
        elements = doc.querySelectorAll('span.DataField');
        elements = doc.querySelectorAll('span.DataField');
        for (let e of elements) {
            e.setAttribute("class", "");
        }        
    }
}
/*
 * @type {Readonly<{READ: symbol, TODO: symbol, OVERVIEW: symbol, GENERAL: symbol, QUESTION: symbol}>}
 */
enum Category
{
    QUESTION,
    GENERAL,
    READ,
    TODO,
    OVERVIEW
};
/*
const Category = Object.freeze({
    QUESTION: Symbol("Question"),
    GENERAL: Symbol("General"),
    READ: Symbol("Read"),
    TODO: Symbol("Todo"),
    OVERVIEW: Symbol("Overview")
})
*/

function getCategoryFromClass(element, returnNull) {
    if (element.className.includes("Instruction_Question"))
        return Category.QUESTION;
    if (element.className.includes("Instruction_Read"))
        return Category.READ;
    if (element.className.includes("Instruction_Todo"))
        return Category.TODO;
    if (element.className.includes("Instruction_Overview"))
        return Category.OVERVIEW;
    if (element.className.includes("Instruction_General"))
        return Category.GENERAL;
    if (returnNull)
        return null;
    else
        return Category.GENERAL;
}



class OptionSet
{
    name : string;
    options : Array<any>;
    constructor(n)
    {
        this.name = n;
        this.options = [];
    }
}

/*class Category
    {
        constructor(e)
        {
            this.value=e;
        }
        static QUESTION = 0;
        static GENERAL = 1;
        static READ = 2;
           static TODO = 3;
    };*/
class Instruction {

    section : string;
    number : string;
    id : string;
    points : number;
    comment : string;
    short : string;
    category : Category;

    constructor(s : string, n : string  , sh : string , c) {
        this.section = s;
        this.number = n;
        this.short = sh;
        this.category = c;
        this.id = "Section_"+(s + "_Item_" + n).replace(/\./g,'_');
        this.points = 0;
        this.comment="";
    }
}

class Instructions
{
    instructions : Array<Instruction>;
    optionSets : Array<OptionSet>;

    constructor()
    {
        this.instructions = [];
        this.optionSets = [];
    }

    push(i)
    {
        console.assert (i instanceof Instruction);  // \todo rewrite all in TypeScript
        this.instructions.push(i);
    }
}
var instructions = new Instructions();

function roman_lower (n)
{
    console.assert(n<10);
    const roman = [ 'i','ii','iii','iv','v','vi','vii','viii','ix','x'];
    return roman[n-1];
}
function itemString(...args: number[])
{
    const aCode = "a".charCodeAt(0);
    switch(arguments.length)
    {
        case 1:
            return args[0].toString();
        case 2:
            return args[0].toString() + "." + String.fromCharCode(aCode+args[1]-1);
        case 3:
            return args[0].toString() + "." + String.fromCharCode(aCode+args[1]-1) + "." + roman_lower(args[3]);
    }
}

function itemID(sectionLabel : string,L1 : number,L2 : number,L3 : number)
{
    let id;
    id = sectionLabel.replace('.','_');
    id += itemString(L1,L2,L3).replace('.','_');
    return id;
}

function collectionInstructions(section : HTMLElement, sectionLabel : string) {
    let l1c : number = 1, l2c : number = 1, l3c : number = 1;

    const temp : string = "self"+Date.now().toString();
    section.id = temp;
    let olList = section.querySelectorAll(":scope > ol.Instruction");
    //section.id = "";
    if (olList !== null && olList.length !== 0) {
        for (let ol of olList) {
            let li1List = ol.querySelectorAll(":scope > li");
            let category = getCategoryFromClass(ol, false);

            l1c = 1;
            li1List.forEach(
                (n1)=>
                {
                    const li1 : HTMLElement = <HTMLElement>n1;
                    let tmp, cat = (tmp = getCategoryFromClass(li1, true)) !== null ? tmp : category;

                    instructions.push(new Instruction(sectionLabel, itemString(l1c),
                        li1.innerText.trimStart().slice(0, 10) + " ...", cat));
                    li1.id = instructions.instructions [instructions.instructions.length-1].id;
                    let ol1 = li1.querySelector(":scope > ol");
                    if (ol1 !== null) {
                        let category1 = getCategoryFromClass(ol1, false);

                        let li2List = ol1.querySelectorAll(":scope > li"); // only children, no nested descendants
                        l2c = 1;
                        for (let nli2 of li2List) {
                            const li2 : HTMLOListElement = <HTMLOListElement>nli2;
                            let tmp, cat = (tmp = getCategoryFromClass(li2, true)) !== null ? tmp : category1;

                            instructions.instructions.push(new Instruction(sectionLabel, itemString(l1c ,l2c),
                                li2.innerText.trimStart().slice(0, 10) + " ...",  cat));
                            li2.id = instructions.instructions[instructions.instructions.length-1].id;
                            let ol2 = li2.querySelector(":scope > ol");
                            if (ol2 !== null) {
                                let category2 = getCategoryFromClass(ol2, false);

                                let li3List = ol2.querySelectorAll(":scope > li"); // only children, no nested descendants
                                l3c = 1;
                                for (let nli3 of li3List) {
                                    const li3 : HTMLOListElement = <HTMLOListElement>nli3;
                                    let tmp, cat = (tmp = getCategoryFromClass(li3, true)) !== null ? tmp : category2;

                                    instructions.instructions.push(new Instruction(sectionLabel, itemString(l1c , l2c ,l3c),
                                        li3.innerText.trimStart().slice(0, 10) + " ...", cat));
                                    li3.id = instructions.instructions[instructions.instructions.length-1].id;
                                    l3c++;
                                }
                            }
                            l2c++;
                        }
                    }
                    l1c++;
                }
            );
        }
    }
}

/*  \author Zachary Wartell
 *  \brief toggle the "hidden" attribute of all elements of class "Class"
 *  @param {String} - name of class
 */
export
function Visibility_Toggle(Class : string)
{
    var list = document.querySelectorAll("." + Class);
    console.log("function Visibility_Toggle(Class)");
    for (let i = 0; i < list.length; i++)
    {
        /*
        if (list[i].previousElementSibling === null ||
            list[i].previousElementSibling.tagName !== "BUTTON" ||
            list[i].previousElementSibling.className !== "Div_Toggle_Button"
           )
        {// Hide button wasn't created yet, so insert it
          var unhideButton = document.createElement("BUTTON");
          unhideButton.className = "Div_Toggle_Button";
          unhideButton.setAttribute("style", "text-align:center;");
          unhideButton.setAttribute("onclick", "Div_Toggle (" + '"' + Class + '"' + ")");
          unhideButton.textContent = "Unhide ... ";
          list[i].parentElement.insertBefore(unhideButton, list[i]);
        }
          */

        if (!list[i].hasAttribute("hidden"))
        {/* hide div and show Unhide button */
            /* enable the unhide button */
            //list[i].previousElementSibling.textContent = "Unhide";

            /* hide this div */
            list[i].setAttribute("hidden", "true");
        }
        else
        {/* unhide div and show Hide button */
            list[i].removeAttribute("hidden");
            /* list[i].previousElementSibling.setAttribute("hidden","true"); */
            //list[i].previousElementSibling.textContent = "Hide";
        }
    }
    /*
    * Re-Initialize toc module
    */
    //console.log (typeof document.getElementById('toc')["toc"]);
    //console.log (typeof $('#toc')["toc"]);
    $('#toc')["toc"](
        {
            'smoothScrolling': true,
            'selectors': 'h1.toc, h2.toc, h3.toc' //elements to use as headings
        }
    );
    /*
    console.log (typeof document.getElementById('toc')["toc"]);
    document.getElementById('toc')["toc"](
        { 'smoothScrolling': true,
            'selectors': 'h1.toc, h2.toc, h3.toc' //elements to use as headings
        }
    );
     */
}
/*
https://web.dev/file-system-access/
*/
async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}

function apiCheck()
{
    // https://web.dev/file-system-access/
    if ((<any>window).showSaveFilePicker === undefined)
        //throw "Browser does not support window.showSaveFilePicker";
        alert("Browser does not support window.showSaveFilePicker");
}

export function main()
{
    apiCheck();
    
    /**
     **   Setup Menu Bar
     **/

    /*
     *  add eventListners the close SubMenu on mouseleave 
     */
    let nl = document.querySelectorAll("ul.SubMenu");
    nl.forEach(
        (n)=>
        {
            n.addEventListener('mouseleave',
                (e:MouseEvent)=>
                {
                    (<HTMLElement>e.target).hidden=true;
                });
        });

    let input;
    /*
    *  Menu#File Download button
    - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_files
    - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
    */

    input = document.getElementById("save");
    input.addEventListener('click',
        (e:MouseEvent)=>
        {
            const options = {
                types: [
                    {
                        description: 'Html Files',
                        accept: {
                            'text/html': ['.html'],
                        },
                    },
                ],
            };
            (<any>window).showSaveFilePicker(options).
            then(
                (handle)=>
                {
                    console.log("Save " + handle);
                    return writeFile(handle,document.querySelector('section.SlidesWindow').innerHTML);
                }).
            catch(
                (e)=> { throw e;}
            );
            (<HTMLElement>e.target).parentElement.parentElement.hidden = true;
        });
    
    /*
    *  Menu#File Download button
    - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_files
    - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
    */
    input = document.getElementById("exportAll");
    input.addEventListener("click",
        ( e: InputEvent )=>
        {
            try{
                let htmlOut : string = "";
                const scs = document.querySelectorAll(`div.SlideContainer`);
                scs.forEach((sc)=>{htmlOut += sc.outerHTML;});

                const a = document.createElement("a");
                document.body.appendChild(a);
                const url = URL.createObjectURL(new Blob([htmlOut], {type: 'plain/text'}));
                a.href = url;
                a.download = "zjw-instructions-bak.html";
                a.click();
                document.body.removeChild(a);

                (<HTMLElement>e.target).parentElement.parentElement.hidden = true;
            }
            catch(err)
            {
                throw err;
            }
        });

    const inputFile : HTMLInputElement = <HTMLInputElement> document.getElementById("loadFile");
    inputFile.addEventListener('change',
        ( e: InputEvent)=>
        {
            const reader = new FileReader();
            //const captureThis = this;
            /*
             must be 'loadend' on mobile phone 'load' event triggers multiple times for large files
             */
            reader.addEventListener('loadend', (event : ProgressEvent<FileReader> ) =>
            {
                /**
                 * Load the instructions content Html Fragment into DOM
                 *
                 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/frames
                 */
                const mw : HTMLElement = document.getElementById("MainWindow");
                mw.innerHTML = event.target.result.toString();

                /**
                 * Update JS Objects
                 */
                // \todo Update JS Objects
                Rubric.main();
            });
            reader.readAsText((<HTMLInputElement>e.target).files[0]);
            //console.log((<HTMLInputElement>e.currentTarget).value);
            /*
            slides.loadFile((<HTMLInputElement>e.target).files[0]);
            (<HTMLElement>e.target).parentElement.parentElement.hidden = true;
            */
        });
    
    /*
     *   Use XHR to load Chapter4.html
     *   \todo extend to allow user to choose a chapter available from the server
     *
     *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
     *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/HTML_in_XMLHttpRequest
     */
    //slides.url = "Chapter5.html";
    // 4/11: keep for potential load from server file system (will require more work on the code below)

    /*
    let xhr = new XMLHttpRequest();

    xhr.onload = function ()
    {
        console.log(this.responseXML);
        const sw=document.querySelector("section.SlidesWindow");
        const xhr_scs = this.responseXML.body.querySelectorAll("div.SlideContainer");
        xhr_scs.forEach(
            (e)=>
            {
                sw.appendChild(e);
                slides.slides.push(new SP.Slide(<HTMLElement>e));
            });
        const scs = document.querySelectorAll("div.SlideContainer");
        slides.count = slides.htmlCount = scs.length;

    };
    let url = window.location.href;
    const name = "ITCS 5121/ITCS 5121 - IVPD - Chapter 6.html";
    // handle fact that url comes uot differently when testing on localhost versus reomte browser
    if (url[url.length-1]==='/')
        url += name;//slides.url);
    else
        url = url.replace('index.html',name);
    console.log(url);
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();    
     */
}

/**
 ******  [STATUS: NOT DEPLOYED] ******* 
 ******  [work-in-progress]     *******
 
 
 Currently the <script> in the .html does an approximation of some of what the code below will eventually do.
 **/
function onLoad_idea2() {
    // [STATUS=not deployed] work-in-progress
    {
        Global.studentDirectory = localStorage.getItem('studentDirectory') || "";
    }


    // Note this traversal assumes every <h1>, <h2> etc. is immediately preceded by a <section> element
    let h1List = document.querySelectorAll("section > h1");
    let h1c, h2c, h3c;
    h1c = 1;
    for (let h1 of h1List) {
        console.assert(h1.parentElement.tagName === "SECTION");
        collectionInstructions(h1.parentElement, h1c.toString());
        let parent = h1.parentElement;
        let selfIndex = [].slice.call(parent.children).indexOf(h1) + 1;
        let h2List = parent.querySelectorAll(":nth-child(" + selfIndex + ") ~ section > h2");

        if (h2List !== null && h2List.length !== 0) {
            h2c = 1;
            for (let h2 of h2List) {
                console.assert(h2.parentElement.tagName === "SECTION");
                collectionInstructions(h2.parentElement, h1c.toString() + "." + h2c.toString());
                let parent = h2.parentElement;
                let selfIndex = [].slice.call(parent.children).indexOf(h2) + 1;
                let h3List = parent.querySelectorAll(":nth-child(" + selfIndex + ") ~ section > h3");
                if (h3List !== null && h3List.length !== 0) {
                    h3c = 1;
                    for (let h3 of h3List) {
                        console.assert(h3.parentElement.tagName === "SECTION");
                        collectionInstructions(h3.parentElement, h1c.toString() + "." + h2c.toString() + "." + h3c.toString());
                        h3c++;
                    }

                }
                h2c++;
            }
        }
        if (h1.className !== "nocount")
            h1c++;
    }
    console.log(instructions);
    //console.log("instructions.length:"+instructions.length);

    /*
     * construct <tbody> for <table> (#RubricTable) using instructions array and add
     * various <input> HTML elements to certain <table> columns
     */
    let rubric = document.querySelector("#RubricTable > tbody");
    let prevSection = "";
    let total=0;
    const REGEX = /Symbol\(([^)]*)\)/; // for removing Symbol sub-string
    let ri=0;
    for (let instruction of instructions.instructions) {
        let row = document.createElement("tr");
        row.setAttribute("data-ri",ri.toString());
        if (instruction.section === prevSection)
            row.innerHTML =
                `<td class="Empty"></td>
                 <td>${instruction.number}</td>
				 <td>${instruction.category.toString().replace(REGEX, '$1')}</td>
				 <td><a href="#${instruction.id}">${instruction.short}</a></td>
                 <td><input type="checkbox" id="#CB_${instruction.id}" name="scales"></td>
                 <td></td>
                 <td></td>
                 <td><input type="text"></td>`;
        else
            row.innerHTML =
                `<td>${instruction.section}</td>
				 <td>${instruction.number}</td>
				 <td>${instruction.category.toString().replace(REGEX, '$1')}</td>
				 <td><a href="#${instruction.id}">${instruction.short}</a></td>
                 <td><input type="checkbox" id="#CB_${instruction.id}" name="scales"></td>
                 <td></td>
                 <td></td>
                 <td><input type="text"></td>`;
        prevSection = instruction.section;
        row.querySelector('input[type="text"]').addEventListener('input',
            (e : InputEvent ) =>
            {
                const itemID=(<HTMLElement>e.currentTarget).parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.querySelector('a').getAttribute('href');
                const rowIndex=parseInt((<HTMLElement>e.srcElement).parentElement.parentElement.getAttribute("data-ri"));
                console.log(itemID.slice(1) + ":" + rowIndex + ":" + e);
                console.log(instructions.instructions[rowIndex]);
                instructions.instructions[rowIndex].comment = (<HTMLInputElement>e.currentTarget).value;
            });
        rubric.append(row);
        ri++;
    }
    let ttd = document.getElementById("Total");
    (<HTMLElement>ttd.nextElementSibling).innerText = total.toString();

    /*
     *  serialize DOM created Rubric table to .xml
     */
    {
        let XMLS = new XMLSerializer();
        let rubricTable_xmls = XMLS.serializeToString(document.querySelector("#RubricTable"));
        let url = URL.createObjectURL(new Blob([rubricTable_xmls], {type: 'application/xml; charset=UTF-16'}));

        // create button to open new browser tab with .xml file
        (<HTMLElement>document.querySelector("#CreateGradingRubricXML")).onclick = () => {
            window.open(url);
        };

        // create button to download .xml file
        const link = document.createElement('a');
        link.href = url;
        link.innerText = "Download XML";
        link.download = "Rubric.xml";
        //link.textContent =  "xmlfile.xml";
        //document.querySelector("#RubricButton").onclick = () => {location.href='"' + url + '"';};
        document.querySelector("#RubricDownloadXML").append(link);
    }

    /*
     *  serialize DOM created Rubric table to .json
     */
    {
        let rubricTable_json = JSON.stringify(instructions);
        let url = URL.createObjectURL(new Blob([rubricTable_json], {type: 'text/plain; charset=UTF-16'}));

        // create button to open new browser tab with .json file
        (<HTMLElement>document.querySelector("#CreateGradingRubricJSON")).onclick = () => {
            window.open(url);
        };

        // create button to download .json file
        const link = document.createElement('a');
        link.href = url;
        link.innerText = "Download JSON";
        link.download = "Rubric.json";
        document.querySelector("#RubricDownloadJSON").append(link);
    }

    // create <input> element to select studentDirectory
    document.querySelector("#StudentDirectory").addEventListener('change',
        (e : InputEvent ) =>
        {
            console.log(e);
            Global.studentDirectory = (<HTMLInputElement>e.target).value;//files[0].match(/(.*)[\/\\]/)[1] || '';
            localStorage.setItem('studentDirectory', Global.studentDirectory);
            console.log(Global.studentDirectory);
        });

    return;
}
