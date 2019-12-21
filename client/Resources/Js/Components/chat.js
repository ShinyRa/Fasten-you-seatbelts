// maakt variabelen die nodig zijn om de chat te gebruiken
var partnerid;
var my_room_id;
var chatSelected = false;
var menu_open = 0;
var chat_loaded = false;
var socket;

if(socket === undefined){
    socket = io.connect(location.hostname === "127.0.0.1" ? "http://127.0.0.1:1337" : location.hostname === "is106-2.fys-hva.tk" ? "https://is106-2-app.fys-hva.tk/" : "http://pasively.com:1337");
}

//dit wordt uitgevoerd bij het laden van de pagina.
function start() {
    //laad de matches die je links boven in de chat ziet staan.
    LoadMatches();
    //zorgt voor de witte select box als je op een match klikt.
    $(document).on('click', '.person', e => {
        let person = $(e.target).closest('div.person');
        $('.person').removeClass('selected');
        person.addClass('selected');
    });
    $(document).keypress(e => {if (e.keyCode == 13) { sendMessage(); }});
    $('.messages').on("scroll", () => {$('a.up').hide().show()});
}

function mobile_match_toggle(){
      if(menu_open){
          $('.people').width("0%");
          menu_open = 0;
      }else{
          $('.people').width("50%");
          menu_open = 1;
      }
}


//hier worden de matches geladen die je links boven ziet.
function LoadMatches() {
    // maakt een template van een persoon zodat die gebruikt kan worden voor aalle matches
    let match = $(".person:first-child").clone();
    //Hier wordt een ajax request gestuurd naar de chatroutes waar een sql query staat die de matches ophalen.
    ajaxRequest('POST', '/api/getMatches', {token: sessionStorage.getItem('token')}, (data, xhr) => {
        //als er een 200 OK response terug komt wordt de data ontleed.
        if (xhr.status === 200) {
            //hier wordt gechecked of niet de eigen id wordt doorgestuurd.
            for (var i = 0; i < data.result.length; i++) {
                let partnerid;
                if (data.userId !== data.result[i].User1) {
                    partnerid = data.result[i].User1;
                }
                if (data.userId !== data.result[i].User2) {
                    partnerid = data.result[i].User2;
                }
                //hier wordt een ajax request gestuurd zodat de naam wordt opgehaald van de match.
                ajaxRequest('POST', '/api/getMatchesEnd', {partnerid: partnerid}, (data_end, xhr_end) => {
                    //hier worden de matches met naam links boven neergezet.

                    let localmatch = match;
                    localmatch.css('display', 'block');
                    localmatch.attr("onclick", "loadChat(" + partnerid + ")");
                    localmatch.children(".name")[0].innerHTML = data_end.result_end[0].voornaam;

                    let path = (data_end.result_end[0].profielfoto) ? './Resources/Img/Uploads/user_' + data_end.result_end[0].UserID + '/' + data_end.result_end[0].profielfoto : './Resources/Img/default_profile.jpg';

                    localmatch.children('.match-picture').children('.profile-pic').attr('src', path);
                    localmatch.children('.match-picture').attr('onclick', 'localStorage.setItem("partner_id", ' + data_end.result_end[0].UserID + ')');
                    $(".people").append(localmatch.clone());
                });
            }
        }
    });
}

//hier worden de messages gestuurd
function sendMessage(){
    //haalt input object op
    let text = $('input[type="text"]');
    //haalt de message eruit
    let message = text.val();
    let time = new Date();
    // dit werkt niet als er geen chat geselecteerd wordt. anders gaat de message nergens naar toe. je krijgt dan terug: "Wow je kan geen berichten sturen als je geen chat open hebt staan!"
    if(chatSelected){
      if (message.length > 0) {
          //hier wordt je eigen id en je partnersid opgehaald nodig om de match id te krijgen
          let chatids = {
            token: sessionStorage.getItem('token'),
            partnerid: partnerid
          };
          ajaxRequest('POST', '/api/getChat',chatids, (data, xhr) =>{
              let roomid = data.result[0].MatchID;
              //hier wordt een bericht opgeslagen met het bericht de verstuurder en de chatroom waar je in zat
              ajaxRequest('POST', '/api/saveMessage',{message: message, token: sessionStorage.getItem('token'), Matchid: roomid}, (data, xhr) =>{ });
          });
            //Hier wordt het bericht naar de server gestuurd zodat de server het kan terug sturen naar de chat partner.
            socket.emit('chat', {
                message: message,
                room_id: my_room_id,
                time: time
            });
          //hier wordt ervoor gezorgt dat je eigen message op je scherm wordt geplaatst
          let data = {message: message, time: new Date() };
          loadMessage(data, "sender");
          //de message wordt gereset zodat je weer een nieuw berciht kan sturen.
          text.val("");
      }
    }else{
      alert("Wow je kan geen berichten sturen als je geen chat open hebt staan!")
    }
}

//hier worden messages opgevangen die binnen komen vanaf de server en wordt op het scherm geplaatst.
socket.on('chat', function(data){
    loadMessage(data, "reciever");
});

//Hier worden de matches geladen
function loadMessage(data, origin){
    let messageRow = $('.messageRow:hidden').clone();
    if(origin == "sender" ){
        messageRow.find('.message').addClass('myMessage').removeClass('message');
    }else if(origin == "reciever"){
        messageRow.find('.message').addClass('message').removeClass('myMessage');
    }

    function checktime(date){
      if(date.getMinutes()<10){
        return "0"+date.getMinutes()
      }else{
        return date.getMinutes()
      }
    }
    messageRow.find('p').text(data.message);
    let end_date;
    let current = new Date();
    let date = new Date(data.time);
    let time = ""+date.getHours()+":"+checktime(date)+"";
    let day  = ""+date.getDate()+"-"+date.getMonth()+1 +"-"+date.getFullYear()+"";
    let current_day = ""+current.getDate()+"-"+current.getMonth()+1 +"-"+current.getFullYear()+"";

    if(day === current_day){
      end_date = time;
    }else{
      end_date = ""+time+"&nbsp;&nbsp;&nbsp;"+day+"";
    }

    messageRow.find('p.time').html(end_date);
    if ($($('.messages')[0]).scrollTop() == 0) {
        messageRow.hide().prependTo('.messages').slideDown(150);
    } else {
        $('a.up').show();
        messageRow.hide().prependTo('.messages').fadeIn(250, "linear");
      }
}

function loadChat(partnerID){
  if(chat_loaded == false){
    chat_loaded = true;
    chatSelected = true;
    partnerid = partnerID;
    let chatids = {
      token: sessionStorage.getItem('token'),
      partnerid: partnerid
    };
    ajaxRequest('POST', '/api/getChat',chatids, (data, xhr) =>{
      let myid = data.userId;
      if(xhr.status === 200 && data.result[0]){
        my_room_id = data.result[0].MatchID;
        socket.emit('createRoom', {
            roomid: my_room_id
        });
        ajaxRequest('POST', '/api/getMessage', data.result[0], (data) =>{
          let chatlengte = Object.keys(data).length;
          let data_collection;
          for (var i = 0; i < chatlengte ; i++) {
            if(data[i].SenderID == myid){
              data_collection = {message: data[i].bericht, time: data[i].verstuur_datum}
              loadMessage(data_collection, "sender");
            }else{
              data_collection = {message: data[i].bericht, time: data[i].verstuur_datum}
              loadMessage(data_collection, "reciever");
            }
          }
        });
      }
    });
  }else if(chat_loaded == true){
    socket.emit('chat_already_loaded', {
      room_id: my_room_id
    });
    chat_loaded = false;
    $('.messages > .messageRow:not(:last-child)').remove();
    loadChat(partnerID);
  }
}

start();
