/*
* @author Zachary Wartell
*/

/* 
 *   Toggle a Code_Example table between scrolled presentation and expanded presentation
 *   @param {String} - ID HTML Element ID of table
 */
function Code_Example_Toggle(ID)
{
    document.getElementById(ID).classList.toggle('Code_Example_Expand');
}
