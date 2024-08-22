//Load fixes when DOM is loaded
document.addEventListener('DOMContentLoaded', fireContentLoadedEvent,false);

function fireContentLoadedEvent () {
    getSubmissionElement(); //hideShow fix
    getGoogleAssignmentElement(); //scroll fix
    nextPrevious(); //nextPrevious button add to grading google docs
}

//Reload google assignment scroll fix and nextPrevious buttons if the user is switching between assignment, in progress, and submission
const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver(mutations => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        getGoogleAssignmentElement();
        nextPrevious();
      }
    });
    observer.observe(body, { childList: true, subtree: true });
  };
window.onload = observeUrlChange;

//Google assignment scroll fix
function getGoogleAssignmentElement(){
    if(location.href.indexOf('submissions') == -1){ //have to be on the submissions page because the error only happens here. Not on the inProgress page
        return;
    }
    //Find element
    const elements = document.getElementsByTagName('ol');
    const googleAssignmentElement = elements[0];

    if(googleAssignmentElement && elements.length == 1){
        //Fix element
        const doc = document.getElementsByClassName('SubmissionAppContainer')[0];
        googleAssignmentElement.style.overflow = "scroll";
        googleAssignmentElement.style.height = doc.offsetHeight+'px';
    }else{
        setTimeout(getGoogleAssignmentElement,500); //wait and try again because google doc loading may be blocking the fix
    }
}

//Hide/Show student submission fix
var hide = false;
function getSubmissionElement(){
    //Find element
    const rightColumn = document.getElementById('right-column');

    if(rightColumn){
        //Add button
        const hideShowBtn = document.createElement('button');
        hideShowBtn.id = 'hideShowBtn';
        hideShowBtn.style.padding = '5px';
        hideShowBtn.style.position = 'relative';
        hideShowBtn.style.top = '10px';
        hideShowBtn.style.left = '20px';
        rightColumn.insertBefore(hideShowBtn, rightColumn.childNodes[0]);
        hideShowBtn.addEventListener('click',hideShow);

        //Hide button right away by default
        hideShow();
    }
}

//Button function
function hideShow(){
    hide = !hide; //flip hide<->show
    
    //get elements from page
    const hideShowBtn = document.getElementById('hideShowBtn');
    const submissions = document.getElementById('right-column-inner');
    
    //hide/show
    submissions.style.display = hide ? 'none' : '';
    //change button text
    hideShowBtn.textContent = hide ?  'Show Submissions' : 'Hide Submissions';
}

//Next and previous buttons for google doc assignments
function nextPrevious(){
    if(location.href.indexOf('submissions') == -1 || document.getElementById("buttonContainer")){ //have to be on the submissions page only
        return;
    }
    try{
        const elements = document.getElementsByTagName('ol');
        const students = elements[0].childNodes; //all students
        const header = document.getElementsByClassName("document-header-module-headerContent-3565416603")[0];
        if(elements){
            if(students.length >= 2 && elements.length == 1){ //everything is loaded on the page and there are more than 1 student
                //make container div
                const container = document.createElement('div');
                container.id = 'buttonContainer';
                header.insertBefore(container, header.childNodes[1]);

                //add buttons
                const nextBtn = document.createElement('button');
                nextBtn.id = 'nextBtn';
                nextBtn.style.padding = '5px';
                nextBtn.style.marginLeft = '5px';
                nextBtn.textContent = "Next Student ->"
                container.insertBefore(nextBtn, container.childNodes[0]);
                nextBtn.addEventListener('click',nextStudent);

                const prevBtn = document.createElement('button');
                prevBtn.id = 'prevBtn';
                prevBtn.style.padding = '5px';
                nextBtn.style.marginRight = '5px';
                prevBtn.textContent = "<- Previous Student"
                container.insertBefore(prevBtn, container.childNodes[0]);
                prevBtn.addEventListener('click',prevStudent);
            }
        }
    }catch(e){
        console.warn(e);
        setTimeout(nextPrevious,500); //wait and try again because google doc loading may be blocking the fix
    }
}



function nextStudent(){
    const elements = document.getElementsByTagName('ol');
    const students = elements[0].childNodes; //all students

    let selectedStudent = 0;

    //Find current student selected
    for(var i = 0; i < students.length; i++){
        if(students[i].classList.contains("student-switcher-card-cardActive-4278587313")){
            selectedStudent = i;
        }
    }
    
    //go to next student
    if(selectedStudent < students.length-1){
        //deactive current student
        students[selectedStudent].classList.remove("student-switcher-card-cardActive-4278587313");
        //increase selection
        selectedStudent++;
        //click on the next student
        students[selectedStudent].childNodes[0].click();
    }
}

function prevStudent(){
    const elements = document.getElementsByTagName('ol');
    const students = elements[0].childNodes; //all students

    let selectedStudent = 0;

    //Find current student selected
    for(var i = 0; i < students.length; i++){
        if(students[i].classList.contains("student-switcher-card-cardActive-4278587313")){
            selectedStudent = i;
        }
    }
    
    //go to previous student
    if(selectedStudent > 0){
        //deactive current student
        students[selectedStudent].classList.remove("student-switcher-card-cardActive-4278587313");
        //increase selection
        selectedStudent--;
        //click on the next student
        students[selectedStudent].childNodes[0].click();
    }
}