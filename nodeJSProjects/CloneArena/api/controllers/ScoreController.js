/**
 * ScoreController
 *
 * @description :: Server-side logic for managing Scores
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'show': function(req, res, next) {
        Score.query('SELECT User.email, Score.wins, Score.loss, Score.kills, Score.death FROM User JOIN Characters ON User.character_id = Characters.id JOIN Score ON Characters.score_id = Score.id ORDER BY Score.wins LIMIT 30', function(err, highscorelist) {
            if (err) return next(err);
            res.view({page: req.url, highscorelist: highscorelist});
        });
        
    }
};

