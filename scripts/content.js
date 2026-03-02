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
    
    if(elements.length > 0){
        const googleAssignmentElement = elements[0];
        //Fix element
        const docContainers = document.getElementsByClassName('SubmissionAppContainer');
        if(docContainers.length > 0) {
            const doc = docContainers[0];
            googleAssignmentElement.style.overflow = "scroll";
            googleAssignmentElement.style.height = doc.offsetHeight+'px';
        } else {
             setTimeout(getGoogleAssignmentElement,500);
        }
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
        // Safety check to prevent TypeError if the list hasn't loaded yet
        if (elements.length === 0) {
            setTimeout(nextPrevious, 500);
            return;
        }
        
        const students = elements[0].childNodes; //all students
        const headers = document.getElementsByClassName("document-header-module-headerContent-3565416603");
        
        if(headers.length > 0){
            const header = headers[0];
            if(students.length >= 2){ //everything is loaded on the page and there are more than 1 student
                //make container div
                const container = document.createElement('div');
                container.id = 'buttonContainer';
                header.insertBefore(container, header.childNodes[1]);

                //add full screen button
                const fullScreenBtn = document.createElement('button');
                fullScreenBtn.id = 'fullScreenBtn';
                fullScreenBtn.style.padding = '5px';
                fullScreenBtn.style.marginLeft = '15px';
                fullScreenBtn.textContent = "⛶ Full Screen";
                container.appendChild(fullScreenBtn);
                fullScreenBtn.addEventListener('click', toggleFullScreen);

                //add next button
                const nextBtn = document.createElement('button');
                nextBtn.id = 'nextBtn';
                nextBtn.style.padding = '5px';
                nextBtn.style.marginLeft = '5px';
                nextBtn.textContent = "Next Student →";
                container.insertBefore(nextBtn, container.childNodes[0]);
                nextBtn.addEventListener('click',nextStudent);

                //add previous button
                const prevBtn = document.createElement('button');
                prevBtn.id = 'prevBtn';
                prevBtn.style.padding = '5px';
                prevBtn.style.marginRight = '5px';
                prevBtn.textContent = "← Previous Student";
                container.insertBefore(prevBtn, container.childNodes[0]);
                prevBtn.addEventListener('click',prevStudent);
            }
        } else {
             setTimeout(nextPrevious, 500);
        }
    }catch(e){
        console.warn(e);
        setTimeout(nextPrevious,500); //wait and try again because google doc loading may be blocking the fix
    }
}

// --- FULL SCREEN LOGIC ---
let isFullScreen = false;
let originalDocStyles = {};
let originalNextBtnCss = '';
let originalPrevBtnCss = '';
let modifiedAncestors = [];
let originalBodyOverflow = '';

function toggleFullScreen(){
    // Target the main wrapper object instead of the iframe
    const docContainers = document.getElementsByClassName('SubmissionAppContainer');
    if(docContainers.length === 0) return; 
    const targetObject = docContainers[0]; 
    
    const btn = document.getElementById('fullScreenBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    isFullScreen = !isFullScreen;

    if(isFullScreen){
        // Save original spatial dimensions and positioning
        originalDocStyles = {
            position: targetObject.style.position,
            top: targetObject.style.top,
            left: targetObject.style.left,
            width: targetObject.style.width,
            height: targetObject.style.height,
            zIndex: targetObject.style.zIndex,
            maxWidth: targetObject.style.maxWidth,
            maxHeight: targetObject.style.maxHeight
        };
        
        // Save original button CSS
        if(nextBtn) originalNextBtnCss = nextBtn.style.cssText;
        if(prevBtn) originalPrevBtnCss = prevBtn.style.cssText;
        
        // Traverse up the DOM to remove structural boundaries trapping the object
        let parent = targetObject.parentElement;
        while(parent && parent !== document.documentElement) {
            const computed = window.getComputedStyle(parent);
            if (computed.transform !== 'none' || computed.overflow !== 'visible' || computed.contain !== 'none' || computed.filter !== 'none') {
                modifiedAncestors.push({
                    element: parent,
                    transform: parent.style.transform,
                    overflow: parent.style.overflow,
                    contain: parent.style.contain,
                    filter: parent.style.filter
                });
                
                // Neutralize parent boundaries
                parent.style.setProperty('transform', 'none', 'important');
                parent.style.setProperty('overflow', 'visible', 'important');
                parent.style.setProperty('contain', 'none', 'important');
                parent.style.setProperty('filter', 'none', 'important');
            }
            parent = parent.parentElement;
        }

        // Lock the main background page from scrolling
        originalBodyOverflow = document.body.style.overflow;
        document.body.style.setProperty('overflow', 'hidden', 'important');

        // Expand object's dimensions to fill the viewport
        targetObject.style.setProperty('position', 'fixed', 'important');
        targetObject.style.setProperty('top', '0', 'important');
        targetObject.style.setProperty('left', '0', 'important');
        targetObject.style.setProperty('width', '100vw', 'important');
        targetObject.style.setProperty('height', '100vh', 'important');
        targetObject.style.setProperty('max-width', '100%', 'important');
        targetObject.style.setProperty('max-height', '100%', 'important');
        targetObject.style.setProperty('z-index', '999998', 'important'); 
        
        // Detach exit button and float it over the object (Top Right)
        btn.textContent = "✖ Exit Full Screen (Esc)";
        btn.style.setProperty('position', 'fixed', 'important');
        btn.style.setProperty('top', '15px', 'important');
        btn.style.setProperty('right', '20px', 'important');
        btn.style.setProperty('z-index', '999999', 'important');
        
        // Float Next Button (Top Right, shifted left of Exit button)
        if(nextBtn) {
            nextBtn.style.setProperty('position', 'fixed', 'important');
            nextBtn.style.setProperty('top', '15px', 'important');
            nextBtn.style.setProperty('right', '210px', 'important');
            nextBtn.style.setProperty('left', 'auto', 'important'); // Overrides inline left
            nextBtn.style.setProperty('z-index', '999999', 'important');
            nextBtn.style.setProperty('background-color', '#ffffff', 'important');
            nextBtn.style.setProperty('box-shadow', '0 2px 5px rgba(0,0,0,0.3)', 'important');
        }

        // Float Previous Button (Top Right, shifted left of Next button)
        if(prevBtn) {
            prevBtn.style.setProperty('position', 'fixed', 'important');
            prevBtn.style.setProperty('top', '15px', 'important');
            prevBtn.style.setProperty('right', '350px', 'important');
            prevBtn.style.setProperty('left', 'auto', 'important'); // Overrides inline left
            prevBtn.style.setProperty('z-index', '999999', 'important');
            prevBtn.style.setProperty('background-color', '#ffffff', 'important');
            prevBtn.style.setProperty('box-shadow', '0 2px 5px rgba(0,0,0,0.3)', 'important');
        }
        
    } else {
        // Restore object dimensions
        targetObject.style.position = originalDocStyles.position;
        targetObject.style.top = originalDocStyles.top;
        targetObject.style.left = originalDocStyles.left;
        targetObject.style.width = originalDocStyles.width;
        targetObject.style.height = originalDocStyles.height;
        targetObject.style.zIndex = originalDocStyles.zIndex;
        targetObject.style.maxWidth = originalDocStyles.maxWidth;
        targetObject.style.maxHeight = originalDocStyles.maxHeight;
        
        // Restore parent boundaries
        modifiedAncestors.forEach(item => {
            item.element.style.transform = item.transform;
            item.element.style.overflow = item.overflow;
            item.element.style.contain = item.contain;
            item.element.style.filter = item.filter;
        });
        modifiedAncestors = [];

        // Restore body scrolling
        document.body.style.overflow = originalBodyOverflow;

        // Return Exit button to the header
        btn.textContent = "⛶ Full Screen";
        btn.style.position = 'static';
        btn.style.zIndex = 'auto';
        
        // Restore Next and Previous buttons
        if(nextBtn) nextBtn.style.cssText = originalNextBtnCss;
        if(prevBtn) prevBtn.style.cssText = originalPrevBtnCss;
    }
}

// Listen for the Escape key to exit full screen
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && isFullScreen) {
        toggleFullScreen();
    }
});
// -----------------------------

function nextStudent(){
    const elements = document.getElementsByTagName('ol');
    if (elements.length === 0) return; // Safety check
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
    if (elements.length === 0) return; // Safety check
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