$(() => {
    $('#nav-button').click(function (e) { 
        e.preventDefault();
        if($('nav').css('display')==='none')
            $('nav').css('display', 'block');
        else
        $('nav').css('display', 'none');
    });
});