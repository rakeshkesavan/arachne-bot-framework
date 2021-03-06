/*
  SKILL : nlp
  AUTHOR : System
  DATE : 14/05/2018
*/

module.exports = (skill) => {
    const secret = skill.getSecret();
    const request = skill.loadModule('request');

    skill.addCommand("analyze", "analyze", ({ phrase, data }) => {
        return new Promise((resolve, reject) => {
            skill.log(`> [INFO] {nlp} - Analyze "${phrase}".`);
            request({
                url: "http://nlu-service.intech-dev.com:3013/projects/"+secret.nlu_id+"/parse",
                method: "POST",
                headers: { 'App-Token': secret.nlu_token },
                body: {
                    "text": phrase
                },
                json: true
            }, (err,res,body) => {
                if(err || res.statusCode !== 200) {
                    skill.log('> [ERROR] Error contacting the nlu API ' + (err || res.statusCode));
                    skill.log(err);
                    return resolve({message : {text: 'Error contacting the nlu API '}});
                }
                let analyzed = { };
                try {
                    analyzed.intent = body.data.intent ? body.data.intent.toLowerCase() : null;
                      analyzed.entities = {};
                      if(body.data.entities) {
                          for (let entity of body.data.entities) {
                            analyzed.entities[entity.entity.toLowerCase()] = analyzed.entities[entity.entity.toLowerCase()] || [];
                            analyzed.entities[entity.entity.toLowerCase()].push(entity.value);
                          }
                      }
                
                      analyzed.message = {
                        text: analyzed.intent ? `I think your intent is *${analyzed.intent}*.` : `I did'nt found any intent in this sentence.`
                      };
                      
                      skill.log(analyzed)
                      
                      return resolve(analyzed);
                } catch(e) {
                    return reject(e);
                }
            });
          });
    }, { description: "Extract the intention of a sentence." });
}