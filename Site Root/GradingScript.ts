/**
 * \author Zachary Wartell
 * \copyright Copyright 2015. Zachary Wartell.
 * \license Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
 - http://creativecommons.org/licenses/by-nc-sa/4.0/

 \status [STATUS=not deployed] work-in-progress
 */

/**** UNUSED CLASS     ****
 **** WORK IN PROGRESS *****/

/**
 Misc. Global variables
 */
var Global =
    {
        /**
         * @brief directory for student being graded
         * @type {string}
         */
        studentDirectory : "",
        /**
         * \todo make this configuration by application
         */
        visualStudio : "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\Common7\\IDE\\devenv.exe"
    };


/**
 \brief GradingScript generates and downloads a Bash script from the browser that
 when executed on the client PC automates various parts of the task of grading a particular <section>'s
 set of instructions (ol.Instructions)

 \todo [PRIORITY=LOW] Long term consider replacing bash script with NodeJS to simplify project maintenance
 */
class GradingScript
{
    projectDirectory : string;
    category : string;
    constructor(...args)
    {
        switch(args.length)
        {
            case 0:
                this.category = "";
                this.projectDirectory = "";
                break;
            case 1:
                this.category = args[0].category;
                this.projectDirectory = args[0].projectDirectory;
                break;
        }
    }

    /**
     \brief Download a Bash script customized to semi-automate grading of the the project
     in sub-directory 'projectDir' of the current 'Global.studentDirectory'
     */
    downloadScript()
    {
        // bash script for automatically grading report and process
        const script=
`#!/bin/bash
DIR=\`cygpath -u "${Global.studentDirectory}"\`/${this.projectDirectory}
CATEGORY=${this.category}
#echo Enter Student Directory:
#read studentDir
#pushd "$studentDir/$DIR"

#
# interactively deal with student mis-named directories, by help grader
# find matching folder names and then proceeding with the matching one
#
if [[ ! -d "$DIR" ]]; then
    echo Directory "$DIR" does not exist, searching parent directories...
    UPPER_DIR=\`dirname $DIR\`
    levels=1
    while [[ "$UPPER_DIR" != "" ]] && [[ ! -d "$UPPER_DIR" ]]; do
        echo Directory '$UPPER_DIR' does not exist, checking parent directory...
        UPPER_DIR=\`dirname $UPPER_DIR\`
        levels = (( levels + 1 ))
    done    
    if [[ "$UPPER_DIR" == "" ]]; then
        echo FATAL ERROR: Could not find any upper level directories in the path.
        exit 1
    fi
    echo Attempting to match:
    echo     '$DIR'
    echo starting with:
    echo     '$UPPER_DIR'
    while [[ ! -d "$UPPER_DIR" ]] && [[ $level -ne 1 ]]; do
        echo Potential directories under '$UPPER_DIR': 
        find "$UPPER_DIR" -maxdepth 1 -type d 
        while [[ ! -d "$UPPER_DIR" ]]; do
            echo -n Enter name of best matching directory name:
            read directoryName
            NEW_UPPER_DIR=$UPPER_DIR/$directoryName
            if [[ ! -d "$NEW_UPPER_DIR" ]]; then
                echo '$NEW_UPPER_DIR' does not exist.  Please try again
            else
                UPPER_DIR=$NEW_UPPER_DIR
            fi
        done
        level = (( level - 1 ))
    done    
fi

#
# collect basic info on project subdirectory and store in report.json file
#
pushd "$DIR" 1>2
REC="report.json"

# find .sln file
echo {                                          > $REC

echo '"category"' : "$CATEGORY",			    >> $REC

if [[ $CATEGORY == "MSVSSolution" ]]; then
    SLN=\`find . -name "*.sln"\`
    echo '"solutionFile"' : "$SLN",			    >> $REC
    
    # open solution file in Visual Studio
    start "${Global.visualStudio}" $SLN
    
    # find all 'user' source code files
    CODE_FILES_CONDITION='-name "*.cs" ! -name "*.AssemblyInfo.cs"'				
    CODE_FILES=\`mktemp codefiles.XXXXX.txt\`
    find . $CODE_FILES_CONDITION > $CODE_FILES
    
    # save file list to report.json 
    echo '"codeFiles"' : [ 						>> $REC
    sed 's/\\(.*\\)/   "\\1",/M' $CODE_FILES    >> $REC
    echo ], 									>> $REC
     
    # perform line of code count and save to report.json
    find . $CODE_FILES_CONDITION -print0 > $CODE_FILES
    #cat $CODE_FILES
    LOC=\`wc -l --files0-from=$CODE_FILES | tail -1l | sed 's/\\([0-9]*\\).*/\\1/'\`
    #echo LOC $LOC
    
    echo '"linesOfCode"' : $LOC,				>> $REC    
fi

# find all 'user' created plain text files				
NON_CODE_FILES_CONDITION='-name ".gitignore" -o -name "*.txt" -o -name "*.md" -a \\( ! -name "*.cs" \\)' 
NON_CODE_FILES=\`mktemp codefiles.XXXXX.txt\`
find . $NON_CODE_FILES_CONDITION > $NON_CODE_FILES

# save file list to report.json 
echo '"nonCodeFiles"' : [ 						>> $REC
sed 's/\\(.*\\)/   "\\1",/M' $NON_CODE_FILES    >> $REC
echo ], 									    >> $REC
 
# perform line of count for non-code text files and save to report.json
find . $NON_CODE_FILES_CONDITION -print0 > $NON_CODE_FILES
#cat $CODE_FILES
LOC=\`wc -l --files0-from=$NON_CODE_FILES | tail -1l | sed 's/\\([0-9]*\\).*/\\1/'\`
#echo LOC $LOC

echo '"linesOfNonCode"' : $LOC,				    >> $REC

echo } 										    >> $REC
#rm $CODE_FILES
popd 1>2

echo Hit Enter to complete
read EnterKey`;
        //console.log("InsertGradeButton:"+studentDirectory);

        switch(this.category)
        {
            case 'Question':
                // \todo What do to here to help automate grading?
                break;
            case 'DirectoryCreation':
                // \todo What do to here to help automate grading?
                break;
            case 'MSVSSolution':
            {
                // encode script into URL object
                let url = URL.createObjectURL(new Blob([script] , {type: 'application/octet-stream; charset=UTF-8'}));

                // create hyperlink to download bash script
                const link = document.createElement('a');
                link.href = url;
                link.innerText = "Run Grade.sh";
                link.download = "Grade.sh";

                // automatically 'click' hyperlink to trigger download
                // \ref https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                break;
            }
        }
    }
}

