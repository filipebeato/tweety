/**
 * @fileOverview Tweety Parser file
 * @author <a href="mailto:filipe.beato@esat.kuleuven.be">Filipe Beato</a>
 * @version 0.01
 *
**/


var tweetyparser = {

    getTweets: function() {
        var tweets = document.getElementsByClassName("TweetTextSize");
        console.log(tweets.length);
    },


    printTweets: function() {

    },


    parseTweets: function() {
        var x = document.getElementsByClassName("TweetTextSize");
        for (var i = 0; i < x.length; i++) {
            x[i].style.backgroundColor = "yellow";
            console.log(x[i].innerHTML);
        }
    },

}

tweetyparser.getTweets();
tweetyparser.parseTweets();