const server_url = (location.hostname.includes('127.0.0.1') || location.hostname.includes('localhost')) ? `http://localhost:7777` : `https://pandemic-archive-of-voices-db.herokuapp.com`

var json_data;

const getDatabaseData = () => {
  $.get(`${server_url}/api/data`, function(data, status){
    // alert("Data: " + data + "\nStatus: " + status);
    console.log("data", data)
    json_data = data;
    onDataLoaded();
  });  
}

const renderTable = () => {
  $("#table_body").empty()
  var table_body = json_data.audios.reverse().map((audio, index) => {
    let action_button = audio.disabled === true ? "Enable" : "Disable"; 
    let status = audio.disabled === true ? "table-danger" : "table-success";
    let btn = audio.disabled === true ? "btn-primary" : "btn-warning"
    return `
      <tr class="${status}">
        <th scope="row">${index}</th>
        <td>
          <audio preload="none" controls>
            <source src="${audio.path}" type="audio/wav">
          </audio>
        </td>
        <td>${audio.id}</td>
        <td>${audio.user_id}</td>
        <td><input data-text-id="${audio.id}" class="form-control form-control-sm" type="text" value="${audio.text}" readonly></input></td>
        <td><button data-id="${audio.id}" type="button" class="btn btn-primary edit">Edit</button></td>
        <td>${audio.duration}</td>
        <td>${audio.lang.code}</td>
        <td><button data-id="${audio.id}" type="button" class="btn ${btn} ${action_button.toLowerCase()}">${action_button}</button></td>
        <td><button data-id="${audio.id}" type="button" class="btn btn-danger delete">Delete</button></td>
      </tr>
    `
  })
  table_body = table_body.join('')
  $("#table_body").append(table_body)
}

const addActionEvents = () => {
  $("button.enable").click(function () {
    let id = $(this).data('id') + ""
    let audio_data = json_data.audios.find(a => a.id === id)
    audio_data.disabled = false
    updateAudio(audio_data)
  })

  $("button.disable").click(function () {
      let id = $(this).data('id') + ""
      let audio_data = json_data.audios.find(a => a.id === id)
      audio_data.disabled = true
      updateAudio(audio_data)
  })

  $("button.delete").click(function () {
    let id = $(this).data('id') + ""
    let audio_data = json_data.audios.find(a => a.id === id)
    audio_data.deleted = true
    updateAudio(audio_data)
  })

  $("button.edit").click(function () {
    let id = $(this).data('id') + ""
    let input = $(`[data-text-id=${id}]`)
    let audio_data = json_data.audios.find(a => a.id === id)
    if ($(this).hasClass("btn-success")) {
      input.attr("readonly", true)
      $(this).text("Edit")
      $(this).removeClass("btn-success")
      let text = input.val()
      audio_data.text = text
      updateAudio(audio_data)
    } else {
      input.attr("readonly", false)
      $(this).text("Save")
      $(this).addClass("btn-success")
    }
    // let audio_data = json_data.audios.find(a => a.id === id)
    // audio_data.deleted = true;
    // updateAudio(audio_data)
  })
}

const onDataLoaded = () => {
  renderTable();
  addActionEvents();
}

const updateAudio = (audio_data) => {
  modal()
  $.ajax({
    type: "PUT",
    url: `${server_url}/api/audio`,
    data: JSON.stringify(audio_data),
    contentType: 'application/json',
    success: onPutSuccess,
    error: onPutError,
  });
}

const onPutSuccess = (res) => {
  console.log("Sucess!", res)
  $('.modal').modal('hide');
  getDatabaseData()
  // renderTable();
  // addActionEvents();
}

const onPutError = (res) => {
  console.error("Error!", res)
  $('.modal').modal('hide');
}

function modal(){
  $('.modal').modal('show');
}

getDatabaseData();