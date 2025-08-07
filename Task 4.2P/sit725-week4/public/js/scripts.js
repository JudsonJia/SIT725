const getProjects = () => {
    $.get('/api/projects',(response) => {
        if(response.statusCode==200){
            addCards(response.data);
        }
    })
}

// addCards
const addCards = (items = []) => {
    items.forEach(item => {
        let itemToAppend = '<div class="col s4 center-align">' +
            '<div class="card medium"><div class="card-image waves-effect waves-block waves-light">' +
            '<img class="activator" src="' + item.image + '">' +
            '</div>' +
            '<div class="card-content">' +
            '<span class="card-title activator grey-text text-darken-4">' + item.title +
            '<i class="material-icons right">more_vert</i></span><p><a href="#">' + item.link + '</a></p></div>' +
            '<div class="card-reveal">' +
            '<span class="card-title grey-text text-darken-4">' + item.title +
            '<i class="material-icons right">close</i></span>' +
            '<p class="card-text">' + item.description + '</p></div></div></div>';
        $("#card-section").append(itemToAppend);
    });
}

const submitForm = () => {
    let formData = {};
    formData.title = $('#title').val();
    formData.image = $('#image').val();
    formData.link = $('#link').val();
    formData.description = $('#description').val();

    console.log("Form Data", formData);

    $('#title').val('');
    $('#image').val('');
    $('#link').val('');
    $('#description').val('');

    $('#modal1').modal('close');

    M.toast({html: 'Project added successfully!'});
}


const clickMe = () => {

    alert("Thanks for clicking me. Hope you have a nice day!");


    $('.cards-container').fadeIn(1000);


    if ($('#card-section').children().length === 0) {
        getProjects();
    }


    setTimeout(() => {
        $('html, body').animate({
            scrollTop: $('.cards-container').offset().top - 50
        }, 800);
    }, 500);
}


$(document).ready(function(){
    $('.materialboxed').materialbox();
    $('#formSubmit').click(()=>{
        submitForm();
    })
    // getProjects();
    $('.modal').modal();
});