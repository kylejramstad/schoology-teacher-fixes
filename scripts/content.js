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

// --- NEW GRADING NOTES LOGIC ---
function createNotesPanel() {
    // Only build the physical object once
    if (document.getElementById('fs-notes-panel')) return; 

    // Extract assignment ID to keep notes separate for different assignments
    const assignmentIdMatch = window.location.href.match(/assignments\/(\d+)/);
    const assignmentId = assignmentIdMatch ? assignmentIdMatch[1] : 'global';
    const storageKey = `schoology_notes_${assignmentId}`;

    // Create the main panel
    const panel = document.createElement('div');
    panel.id = 'fs-notes-panel';
    // Manipulate spatial dimensions and force it to float above everything
    panel.style.cssText = 'position: fixed; top: 70px; right: 20px; width: 320px; height: 400px; background: #fff; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999999; display: none; flex-direction: column; padding: 10px; box-sizing: border-box;';

    // Header for the panel
    const header = document.createElement('div');
    header.style.cssText = 'font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; color: #333; font-family: sans-serif;';
    header.textContent = 'Grading Notes & Rubric';
    
    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '✖';
    closeBtn.style.cssText = 'cursor: pointer; font-size: 14px; color: #888;';
    closeBtn.onclick = () => panel.style.display = 'none';
    header.appendChild(closeBtn);

    // Text Area
    const textArea = document.createElement('textarea');
    textArea.id = 'fs-notes-textarea';
    textArea.style.cssText = 'flex-grow: 1; resize: none; border: 1px solid #eee; padding: 8px; font-family: inherit; font-size: 14px; outline: none; background: #fdfdfd;';
    textArea.placeholder = 'Type your grading criteria here. This saves automatically per assignment...';
    
    // Load existing notes from the browser's local storage
    textArea.value = localStorage.getItem(storageKey) || '';

    // Auto-save whenever you type
    textArea.addEventListener('input', (e) => {
        localStorage.setItem(storageKey, e.target.value);
    });

    panel.appendChild(header);
    panel.appendChild(textArea);
    
    // Attach directly to the body so React doesn't destroy it when switching students
    document.body.appendChild(panel);
}
// -----------------------------

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
                
                // Initialize the Notes Panel in the background
                createNotesPanel();

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

                //add notes button
                const notesBtn = document.createElement('button');
                notesBtn.id = 'notesBtn';
                notesBtn.style.padding = '5px';
                notesBtn.style.marginLeft = '15px';
                notesBtn.textContent = "📝 Notes";
                container.appendChild(notesBtn);
                notesBtn.addEventListener('click', () => {
                    const panel = document.getElementById('fs-notes-panel');
                    if (panel) {
                        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                    }
                });

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

                // RE-APPLY full screen styles if the user navigated to the next student while in full screen mode
                if (isFullScreen) {
                    setTimeout(applyFullScreen, 200); 
                }
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
let modifiedElements = []; 
let originalBodyOverflow = '';

// Helper to rip elements out of stacking contexts and elevate them
function elevateAndNeutralize(element, newStyles) {
    if (!element) return;
    
    // Save original styles for restoration
    const originalStyles = {};
    for (let prop in newStyles) {
        originalStyles[prop] = element.style.getPropertyValue(prop);
        element.style.setProperty(prop, newStyles[prop], 'important');
    }
    modifiedElements.push({ element: element, styles: originalStyles });

    // Climb the DOM tree and strip any CSS that creates a restrictive bounding box
    let parent = element.parentElement;
    while(parent && parent !== document.documentElement && parent.tagName !== 'BODY') {
        if (!modifiedElements.some(m => m.element === parent)) {
            modifiedElements.push({
                element: parent,
                styles: {
                    'transform': parent.style.getPropertyValue('transform'),
                    'z-index': parent.style.getPropertyValue('z-index'),
                    'overflow': parent.style.getPropertyValue('overflow'),
                    'contain': parent.style.getPropertyValue('contain'),
                    'clip-path': parent.style.getPropertyValue('clip-path')
                }
            });

            parent.style.setProperty('transform', 'none', 'important');
            parent.style.setProperty('z-index', 'auto', 'important');
            parent.style.setProperty('overflow', 'visible', 'important');
            parent.style.setProperty('contain', 'none', 'important');
            parent.style.setProperty('clip-path', 'none', 'important');
        }
        parent = parent.parentElement;
    }
}

function restoreStyles() {
    for (let i = modifiedElements.length - 1; i >= 0; i--) {
        const item = modifiedElements[i];
        for (let prop in item.styles) {
            if (item.styles[prop] === "" || item.styles[prop] === null) {
                item.element.style.removeProperty(prop);
            } else {
                item.element.style.setProperty(prop, item.styles[prop]);
            }
        }
    }
    modifiedElements = [];
}

function applyFullScreen() {
    const docContainers = document.getElementsByClassName('SubmissionAppContainer');
    if(docContainers.length === 0) return; 
    const targetObject = docContainers[0]; 
    
    const btn = document.getElementById('fullScreenBtn');
    const notesBtn = document.getElementById('notesBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Uses a wildcard selector to ensure we catch the grading container even if Schoology changes the ID hash
    const gradingContainer = document.querySelector('[class*="document-header-aside-graded-container"]');

    restoreStyles(); // Clear any previous state to prevent duplication

    // 1. Create a physical dark gray background bar for our header
    let headerBg = document.getElementById('fs-header-bg');
    if(!headerBg) {
        headerBg = document.createElement('div');
        headerBg.id = 'fs-header-bg';
        document.body.appendChild(headerBg);
    }
    headerBg.style.setProperty('display', 'block', 'important');
    headerBg.style.setProperty('position', 'fixed', 'important');
    headerBg.style.setProperty('top', '0', 'important');
    headerBg.style.setProperty('left', '0', 'important');
    headerBg.style.setProperty('width', '100vw', 'important');
    headerBg.style.setProperty('height', '60px', 'important');
    headerBg.style.setProperty('background', '#555555', 'important'); // Darker gray for white text readability
    headerBg.style.setProperty('border-bottom', '1px solid #333', 'important');
    headerBg.style.setProperty('z-index', '999997', 'important');

    // 2. Inject CSS specifically to elevate the dynamic React Grading Modal
    let modalStyleTag = document.getElementById('fs-modal-styles');
    if (!modalStyleTag) {
        modalStyleTag = document.createElement('style');
        modalStyleTag.id = 'fs-modal-styles';
        document.head.appendChild(modalStyleTag);
    }
    modalStyleTag.innerHTML = `
        .ReactModalPortal,
        .ReactModalPortal > div {
            z-index: 9999999 !important;
        }
    `;

    // 3. Lock body scrolling
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.setProperty('overflow', 'hidden', 'important');

    // 4. Elevate Document Container
    elevateAndNeutralize(targetObject, {
        'position': 'fixed',
        'top': '60px',
        'left': '0',
        'width': '100vw',
        'height': 'calc(100vh - 60px)',
        'max-width': '100%',
        'max-height': '100%',
        'z-index': '999996'
    });

    // 5. Elevate Nav Buttons (Left Side)
    if (prevBtn) elevateAndNeutralize(prevBtn, {
        'position': 'fixed',
        'top': '15px',
        'left': '20px',
        'z-index': '999999',
        'background-color': '#ffffff',
        'color': '#000000',
        'border': '1px solid #ccc',
        'border-radius': '4px',
        'padding': '5px'
    });

    if (nextBtn) elevateAndNeutralize(nextBtn, {
        'position': 'fixed',
        'top': '15px',
        'left': '170px',
        'z-index': '999999',
        'background-color': '#ffffff',
        'color': '#000000',
        'border': '1px solid #ccc',
        'border-radius': '4px',
        'padding': '5px'
    });

    // 6. Elevate Exit Button (Right Side)
    if (btn) {
        elevateAndNeutralize(btn, {
            'position': 'fixed',
            'top': '15px',
            'right': '20px',
            'z-index': '999999',
            'background-color': '#ffffff',
            'color': '#000000',
            'border': '1px solid #ccc',
            'border-radius': '4px',
            'padding': '5px'
        });
        btn.textContent = "✖ Exit Full Screen (Esc)";
    }

    // 7. Elevate Grading Block (Right Side, next to Exit)
    if (gradingContainer) elevateAndNeutralize(gradingContainer, {
        'position': 'fixed',
        'top': '10px',
        'right': '210px',
        'z-index': '999999',
        'background-color': 'transparent', 
        'padding': '5px 10px',
        'border-radius': '4px'
    });
    
    // 8. Elevate Notes Button (Right Side, left of Grading Block)
    if (notesBtn) {
        elevateAndNeutralize(notesBtn, {
            'position': 'fixed',
            'top': '15px',
            'right': '380px',
            'z-index': '999999',
            'background-color': '#ffffff',
            'color': '#000000',
            'border': '1px solid #ccc',
            'border-radius': '4px',
            'padding': '5px'
        });
    }
}

function exitFullScreen() {
    const headerBg = document.getElementById('fs-header-bg');
    if(headerBg) headerBg.style.setProperty('display', 'none', 'important');

    const modalStyleTag = document.getElementById('fs-modal-styles');
    if (modalStyleTag) modalStyleTag.remove(); // Remove modal override when exiting

    restoreStyles();
    document.body.style.overflow = originalBodyOverflow;
    
    const btn = document.getElementById('fullScreenBtn');
    if (btn) btn.textContent = "⛶ Full Screen";
}

function toggleFullScreen(){
    isFullScreen = !isFullScreen;
    if(isFullScreen){
        applyFullScreen();
    } else {
        exitFullScreen();
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