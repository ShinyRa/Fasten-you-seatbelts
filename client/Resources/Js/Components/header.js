function expandMenu(e){
    let element = $(e).parent()[0];

    if($(element).height() === 48) {
        element.style.height = "22rem";
        element.style.overflow = "visible"
    } else {
        element.style.height = '3rem';
        element.style.overflow = "hidden"
    }
}