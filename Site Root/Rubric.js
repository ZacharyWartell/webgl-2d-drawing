/**
\author Zachary Wartell
\copyright Copyright 2015. Zachary Wartell.
\license Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
 - http://creativecommons.org/licenses/by-nc-sa/4.0/

\brief Build RubricTable HTMLTable in document by extracting exercise point information from span.Grade_Points HTMLElement's in the document.
 */
class RubricItem
{
    constructor()
    {
        this.points = 10;
        this.name = "";
        this.shortDescription = "";
        this.longDescription = "";
        this.parentTag = "";
    }
}
class Rubric
{
    constructor()
    {
        this.items = [];
    }
}
var _Rubric = new Rubric();

export function main() {
    let elements = document.querySelectorAll('span.Grade_Points')
    for (let e of elements) {
        let ri = new RubricItem();
        ri.parentTag = e.parentElement.tagName;
        ri.points = e.dataset.points;
        _Rubric.items.push(ri);
        switch (e.parentElement.tagName) {
            case 'SECTION':
                let header = e.parentElement.querySelector(":scope > h1,h2,h3,h4,h5");
                ri.name = header.innerText;
                break;
            case 'LI':
                const span = e.nextElementSibling;
                ri.parentTag = "Exercise:";
                if (span !== null && span.tagName === "SPAN") // by convention this contains the exercise's unique displayed name
                    ri.name = span.innerText;
                break;
        }
    }

    let RubricTable = document.getElementById("RubricTable");
    let total = 0;
    const tbody = RubricTable.querySelector(':scope tbody');
    for (let ri of _Rubric.items) {
        const row = document.createElement("tr");
        //tbody.appendChild(row);
        let tmp = tbody.querySelector(":scope > tr:nth-last-child(2)");
        tbody.insertBefore(row, tmp);
        row.outerHTML =
            `
                  <tr>
                        <td style="${ri.parentTag === "Exercise:" ? "text-align : right;" : "text-align : left;"}"> ${ri.parentTag} </td>
                        <td>${ri.name}</td>
                        <td>${ri.shortDescription}</td>
                        <td style="${ri.parentTag === "Exercise:" ? "text-align : left;" : "text-align : center;"}">${ri.points}</td>
                  </tr>
                  `;
        total += parseInt(ri.points);
    }
    const ttd = document.getElementById("Total");
    ttd.nextElementSibling.innerText = total.toString();
}
