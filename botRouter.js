'use strict';
const express = require('express');
let hub = require('./logic/hub');
const logger = new (require('./logic/components/Logger'))();
const configurationComponent = require('./logic/components/ConfigurationManager');
const ConfigurationManager = new configurationComponent.ConfigurationManager();

// Bot endpoints middleware
function checkConnectorToken(req, res, next) {
  // Checking connector token.
  let token = req.body.token || req.query.token || req.get("x-access-token");

  if (!token) {
    return res.status(403).json({ success: false, error: 403, message: "No token found to authenticate connector."});
  }

  hub.ConnectorManager.checkConnectorToken(token)
    .then((connector) => {
      if (connector && connector.active) {
        if (!connector.ip || req.ip === connector.ip) {
          req.connector_id = connector._id;
          next();
        } else {
          return res.status(403).json({ success: false, error: 403, message: "Invalid token found to authenticate connector."});
        }
      } else {
        return res.status(403).json({ success: false, error: 403, message: "Invalid token found to authenticate connector."});
      }
    })
    .catch((err) => {
      logger.error(err);
      return res.status(500).json({ success: false, error: 501, message: "Internal server error while checking token."});
    });
}

module.exports = function(io) {
  let router = express.Router();

  // NLP conversation entry point.
  /**
   * @api {post} /nlp NLP bot entry point.
   * @apiName NLP
   * @apiGroup Bot
   *
   * @apiParam {String} phrase Text phrase to analyze and execute.
   *
   * @apiSuccess {Boolean} success Success of operation.
   * @apiSuccess {String} message Message from api.
   * @apiSuccess {String} source Source given to the NLP.
   */
  router.post('/nlp', checkConnectorToken, (req, res) => {
    let data = req.body.data || {};
    let phrase = req.body.phrase;
    if (!phrase) {
      return res({ status: 400, message: 'No phrase string to analyze in body.' }, {
        success: false,
        message: { text: 'No phrase string to analyze in body.' },
        source: phrase
      });
    }

    data.connector = { id: req.connector_id }; // Automatically add the connector id to the data object.
    hub.handleCommand('analyze', phrase, data).then((response) => {
      if (!response.response.intent) {

        return res.json({
          success: response.success,
          message: {
            text: hub.ConfigurationManager.loadedConfiguration.errorintent
          },
          source: phrase
        });
      }

      hub.handleIntent(response.response.intent, response.response.entities, data).then((response) => {
        return res.json({ success: response.success, message: response.message, source: phrase });
      }).catch((error) => {
        logger.error(error)
        return res.status(500).json({ success: false, message: { text: 'Unkown error with nlp endpoint.' }, source: phrase });
      })
    }).catch((error) => {
      logger.error(error);
      return res.status(500).json({ success: false, message: { text: 'Unkown error with nlp endpoint.' }, source: phrase });
    });
  })

  // Command handling entry point.
  /**
   * @api {post} /command Command bot entry point.
   * @apiName Command
   * @apiGroup Bot
   *
   * @apiParam {String} command Command phrase to execute (without prefix).
   *
   * @apiSuccess {Boolean} success Success of operation.
   * @apiSuccess {String} message Message from api.
   * @apiSuccess {String} source Source given to the Command handler.
   */
  router.post('/command', checkConnectorToken, (req, res) => {
    let phrase = req.body.command || req.query.command;
    if (!phrase) {
      return res.status(400).json({ success: false, message: { text: 'No command string to parse in body.' }});
    }

    let [command, ...params] = phrase.split(" ");

    hub.handleCommand(command, params.join(" "), req.body.data || {}).then((response) => {
      return res.json({ success: response.success, message: response.message, source: command });
    }).catch((error) => {
      logger.error(error);
      return res.json({ success: false, message: { text: ConfigurationManager.loadedConfiguration.errorcommand }, source: command });
    });
  });

  // Interactive conversation entry point.
  /**
   * @api {post} /converse Interactive conversation bot entry point.
   * @apiName converse
   * @apiGroup Bot
   *
   * @apiParam {String} phrase Phrase answered to bot.
   * @apiParam {String} thread_id Thread id answered to.
   *
   * @apiSuccess {Boolean} success Success of operation.
   * @apiSuccess {String} message Message from api.
   * @apiSuccess {String} source Source given to the Converse handler.
   */
  router.post('/converse', checkConnectorToken, (req, res) => {
    let phrase = req.body.phrase || req.query.phrase;
    let threadId = req.body.thread_id || req.query.thread_id;
    if (!phrase) {
      return res.status(400).json({ success: false, message: { text: 'No answer in body/query.' }});
    }

    if (!threadId) {
      return res.status(400).json({ success: false, message: { text: 'No thread_id in body/query.' }});
    }

    hub.ThreadManager.handleThread(threadId, phrase, req.body.data || {}).then((response) => {
      return res.json({ success: true, message: response.message, source: phrase, thread_id: threadId });
    }).catch((error) => {
      return res.json({ success: false, message: { text: ConfigurationManager.loadedConfiguration.errorthread }, source: phrase, thread_id: threadId });
    });
  });

  router.get('/pipes/:skill/:identifier', (req, res) => {
    logger.info(`Checking at pipe ${req.params.identifier} for skill ${req.params.skill}...`);
    hub.PipeManager.find(req.params.skill, req.params.identifier).then(() => {
        return res.status(200).send("OK");
    }).catch((err) => {
      logger.error(err);
      return res.sendStatus(404);
    });
  });

  router.post('/pipes/:skill/:identifier', (req, res) => {
    logger.info(`Checking at pipe ${req.params.identifier} for skill ${req.params.skill}...`);
    hub.handlePipe(req.params.skill, req.params.identifier, req.body, req.headers).then(() => {
      return res.status(200).json({ success: true, message: 'Data received and transmitted.' });
    }).catch((error) => {
      return res.status(error.code || 500).json({ success: false, message: error.code ? (error.message || "Unkown error with pipe.") : "Unkown error with pipe." });
    });
  });

  // Thread timeout closing endpoint
  /**
   * @api {post} /threads/:threadid/timeout Closing thread on timeout endpoint
   * @apiName Threads
   * @apiGroup Bot
   *
   * @apiParam {String} threadid the id of the thread we want to close
   *
   * @apiSuccess {Boolean} success Success of operation.
   * @apiSuccess {String} message Message from api.
   */
  router.post('/threads/:threadid/timeout', checkConnectorToken, (req, res) => {
    var thread_id = req.params.threadid;
    hub.ThreadManager.getThread(thread_id).then((thread) => {
      hub.ThreadManager.closeThread(thread_id).then(() => {
        logger.info("Thread " + thread_id + " closed");
        return res.json({success: true, message: {text: thread.timeout_message}});
      }).catch((err) => {
        logger.error(err);
        return res.json({success: false, message: {text: "Error closing the thread : "+err}});
      });
    }).catch((err) => {
      logger.error(err);
      return res.json({success: false, message: {text: "Error getting the thread : "+err}});
    });
  });

  // Hook requesting endpoint.
  /**
   * @api {post} /hooks Hook requesting endpoint.
   * @apiName hooks
   * @apiGroup Bot
   *
   * @apiParam {String} hook_id Hook id to confirm creation of.
   * @apiParam {String} channel_id Unique identifier so the adapter can send message to the correct channel on hook emission.
   *
   * @apiSuccess {Boolean} success Success of operation.
   * @apiSuccess {String} message Message from api.
   */
  router.post('/hooks', checkConnectorToken, (req, res) => {
    if (!req.body.hook_id) {
      return res.status(400).json({ success: false, message: { text: 'No hook_id in body/query. The hook_id was given when you recieved the message that requested the creation of a hook.' }});
    }

    hub.HookManager.finalize(req.body.hookId, req.decoded.connector.id).then(() => {
      return res.json({ success: true, message: "Hook finalized and registered." })
    }).catch((err) => {
    logger.error(err);
      return res.status(err.code || 500).json({ code: err.code || 500, success: false, message: (err.code ? ( err.message || "Internal Server Error while finalizing hook." ) : "Internal Server Error while finalizing hook." ) });
    });
  });

/**
   * @api {post} /threads/:threadid/timeout Closing thread on timeout endpoint
   * @apiName Threads
   * @apiGroup Bot
   *
   * @apiParam {String} threadid the id of the thread we want to close
   *
   * @apiSuccess {Boolean} success Success of operation.
   * @apiSuccess {String} message Message from api.
   */
  router.post('/hooks/:hookId/close', checkConnectorToken, (req, res) => {
      var hookId = req.params.hookId;
      hub.HookManager.get(hookId).then((hook) => { 
        hub.HookManager.remove(hookId).then(() => {
            logger.info("Deleted hook "+hookId);
            if(hook.messageOnDelete){
              return res.json({success: true, message: {text: hook.messageOnDelete}});
            }
        }).catch((err) => {
          logger.error(err);
          return res.json({success: true, message: {text: "Error removing the hook "+err}});
        });
      }).catch((err) => {
        logger.error(err);
        return res.json({success: true, message: {text: "Error getting the hook "+err}});
      });
  });
  
  /*
    Attach socket manager to ConnectorManager
    The connector manager will be able to kill sockets of revoked connectors. 
   */
  hub.ConnectorManager.attachIo(io);
  /*
    Attach socket manager to HookManagerr
    The hook manager will be able to emit messages to connected connectors.
   */
  hub.HookManager.attachIo(io);

  /*
    Socket middleware. Unauthorized sockets connection attemps from
    an unkown or a deactivated connector will be rejected.
   */
  io.use((socket, next) => {
    let token = socket.handshake.headers['x-access-token'];

    if (!token) {
      logger.warn("A connector attempted to connect without a token.")
      socket.disconnect(); // Force disconnection to allow connector to retry link without being automatically rejected.
      return next(new Error('authentication error'));
    }

    hub.ConnectorManager.checkConnectorToken(token)
      .then((connector) => {
        if (connector && connector.active) {
          socket.connector = { name: connector.name, id: connector._id }; // Socket will now bear the connector info. This is used to check if a connector is online or not.
          return next();
        } else {
          socket.disconnect(); // Force disconnection to allow connector to retry link without being automatically rejected.
          logger.warn("A rejected connector attempted to connect.")
          return next(new Error('authentication error'));
        }
      })
      .catch((err) => {
        socket.disconnect(); // Force disconnection to allow connector to retry link without being automatically rejected.
        logger.error(err);
        return next(new Error('authentication error'));
      });
  });

  // Load socket events listeners.
  io.on('connection', require('./socket'));

  return router;
}
