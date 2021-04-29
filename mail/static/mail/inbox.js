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
    document.querySelector('#compose-recipients').disabled = false
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').disabled = false
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').disabled = false
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
                data.forEach(email => {
                    let firstDiv = '';
                    let html = `<div class='card-body'>`+
                      `<a href='javascript:void(0);' id=linkEmail${email.id}><h5 class='card-title'>${email['subject']}</h5></a>`+
                      `<h6 class='card-subtitle mb-2'>From: ${email['sender']}</h6>`+
                      `<span class='float-right'><strong>${email['timestamp']}</strong></span>`+
                    `</div>`+
                    `</div>`

                    // Checks if email is read and changes background accordingly(white = not read, grey = read)
                    if(email['read']){
                        firstDiv = `<div class='card bg-secondary' data-id=${email['id']}>`
                    }else{
                        firstDiv = `<div class='card bg-light' data-id=${email['id']} style='background-color: white;'>`
                    }

                    document.querySelector('#emails-view').insertAdjacentHTML('beforeend', firstDiv+html);

                    // Add event to link to view email
                    document.querySelector(`#linkEmail${email.id}`).addEventListener('click', function(event){
                        loadEmail(email.id,'received');
                    })
                    
                })
            })
        },
        ['sent'] : function(){
            fetch('/emails/sent')
            .then(response => response.json())
            .then(data => {
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
                      `<a href='javascript:void(0);' id=linkEmail${email.id}><h5 class='card-title'>${email['subject']}</h5></a>`+
                      `<h6 class='card-subtitle mb-2'>Sent to: ${recipients}</h6>`+
                      `<span class='float-right'><strong>${email['timestamp']}</strong></span>`+
                    `</div>`+
                    `</div>`

                    // Checks if email is read and changes background accordingly(white = not read, grey = read)
                    if(email['read']){
                        firstDiv = `<div class='card bg-secondary' data-id=${email['id']}>`
                    }else{
                        firstDiv = `<div class='card bg-light' data-id=${email['id']} style='background-color: white;'>`
                    }

                    document.querySelector('#emails-view').insertAdjacentHTML('beforeend', firstDiv+html);
                    
                    // Add event to link to view email
                    document.querySelector(`#linkEmail${email.id}`).addEventListener('click', function(event){
                        loadEmail(email.id,'sent');
                    })
                })
            })
        },
        ['archive'] : function(){
            fetch('/emails/archive')
            .then(response => response.json())
            .then(data => {
                data.forEach(email => {

                    let firstDiv = '';
                    let html = `<div class='card-body'>`+
                      `<a href='javascript:void(0);' id=linkEmail${email.id}><h5 class='card-title'>${email['subject']}</h5></a>`+
                      `<h6 class='card-subtitle mb-2'>From: ${email['sender']}</h6>`+
                      `<span class='float-right'><strong>${email['timestamp']}</strong></span>`+
                    `</div>`+
                    `</div>`

                    // If email is archived then it is read
                    firstDiv = `<div class='card bg-secondary' data-id=${email['id']}>`

                    document.querySelector('#emails-view').insertAdjacentHTML('beforeend', firstDiv+html);

                    // Add event to link to view email
                    document.querySelector(`#linkEmail${email.id}`).addEventListener('click', function(event){
                        loadEmail(email.id,'received');
                    })
                    
                })
            })
        },
    }
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
    // Call respective function
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

function loadEmail(id,emailOrigin){
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(data => {
        let emailView = document.querySelector('#emails-view');
        emailView.innerHTML = '';
        let emailBody = '<div id="emailBody">'+
        '</div>';
        emailView.insertAdjacentHTML('afterbegin', emailBody);

        // Change title to email`s subject
        let title = `<h3>Subject: <h4>${data.subject.charAt(0).toUpperCase() + data.subject.slice(1)}</h4></h3>`

        let replyButton = '';
        let archiveButton = '';
        //Contains sender/receivers,timestamp and email body
        let infos = '';
        if(emailOrigin === 'received'){
            infos = `<span class='text-muted'>From: ${data.sender}</span>`+
            `<span class='float-right'><strong>${data.timestamp}</strong></span><br>`+
            `<div style="border: 2px solid black;padding-left:5px"><p>${data.body}</p></div>`+
            `<button type="button" class="btn btn-primary" id="replyButton" style="margin-top: 5px">Reply</button>`  
            if(data['archived']){
                archiveButton = `<button type="button" class="btn btn-info float-right" id="archiveButton" style="margin-top: 5px">Unarchive</button>`
            }else if(!data['archived']){
                archiveButton = `<button type="button" class="btn btn-info float-right" id="archiveButton" style="margin-top: 5px">Archive</button>`
            }
        }else if(emailOrigin === 'sent'){
            let recipients = '';
            data['recipients'].forEach(destination => {
                if(recipients == ''){
                    recipients += `${destination}`;
                    return
                }
                recipients += `,${destination}`
            })
            infos = `<span class='text-muted'>Sent to: ${recipients}</span>`+
            `<span class='float-right'><strong>${data.timestamp}</strong></span><br>`+
            `<div style="border: 2px solid black;padding-left:5px"><p>${data.body}</p></div>`
        }

        
        document.querySelector('#emailBody').insertAdjacentHTML('afterbegin', title+infos+archiveButton)

        document.querySelector('#archiveButton').addEventListener('click',() => {
            setEmailAsArchivedOrUnarchived(data.id,document.querySelector('#archiveButton').innerHTML)
        })

        document.querySelector('#replyButton').addEventListener('click',() => {
            let emailInfo = {
                "sender" : data.sender,
                "subject" : data.subject,
                "body" : data.body,
                "timestamp" : data.timestamp
            }
            replyEmail(emailInfo)
        })
        //Set email as read
        fetch(`/emails/${id}`,{
            method: 'PUT',
            body : JSON.stringify({
                read : true
            })
        })
    })
}

function setEmailAsArchivedOrUnarchived(id,state){
    let obj = {
        "archived" : false,
    };
    if(state.toLowerCase() === 'archive'){
        obj['archived'] = true;
    }
    fetch(`/emails/${id}`,{
        method: 'PUT',
        body : JSON.stringify(obj)
    })
    load_mailbox('inbox');
}

function replyEmail(emailInfo){
    compose_email();

    document.querySelector('#compose-recipients').value = emailInfo['sender'];
    document.querySelector('#compose-recipients').disabled = true;

    document.querySelector('#compose-subject').value = `Re:${emailInfo['subject']}`;
    document.querySelector('#compose-subject').disabled = true;

    document.querySelector('#compose-body').value = `On ${emailInfo.timestamp} ${emailInfo['sender']} wrote:\n ${emailInfo['body']}\n`;
}