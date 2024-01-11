//Load fixes when DOM is loaded
document.addEventListener('DOMContentLoaded', fireContentLoadedEvent,false);

function fireContentLoadedEvent () {
    getSubmissionElement(); //hideShow fix
    getGoogleAssignmentElement(); //scroll fix
}

//Reload google assignment scroll fix if the user is switching between assignment, in progress, and submission
const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver(mutations => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        getGoogleAssignmentElement();
      }
    });
    observer.observe(body, { childList: true, subtree: true });
  };
  window.onload = observeUrlChange;

//Google assignment scroll fix
function getGoogleAssignmentElement(){
    if(location.href.indexOf('submissions') > -1){ //have to be on the submissions page because the error only happens here. Not on the inProgress page
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