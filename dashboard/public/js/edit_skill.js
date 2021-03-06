function showEditor() {
  $("#code-alert").hide();
  $("#editor").show();
}

function configureSecret() {
  $.ajax({
    type: "GET",
    baseUrl: base_url,
    url: `/skills/${skillName}/secret`,
    dataType: 'json',
    success: (json) => {
      $("#configure-secret-alert").empty();

      $("#configure-secret-form table tbody").empty();
      if (json.secret) {
        for (let secret of json.secret) {
          $('#configure-secret-form table tbody').append(`<tr><td><input class="form-control key" placeholder="key" value="${secret[0]}"></td><td><input class="form-control value" placeholder="value" value="${secret[1]}"></td><td class="align-middle"><span class="action text-danger" aria-label="Delete secret." title="Delete secret." onClick="deleteSecret(this)"><i class="fas fa-times"></i></span></td></tr>`.trim());
        }
      }

      $('#configure-secret-modal').modal('show');
    },
    error: (err) => {
      console.log(err);
    }
  });
};

function deleteSecret(button) {
  $(button)[0].parentNode.parentNode.remove();
}

function displayConfigureSecretAlert({ title = "Error", message = "Couldn't save secret." } = {}) {
  $("#configure-secret-alert").empty();
  $("#configure-secret-alert").append(`
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <h4 class="alert-heading">${title}</h4>
      <p>${message}</p>
      <button class="close" type="button" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `.trim());
};
var whiteListConnectorsTab;
var blackListConnectorsTab;
var whiteListUsersTab;
var connectorsTab;
var authorsTab;
$.ajax({
  type: "GET",
  baseUrl: base_url,
  url: `/connectors`,
  success: (json) => {
    connectorsTab = json.connectors;
  },
  error: (err) => {
    console.log(err);
  }
})

function getAuthors() {
  $.ajax({
    type: "GET",
    baseUrl: base_url,
    url: `/skills/${skillName}/authors`,
    dataType: "json",
    success: (json) => {
      $('#authors').empty();
      authorsTab = json.authors;
      authorsTab.forEach(element => {
        $('#authors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteAuthor('${element}')"></i></li>`)
      });
      $("#authors-modal").modal("show");
    },
    error: (err) => {
      notifyUser({
        title: "Error",
        message :"Error getting the authors",
        type: "error"
      });
    }
  })
}

function addAuthor() {
  var newAuthor = $('#newAuthor').val();
  $('#newAuthor').val('');
  $.ajax({
    type: "POST",
    baseURL: base_url,
    url: `/skills/${skillName}/authors/${newAuthor}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("authors-modal", { title: "Success", message: "The user was added to the authors, reload or save the skill to save the modifications",type:"success"});
      authorsTab.push(newAuthor);
      $('#authors').empty();
      authorsTab.forEach(element => {
        $('#authors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteAuthor('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("authors-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update authors." ,type:"danger"});
    }
  })
} 

function deleteAuthor(userName) {
  $.ajax({
    type: "DELETE",
    baseUrl: base_url,
    url: `/skills/${skillName}/authors/${userName}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("authors-modal", { title: "Success", message: "The authors was deleted from the author's list, reload or save the skill to save the modifications",type:"success"});
      authorsTab.splice(authorsTab.findIndex(a => a === userName),1);
      $('#authors').empty();
      authorsTab.forEach(element => {
        $('#authors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteAuthor('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("authors-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update authors" ,type:"danger"}); 
    }
  })
}

function whiteListConnectors() {
  $.ajax({
    type: "GET",
    baseUrl: base_url,
    url: `/skills/${skillName}/whitelist_connector`,
    dataType: "json",
    success: (json) => {
      $('#whitelistConnectors').empty();
      whiteListConnectorsTab = json.whitelist_connector;
      whiteListConnectorsTab.forEach(element => {
        $('#whitelistConnectors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteWhitelistConnector('${element}')"></i></li>`)
      });
      $('#newWhitelistConnector').empty();
      connectorsTab.forEach(element => {
        $('#newWhitelistConnector').append(`<option>${element.name}</opion>`);
      });
      $("#whitelistConnector-modal").modal("show");
    },
    error: (err) => {
      notifyUser({
        title: "Error",
        message :"Error getting the whitelist Connector",
        type: "error"
      });
    }
  })
}

function addWhitelistConnector() {
  var newWhitelistConnectorName = $('#newWhitelistConnector').val();
  $.ajax({
    type: "POST",
    baseURL: base_url,
    url: `/skills/${skillName}/whitelist_connector/${newWhitelistConnectorName}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("whitelistConnector-modal", { title: "Success", message: "The connector was added to the connector whitelist, reload or save the skill to save the modifications" ,type:"success"});
      whiteListConnectorsTab.push(newWhitelistConnectorName);
      $('#whitelistConnectors').empty();
      whiteListConnectorsTab.forEach(element => {
        $('#whitelistConnectors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteWhitelistConnector('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("whitelistConnector-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update whitelist." ,type:"danger"});
    }
  })
} 

function deleteWhitelistConnector(connectorName) {
  $.ajax({
    type: "DELETE",
    baseUrl: base_url,
    url: `/skills/${skillName}/whitelist_connector/${connectorName}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("whitelistConnector-modal", { title: "Success", message: "The connector was deleted from the connector whitelist, reload or save the skill to save the modifications" ,type:"success"});
      whiteListConnectorsTab.splice(whiteListConnectorsTab.findIndex(a => a === connectorName),1);
      $('#whitelistConnectors').empty();
      whiteListConnectorsTab.forEach(element => {
        $('#whitelistConnectors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteWhitelistConnector('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("whitelistConnector-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update whitelist.",type:"danger"}); 
    }
  })
}

function blackListConnectors() {
  $.ajax({
    type: "GET",
    baseUrl: base_url,
    url: `/skills/${skillName}/blacklist_connector`,
    dataType: "json",
    success: (json) => {
      $('#blacklistConnectors').empty();
      blackListConnectorsTab = json.blacklist_connector;
      blackListConnectorsTab.forEach(element => {
        $('#blacklistConnectors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteBlacklistConnector('${element}')"></i></li>`)
      });
      $('#newBlacklistConnector').empty();
      connectorsTab.forEach(element => {
        $('#newBlacklistConnector').append(`<option>${element.name}</opion>`);
      });
      $("#blacklistConnector-modal").modal("show");
    },
    error: (err) => {
      notifyUser({
        title: "Error",
        message :"Error getting the blacklist Connector",
        type: "error"
      });
    }
  })
}

function addBlacklistConnector() {
  var newBlacklistConnectorName = $('#newBlacklistConnector').val();
  $('#newBlacklistConnector').val('');
  $.ajax({
    type: "POST",
    baseURL: base_url,
    url: `/skills/${skillName}/blacklist_connector/${newBlacklistConnectorName}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("blacklistConnector-modal", { title: "Success", message: "The connector was added to the connector blacklist, reload or save the skill to save the modifications" ,type:"success"});
      blackListConnectorsTab.push(newBlacklistConnectorName);
      $('#blacklistConnectors').empty();
      blackListConnectorsTab.forEach(element => {
        $('#blacklistConnectors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteBlacklistConnector('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("blacklistConnector-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update blacklist." ,type:"danger"});
    }
  })
} 

function deleteBlacklistConnector(connectorName) {
  $.ajax({
    type: "DELETE",
    baseUrl: base_url,
    url: `/skills/${skillName}/blacklist_connector/${connectorName}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("blacklistConnector-modal", { title: "Success", message: "The connector was deleted from the connector blacklist, reload or save the skill to save the modifications" ,type:"success"});
      blackListConnectorsTab.splice(blackListConnectorsTab.findIndex(a => a === connectorName),1);
      $('#blacklistConnectors').empty();
      blackListConnectorsTab.forEach(element => {
        $('#blacklistConnectors').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteBlacklistConnector('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("blacklistConnector-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update blacklist." ,type:"danger"}); 
    }
  })
}

function whiteListUsers() {
  $.ajax({
    type: "GET",
    baseUrl: base_url,
    url: `/skills/${skillName}/whitelist_user`,
    dataType: "json",
    success: (json) => {
      $('#whiteListUsers').empty();
      whiteListUsersTab = json.whitelist_user;
      whiteListUsersTab.forEach(element => {
        $('#whiteListUsers').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteWhiteListUser('${element}')"></i></li>`)
      });
      $("#whitelistUsers-modal").modal("show");
    },
    error: (err) => {
      notifyUser({
        title: "Error",
        message :"Error getting the whitelist users",
        type: "error"
      });
    }
  })
}

function addWhiteListUser() {
  var newWhitelistUser = $('#newWhitelistUser').val();
  $('#newWhitelistUser').val('');
  $.ajax({
    type: "POST",
    baseURL: base_url,
    url: `/skills/${skillName}/whitelist_user/${newWhitelistUser}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("whitelistUsers-modal", { title: "Success", message: "The user was added to the user whitelist, reload or save the skill to save the modifications",type:"success"});
      whiteListUsersTab.push(newWhitelistUser);
      $('#whiteListUsers').empty();
      whiteListUsersTab.forEach(element => {
        $('#whiteListUsers').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteWhiteListUser('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("whitelistUsers-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update whitelist." ,type:"danger"});
    }
  })
} 

function deleteWhiteListUser(userName) {
  $.ajax({
    type: "DELETE",
    baseUrl: base_url,
    url: `/skills/${skillName}/whitelist_user/${userName}`,
    dataType: "json",
    success: (json) => {
      displayModalAlert("whitelistUsers-modal", { title: "Success", message: "The connector was deleted from the user whitelist, reload or save the skill to save the modifications",type:"success"});
      whiteListUsersTab.splice(whiteListUsersTab.findIndex(a => a === userName),1);
      $('#whiteListUsers').empty();
      whiteListUsersTab.forEach(element => {
        $('#whiteListUsers').append(`<li class="list-group-item d-flex justify-content-between align-items-center">${element} <i class="fas fa-minus text-danger action" title="Remove role" onClick="deleteWhiteListUser('${element}')"></i></li>`)
      });
    },
    error: (err) => {
      displayModalAlert("whitelistUsers-modal", { title: "Error", message: err.responseJSON ? err.responseJSON.message : "Could not update blacklist." ,type:"danger"}); 
    }
  })
}

function displayModalAlert(modal, { title = "Error", message = "Couldn't save secret." ,type ="warning"} = {}) {
  $(`#${modal} .modal-alert`).empty();
  $(`#${modal} .modal-alert`).append(`
    <div class="alert alert-${["info","success","danger","warning"].includes(type) ? type: "warning"} alert-dismissible fade show" role="alert">
      <h4 class="alert-heading">${title}</h4>
      <p>${message}</p>
      <button class="close" type="button" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `.trim());
}

// Add a new line to the secrets table in modal.
$("#new-secret").click((event) => {
  $('#configure-secret-form table tbody').append(`<tr><td><input class="form-control key" placeholder="key"></td><td><input class="form-control value" placeholder="value"></td><td class="align-middle"><span class="action text-danger" aria-label="Delete secret." title="Delete secret." onClick="deleteSecret(this)"><i class="fas fa-times"></i></span></td></tr>`.trim());
});


$("#configure-secret-form").submit(function (event) {
  event.preventDefault();

  // Build secret array
  let secrets = [];
  for (let secret of $("#configure-secret-form table tbody tr")) {
    let key = $(secret).find(".key").val();
    let value = $(secret).find(".value").val();
    secrets.push([key, value]);
  }
  $.ajax({
    type: "PUT",
    baseUrl: base_url,
    url: `/skills/${skillName}/secret`,
    contentType: 'application/json',
    data: JSON.stringify({ secret: secrets }),
    dataType: "json",
    success: (json) => {
      $("#configure-secret-modal").modal('hide');
      notifyUser({
        title: "Secret saved!",
        message: "The new secret configuration is saved, and skill was reloaded.",
        type: "success",
        delay: 2
      });
    },
    error: (err) => {
      displayConfigureSecretAlert(err);
    }
  });
});

$("#save-skill").click(function () {
  skillCode = editor.getValue();

    let notificationId = notifyUser({
      title: "Saving skill...",
      message: "We are pushing your skill, please wait.",
      type: "info",
      delay: -1
    });
    $.ajax({
      method: "PUT",
      baseUrl: base_url,
      url: "/skills/" + skillName + "/code",
      data: { code: skillCode, codeId },
      dataType: "json",
      success: function (json) {
        dismissNotification(notificationId);
        if (json.success) {
          $("#edited-skill-data").attr("data-skill-codeid", json.codeId);		
          codeId = json.codeId;
          notifyUser({
            title: "Skill pushed!",
            message: `Your skill ${skillName} is updated and running!`,
            type: "success",
            delay: 5
          });
        } else {
          codeId = json.codeId;
          notifyUser({
            title: `Can't push ${skillName}`,
            message: json.message,
            type: "error",
            delay: 5
          });
        }
      },
      error: function (err) {
        console.log(err);
        if (err.responseJSON && err.responseJSON.codeId) {
          codeId = err.responseJSON.codeId;
        }
        dismissNotification(notificationId);
        notifyUser({
          title: "Error",
          message: err.responseJSON.message || `Couldn't push ${skill.name}.`,
          type: "error",
          delay: 5
        });
      }
    })
});


// Load code editor (hidden).
let editor = ace.edit('editor');
editor.session.setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');
let editedSkillData = $('#edited-skill-data');
var skillName = editedSkillData.data('skill-name');
var skillCode = editedSkillData.data('skill-code');
var codeId = editedSkillData.data('skill-codeid');
$('#skill-generate').hide();
$('#skill-toolbox').show();
$("#left-panel").removeClass("col-md-4");
$("#left-panel").addClass("col-md-2");
$("#middle-panel").removeClass("col-md-6");
$("#middle-panel").addClass("col-md-8");

editor.setValue(skillCode);
editor.clearSelection();
showEditor();
$('#loader').hide();
$('#skill-editor').show();

//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// TOOLBOX

/**
 * Onclick from button to see logs
 */
function loadLogs() {
  let editedSkillData = $('#edited-skill-data');
  let skillName = editedSkillData.data('skill-name');
  $.ajax({
    method: "GET",
    baseUrl: base_url,
    url: "/skills/" + skillName + "/logs",
    dataType: "json",
    success: function (json) {
      $("#logsForSkill").text(json.logs);
      $("#logsModal").modal("show");
    },
    error: function (err) {
      notifyUser({
        title: "Could not get logs",
        message: err.responseJSON.message || "Unknown error occured",
        type: "error",
        delay: 2
      })
    }
  })
}

function deleteLogs() {
  let editedSkillData = $('#edited-skill-data');
  let skillName = editedSkillData.data('skill-name');
  $.ajax({
    method: "DELETE",
    baseUrl: base_url,
    url: "/skills/" + skillName + "/logs",
    dataType: "json",
    success: function (json) {
      loadLogs();
    },
    error: function (err) {
      notifyUser({
        title: "Could not delete logs",
        message: err.responseJSON.message || "Unknown error occured",
        type: "error",
        delay: 2
      })
    }
  })
}

$('#logsModal').on('shown.bs.modal', (e) => {
  $("#logsForSkill").scrollTop($("#logsForSkill").prop('scrollHeight'));
});

$.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
     return null;
  }
  else{
     return decodeURI(results[1]) || 0;
  }
}

if($.urlParam('newSkill')) {
  let editedSkillData = $('#edited-skill-data');
  let skillName = editedSkillData.data('skill-name');
  window.history.pushState("", "", "/dashboard/skills/"+skillName+"/edit");
  notifyUser({
    title: "Skill pushed!",
    message: `Your new skill ${skillName} is now running!`,
    type: "success",
    delay: 5
  });
}

//
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// HELP

/**
 * Update content of modal and display help according to the requested topic.
 * @param {String} topic 
 */
function displayHelp(topic) {
  if (!topic) {
    // Display generic help modal.
    $("#help-modal .modal-title").text("How to...");
    $("#help-modal .modal-body").html(
      '<div class="list-group list-group-flush">'
      + Object.entries(help).map(([topic, content]) => {
        return `
          <a class="list-group-item list-group-item-action action" onClick="displayHelp('${topic}')">
            <small>${content.title.replace('How to', "")}</small>
          </a>
        `.trim()
      }).join("\n")
      + '</div>');
    $("#help-modal").modal('show');
    return;
  }

  // get topic content
  const content = help[topic];
  if (!content) {
    console.warn("> Requested an unkown topic: " + topic);
    displayHelp();
    return;
  }
  $("#help-modal .modal-title").text(content.title);
  $("#help-modal .modal-body").html(
    '<a href="#" onClick="displayHelp()">Back to summary</a><hr>'
    + content.content
  );
  $("#help-modal").modal('show');
}

const help = {
  'commands': {
    title: 'How to add a new command to a skill?',
    content: `
      <p>To create a new command, you can use the helper button in the left pannel "Add Command".</p>
      <p>To manually add the command, call the <code>addCommand(cmd, name, handler, help)</code> method of the skill:</p>
      <code style="white-space: pre-wrap;">
        skill.addCommand("hello", "say-hello", ({ phrase, data }) => {
          return Promise.resolve().then(() => {
            /*
              Your code should go there. When you are ready to send the message, use the following return statement:
            */
            skill.log("A user requested the hello command.");
            return {
              message: {
                title: 'Hello, world!',
                text: 'The hello command was successfull!'
              }
            };
          });
        }, {
          description: "Make the bot say hello."
        });
      </code>
      <p>Don't forget the Promise or your skill will not work! Don't hesitate to return custom error messages instead of throwing errors.</p>
      <p>The first parameter <code>cmd</code> is the word the user will type to call the command: <code>!hello</code>.</p>
      <p>The last parameter <code>help</code> is required, and must at least define a description. See the <a href="#" onClick="displayHelp('help')">create help</a> section.</p>
    `.trim()
  },
  'help': {
    title: 'How to create a great manual ?',
    content: `
      <p>You are required to define a manual for each of your skill's commands. It is declared as the fourth parameter of the <code>addCommand()</code> function.</p>
      <p>The help must at least contains a <strong>description</strong> field for the command. But may contain other elements. The <strong>examples</strong> field should be considered first after the description.</p>
      <p><em>Let's consider a skill that can display text in red or in green : !say red [text] and !say green [text]</em></p>
      <code style="white-space: pre-wrap;">
        {
          description: "Say something with colours!",
          parameters: [
            {
              position: 0,
              name: "color",
              description: "red or green."
              example: "red"
            },
            {
              position: 1,
              name: "color",
              description: "The text to display.",
              example: "What a text!"
            }
          ],
          examples: [
            {
              phrase: "say red Hello my friend!",
              action: "Display 'Hello my friend!' in red."
            }
          ]
        }
      </code>
      <p>You may also define subcommands.</p>
      <p><em>Let's consider a skill that can attach, detach, and list webhooks in a channel.</em></p>
      <code style="white-space: pre-wrap;">
        {
          description: "Entrypoint of the Git skill.",
          subcommands: [
              {
                  name: "create-webhook",
                  cmd: "attach",
                  description: "Attach a new webhook in this channel.",
                  parameters: [
                      {
                          position: 0,
                          name: "repository",
                          description: "Name of the webhook to create.",
                          example: "arachne-bot"
                      }
                  ],
                  examples: [
                      {
                          phrase: "git attach arachne",
                          action: "Create a new webhook named arachne"
                      }
                  ]
              },
              {
                  name: "remove-webhook",
                  cmd: "detach",
                  description: "Detach a webhook from this channel.",
                  parameters: [
                      {
                          position: 0,
                          name: "name",
                          description: "Name of the webhook to remove.",
                          example: "arachne-bot"
                      }
                  ],
                  examples: [
                      {
                          phrase: "git detact arachne",
                          action: "Delete the webhook named arachne. You should also delete it from gitlab."
                      }
                  ]
              },
              {
                  name: "list-webhook",
                  cmd: "list",
                  description: "List webhook in this channel.",
                  examples: [
                      {
                          phrase: "git list",
                          action: "List the webhooks in this channel."
                      }
                  ]
              }
          ]
        }
      </code>
    `.trim()
  },
  'intents': {
    title: 'How to add a new nlp intent to a skill?',
    content: `
      <p>Skill may be linked to natural language intents, you can use the helper button in the left pannel "Add Intent".</p>
      <p>To manually add the intent, call the <code>addIntent(slug, name, handler)</code> method of the skill:</p>
      <code style="white-space: pre-wrap;">
        skill.addIntent("weather", "get-weather", { entities: { location: location = "" }, phrase = "", data }) => {
          return Promise.resolve().then(() => {
            /*
              Your code should go there. You may return a message object, but usually, you will call a command handler
              that is the command-mode equivalent of the user's intent, usually by creating a "phrase" with the entities.
            */
            const phrase = location[0];
            skill.log("Calling the getWeatherHandler command for " + phrase);
            return skill.handleCommand("weather", ({ phrase, data });
          });
        });
      </code>
      <p>Entities are arrays of values found in the initial user's phrase.</p>
      <p>
        The first paramater <code>slug</code> is the exact name of the intent recognized by your NLU processing service (forced to lowercase).
      </p>
    `.trim()
  },
  'threads': {
    title: 'How to create a conversation with the user?',
    content: `
      <p>To create a conversation flow, you can use the helper button in the left pannel "Add interaction".</p>
      <p>To manually add the conversation flow, call the <code>addInteraction(name, handler)</code> method of the skill:</p>
      <code style="white-space: pre-wrap;">
        skill.addInteraction("noYesHandler", (thread, { phrase, data }) => {
          return Promise.resolve().then(() => {
            /*
              The thread object, given by the brain, allow the skill to getData('key') and setData('key', value) in
              the thread, to keep track of context.
            */
            const question = thread.getData('question');
            if (['yes', 'no'].includes(phrase.toLowerCase())) {
              return {
                message: {
                  title: 'You answered: ' + phrase,
                  text: 'To the question: ' + question
                }
              }
            } else {
              return {
                message: {
                  title: 'Invalid answer',
                  text: 'It must be yes or no.',
                  interactive: true
                }
              }
            }
          });
        });
      </code>
      <p>To enter in interactive mode, simply add <code>interactive: true</code> in the returned message object. The brain will continue the current thread. To create a new one, add a <code>thread</code> object in addition to the <code>interactive: true</code>:</p>
      <code style="white-space: pre-wrap;">
        message: {
          interactive: true,
          thread: {
            source: question,
            data: [
              ['question', question]
            ],
            handler: "noYesHandler",
            duration: 30,
            timeout_message: "You took too much time to give your answer.",
          },
          title: 'What a question!',
          text: question
        }
      </code>
    `.trim(),
  },
  'secrets': {
    title: 'How to store secret variables?',
    content: `
      <p>You should store secret variables, like api tokens and api credentials, in the secret object of a skill. The secret will not be displayed in skill's code.</p>
      <p>To edit the secrets of a skill, use the <strong>Configure Secret</strong> handler in the left pannel.</p>
      <p>You can require the secret with the <code>skill.getSecret()<code> method.</p>
      <code style="white-space: pre-wrap;">
        const secret = skill.getSecret();
      </code>
    `.trim()
  },
  'skills': {
    title: "How to call another skill's command?",
    content: `
      <p>You may need to call another skill from within yours (like getting a one-use token for an external API that is used by several skills). You can use the <strong>Use another skill</strong> helper in the left pannel.</p>
      <p>To add the interaction manually, call the following code from within your function handler:</p>
      <code style="white-space: pre-wrap;">
        skill.execute("hello", { phrase, data }).then(response => {
          // The response is the response given by the skill, containing the message and eventually additionnal data.
          // Do something with the token, which will eventually return a message object.
          return { message: {} };
        }).catch(err => {
          return {
            message: {
              title: 'Oups :(',
              text: 'Could not fulfill your request, sorry.'
            }
          }
        });
      </code>
      <p>Don't forget to catch the error! You should always return something to the user. Following the Promise chain pattern is good practise, but you may find more easy to <code>return new Promise((resolve, reject) => {})</code>.</p>
    `.trim()
  },
  'modules': {
    title: 'How to require node modules?',
    content: `
      <p>Skills may only require a restricted list of node modules. If you need more, you should probably consider creating an external microservice and connecting it to the brain using <a href="#" onClick="displayHelp('pipes')">Pipes</a></p>
      <p>To require a module, use the <code>skill.loadModule(module)</code> method.</p>
      <code style="white-space: pre-wrap;">
        const request = skill.loadModule("request");
      </code>
      <p><em>If you attempt to require an unallowed module, you will be warned by the brain whe you try to save or activate the skill.</em></p>
    `.trim()
  },
  'requests': {
    title: "How to call an external API?",
    content: `
      <p>You will certainly want to call an external service. You may use the <strong>axios</strong> (recommended for its Promise support) or the <strong>request</strong> package.</p>
      <p>Simply call axios methods from withing your command handler:</p>
      <code style="white-space: pre-wrap;">
        const token = require("./secret").token;
        const client = phrase;
        return axios({
          method: "GET",
          url: "https://brokkr.orochi.io/clients/$\{client}/apps",
          data: { app_token: token },
          timeout: 5000
        }).then(res => {
          let text = "";
          res.data.content.forEach(app => {
             text += \`- *$\{app.name}*: _$\{app.status}_\`;
          });
          return {
              message: {
                  title: \`Applications on $\{phrase}\`,
                  private: true,
                  text
              }
          };
        }).catch(err => {
          return {
            message: {
                title: 'Could not get applications list.',
                text: 'The Brokkr service is not accessible.'
            }
          };
        });
      </code>
      <p>Don't forget to catch errors, you should always return a message to the user.</p>
    `.trim()
  },
  'pipes': {
    title: 'How to I listen for external events?',
    content: `
      <p>You may need to wait for external API calls, like a github integration or another webhook. You can request a Pipe that will call your skill when to hook is received:</p>
      <code style="white-space: pre-wrap;">
        skill.createPipe("helloPipeHandler", { withHook: true }).then(pipe => {
          // Pipe created :)
          // Pipe is an object that contain its identifier.
          // The url will be https://thebrainurl/pipes/{skillName}/{identifier}
          // Using withHook: true will populate the pipe with a hook object
          // That can be used to contact the adapter.
        });
      </code>
      <p>You need to create a handler for your pipe.</p>
      <code style="white-space: pre-wrap;">
        skill.addPipe("helloPipeHandler", (pipeIdentifier, { data, headers, hookId }) => {
          /*
            Will be called by the brain when the url is called with a POST request,
            data will by the body, and headers will contain the request headers (if any).
            If te pipe was created with withHook: true, hookId will be defined.
          */
          return skill.useHook(hookId, message, options);
        });
      </code>
      <p>If you need to send back a message to a user or a channel, you must use <strong>hooks</strong> (see the appropriate help section).</p>
    `.trim()
  },
  'hooks': {
    title: 'How to I send a message to a channel without being requested?',
    content: `
      <p>For security reasons, skills can't send messages to a channel without authorization. You need the request a hook to the brain and wait for the Adapter to confirm it.</p>
      <code style="white-space: pre-wrap;">
        skill.createHook().then(hook => {
          return resolve({
            message: {
                title: "Hook request",
                text: "I need a hook to call you :)",
                request_hook: true,
                hook: hook
            }
          });
        });
      </code>
      <p>Most adapters will validate immediatly the hook, but some may ask the user. Once your hook is valid, it will be executable with:</p>
      <code style="white-space: pre-wrap;">
        return skill.useHook(hookId, { message }, { deleteHook: false });
      </code>
      <p>
        The second argument being the skill's response with the message. Set deleteHook to true to delete the hook after execution.
        <br>
        If you need hooks that are persistent, you will need to store them. See the storage help section.
      </p>
    `.trim()
  },
  'storage': {
    title: 'How to store persistent data?',
    content: `
      <p>You may need to keep data event if the brain reload, like hooks id, alarms, or some other things. To do so, use the getItem and storeItem methodes from the skill:</p>
      <code style="white-space: pre-wrap;">
        const hooks = [];
        hooks.push(...);
        skill.storeItem("hooks", hooks).then(() => {
          // Object stored!
        }).catch(err => skill.log(err));
      </code>
      <p>To retrieve data:</p>
      <code style="white-space: pre-wrap;">
        const hooks = [];
        hooks.push(...);
        skill.getItem("hooks").then((hooks) => {
          // Object retrieved!
        }).catch(err => skill.log(err));
      </code>
    `.trim()
  }
}

//
//////////////////////////////////////////////////////////////////////////////////////