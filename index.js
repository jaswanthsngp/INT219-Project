
let arr = [];
let shortenedLinks = [];

$(() => {
    // nav menu on mobile layout 
    $('#nav-button').click(function (e) { 
        e.preventDefault();
        if($('nav').css('display')==='none')
            $('nav').css('display', 'block');
        else
            $('nav').css('display', 'none');
    });

    // set array in local storage
    localStorage.setItem("links", JSON.stringify([
        // {original: "https://example.com", shortened: "https://rel.ink/a"},
        // {original: "https://google.com", shortened: "https://rel.ink/b"},
        // {original: "https://mozilla.org", shortened: "https://rel.ink/c"},
        // {original: "https://w3c.org", shortened: "https://rel.ink/d"},
    ]));

    refereshLinks();

    // onClick handler on submitting link
    $('#shorten-submit').click(function (e) { 
        e.preventDefault();
        // console.log("Entered Handler fn");
        let inputLink = $('#shorten-ip').val();
        if(inputLink.length===0) {
            $('#error').text('Please add a Link');
            $('#error').css('margin', '0.5rem auto');
            $('#shorten-ip').css('border', '2px solid red');
            $('form.flex').css('padding-bottom', '0.75rem');
        } else {
            shortenLink(inputLink)
        }
    });
});

function refereshLinks() {
    // adding link cards to the UI
    arr = JSON.parse(localStorage.getItem("links"));
    console.log(arr);
    if(arr.length!==0) {
        $('#shortened-links').empty();
        for(let i=0; i<arr.length; i++) {
            let element = arr[i];
            // console.log(element)
            let newLink = 
            `<div class="stored-links flex d-flex flex-column justify-content-center align-items-center col-12 p-2">
                <div class="link-card flex d-flex flex-column justify-content-center align-items-center col-12 p-2 bg-white rounded-1 flex-md-row">
                <div class="link-text flex d-flex flex-column justify-content-center align-items-center col-12 p-2 flex-md-row justify-content-md-between col-md-11">
                    <span class="original col-12 m-1 col-md-auto">${element.original}</span>
                    <span class="shortened col-12 m-1 fg--cyan col-md-auto">${element.shortened}</span>
                </div>
                <button type="button" class="btn col-12 m-1 p-2 col-md-1 bg--cyan fw-bold text-white copy" onclick="copyLink(this)">Copy</button>
                </div>
            </div>`;
            $('#shortened-links').html($('#shortened-links').html()+newLink);
        }
    }
}

// helper fn
function findInArr(arr, x) {
    for(let i=0; i<arr.length; i++) {
        if(arr[i].original === x)
            return true;
    }
    return false;
}

function copyLink(element) {
    // onClick handler for copy button
    let text = element.previousElementSibling.children[1].innerText;
    navigator.clipboard.writeText(text);
    element.innerText = 'Copied!';
    element.style.backgroundColor = 'black';
    setTimeout(() => {
        element.innerText = 'Copy';
        element.style.backgroundColor = 'var(--cyan)';
    }, 1500)
}

// API handler, to create/fetch links and add to local storage
async function shortenLink(inputLink) {
    let linkRequest = {
        destination: `${inputLink}`,
        domain: { fullName: "rebrand.ly" }
    }
      
    let requestHeaders = {
        "Content-Type": "application/json",
        "apikey": "ae7ba87a84454a51adda73612d21c632",
        "workspace": "3fa00176db1c4ffcbc5cb1d6ade5e890"
    }

    let absent = await isNotIn(inputLink).then();
    console.log(absent);

    if(absent) {
        $.ajax({
            url: "https://api.rebrandly.com/v1/links",
            type: "post",
            data: JSON.stringify(linkRequest),
            headers: requestHeaders,
            dataType: "json",
            success: (link) => {
                console.log(`Long URL was ${link.destination}, short URL is ${link.shortUrl}`);
                shortenedLinks.push({"original": link.destination, "shortened": link.shortUrl});
                let a = JSON.parse(localStorage.getItem("links"));
                a.push({"original": link.destination, "shortened": link.shortUrl});
                localStorage.setItem("links", JSON.stringify(a));
                refereshLinks();
            }
        });
    } else {
        let a = JSON.parse(localStorage.getItem("links"));
        for(let i=0; i<shortenedLinks.length; i++) {
            console.log(shortenedLinks[i]);
            if(shortenedLinks[i].original === inputLink && !findInArr(a, inputLink)) {
                a.push({"original": shortenedLinks[i].original, "shortened": shortenedLinks[i].shortened});
                localStorage.setItem("links", JSON.stringify(a));
            }
        }
    }
    refereshLinks();
}

// API that fetches any links that are already shortened
async function fetchShortenedLinks() {
    // console.log("Fetching through API");
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', apikey: 'ae7ba87a84454a51adda73612d21c632'}
    };
    
    await fetch('https://api.rebrandly.com/v1/links?orderBy=createdAt&orderDir=desc&limit=25', options)
        .then(response => response.json())
        .then(response => {
            // console.log(response);
            shortenedLinks = [];
            for(let i=0; i<response.length; i++) {
                shortenedLinks.push({ "original": response[i].destination, "shortened": response[i].shortUrl});
            }
            // console.log(shortenedLinks);
        })
        .catch(err => console.error(err));
}

// helper fn
async function isNotIn(inputLink) {
    await fetchShortenedLinks()
    // console.log(shortenedLinks);
    for(let i=0; i<shortenedLinks.length; i++) {
        // console.log(shortenedLinks[i]);
        if(shortenedLinks[i].original === inputLink) {
            return false;
        }
    }
    // console.log(shortenedLinks);
    return true;
}

// "apikey": "ae7ba87a84454a51adda73612d21c632",
// "workspace": "3fa00176db1c4ffcbc5cb1d6ade5e890"
