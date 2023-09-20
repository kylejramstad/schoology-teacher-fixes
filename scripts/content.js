const checking = setInterval(getElement, 500);
var element;
var size = 15;

function getElement(){
    const elements = document.getElementsByTagName('ol');
    element = elements[0];
    if(element && elements.length == 1 && location.href.indexOf("submissions") > -1){
        clearInterval(checking);
        element.style.overflow = "scroll";
        element.style.height = "500px";
    }
}