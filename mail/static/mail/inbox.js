document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    document.querySelector('#compose-form').onsubmit = send_email;

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#errorMessages').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
    // Clear previous content
    document.querySelector('#emails-view').innerHTML = '';

    const funcTable = {
        ['inbox'] : function(){
            fetch('/emails/inbox')
            .then(response => response.json())
            .then(data => {
                console.log(`Inbox:`)
                console.log(data)
                data.forEach(email => {
                    let firstDiv = '';
                    let html = `<div class='card-body'>`+
                      `<a href='' onclick='loadEmail()'><h5 class='card-title'>${email['subject']}</h5></a>`+
                      `<h6 class='card-subtitle mb-2 text-muted'>From: ${email['sender']}</h6>`+
                      `<p class='float-right'><strong>${email['timestamp']}</strong></p>`+
                    `</div>`+
                    `</div>`
                    if(email['read']){
                        firstDiv = `<div class='card bg-secondary' data-id=${email['id']}>`
                    }else{
                        firstDiv = `<div class='card bg-light' data-id=${email['id']} style='background-color: white;'>`
                    }
                    //`<div class='card' data-id=${email['id']}>`+
                    document.querySelector('#emails-view').insertAdjacentHTML('beforeend', firstDiv+html);
                    
                    
                })
            })
        },
        ['sent'] : function(){
            fetch('/emails/sent')
            .then(response => response.json())
            .then(data => {
                console.log(`Sent:`)
                console.log(data)
                data.forEach(email => {
                    let firstDiv = '';
                    let recipients = '';
                    email['recipients'].forEach(destination => {
                        if(recipients == ''){
                            recipients += `${destination}`;
                            return
                        }
                        recipients += `,${destination}`
                    })
                    let html = `<div class='card-body'>`+
                      `<h5 class='card-title'>${email['subject']}</h5>`+
                      `<h6 class='card-subtitle mb-2'>Sent to: ${recipients}</h6>`+
                      `<p class='float-right'><strong>${email['timestamp']}</strong></p>`+
                    `</div>`+
                    `</div>`

                    if(email['read']){
                        firstDiv = `<div class='card bg-secondary' data-id=${email['id']}>`
                    }else{
                        firstDiv = `<div class='card bg-light' data-id=${email['id']} style='background-color: white;'>`
                    }
                    document.querySelector('#emails-view').insertAdjacentHTML('beforeend', firstDiv+html);
                })
            })
        },
        ['archive'] : function(){},
    }
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    funcTable[mailbox]();
}

function send_email(){
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value
        })
    })
    .then(response => response.json())
    .then(result => {
        if(result['error']){
            const errorDiv = document.querySelector('#errorMessages');
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = result['error'];
            return
        }
        load_mailbox('sent');
    })
    return false;
}