var assert = require('better-assert');
var async = require('async');
var db = require('./database');
var events = require('events');
var util = require('util');
var _ = require('lodash');
var lib = require('./lib');
var SortedArray = require('./sorted_array');
var config = require('./config');

var tickRate = 150; // ping the client every X miliseconds
//var afterCrashTime = 120000; // how long from game_crash -> game_starting
var restartTime = 5000; // How long from  game_starting -> game_started (1 minute)


function Game(lastGameId, lastHash, bankroll, setting, gameHistory, playHistory) {
    var self = this;

    self.bankroll = bankroll;
    self.maxWin;

    self.gameShuttingDown = false;
    self.startTime; // time game started. If before game started, is an estimate...
    self.crashPoint; // when the game crashes, 0 means instant crash
    self.gameDuration; // how long till the game will crash..
    self.nextrate;

    self.number1;
    self.number2;
    self.number3;
    self.number4;
    self.number5;
    self.number6;
    self.roundnumber;
    self.first;
    self.previous;
    

    self.ticket_fee = Number(setting['ticket_fee']);
    self.win_payrate = Number(setting['win_payrate']);
    self.play_payrate = Number(setting['play_payrate']);
    self.jackpot_payrate = Number(setting['jackpot_payrate']);
    self.jackpot_payamount = Number(setting['jackpot_payamount']);
    self.game_duration = Number(setting['game_duration']);
    self.afterCrashTime = 61000 * self.game_duration;
    self.totalincome;

    self.forcePoint = null; // The point we force terminate the game

    self.state = 'ENDED'; // 'STARTING' | 'BLOCKING' | 'IN_PROGRESS' |  'ENDED'
    self.pending = {}; // Set of players pending a joined
    self.pendingCount = 0;
    self.joined = new SortedArray(); // A list of joins, before the game is in progress
    self.stop = {};

    self.players = {}; // An object of userName ->  { playId: ..., autoCashOut: .... }
    self.gameId = lastGameId;
    self.gameHistory = gameHistory;
    self.playHistory = playHistory;

    //console.log('hhhh', self.playHistory)

    self.lastHash = lastHash;
    self.hash = null;

    self.dbconnect = false;
    

    events.EventEmitter.call(self);

    function runGame() {        

        let date_ob = new Date();        

        let day = date_ob.getUTCDate();

        let month = date_ob.getUTCMonth() + 1;

        let hours = date_ob.getHours();
        // current minutes
        let minutes = date_ob.getMinutes();
        // current seconds
        let seconds = date_ob.getSeconds();

        //var round = month + ':' + day + '/' + hours + ':' + minutes + ':' + seconds; 
        var round = date_ob;        
        self.first = date_ob;
        console.log('run game', round);
        var number1= randomInteger(1, 28, null);
        self.number1 = number1;
        var number2= randomInteger(1, 28, 2);
        self.number2 = number2;
        var number3= randomInteger(1, 28, 3);
        self.number3 = number3;
        var number4= randomInteger(1, 28, 4);
        self.number4 = number4;
        var number5= randomInteger(1, 28, 5);
        self.number5 = number5;
        var number6= randomInteger(0, 9, 6);
        self.number6 = number6;

        self.roundnumber = round;
        //console.log('here starting game'); 

        db.getpreviousgame( function (err, prev) {
            if (err) {
                console.log('Could not get data', err, ' retrying in 2 sec..');
                return;
            }
            console.log('PREVIOUS', prev.roundnumber) 
            self.previous = prev.roundnumber;     
        });

        db.createGame(self.gameId + 1, number1, number2, number3, number4, number5,number6, round, function (err, info) {
            if (err) {
                console.log('Could not create game', err, ' retrying in 2 sec..');
                setTimeout(runGame, 2000);
                return;
            }

            //console.log('game starting here', restartTime);
            self.state = 'STARTING';
            //self.crashPoint = info.crashPoint;
            self.crashPoint = 9000;


            if (config.CRASH_AT) {
                assert(!config.PRODUCTION);
                self.crashPoint = parseInt(config.CRASH_AT);
            }

            self.hash = info.hash;
            self.gameId++;
            self.startTime = new Date(Date.now() + restartTime);
            self.players = {}; // An object of userName ->  { user: ..., playId: ..., autoCashOut: ...., status: ... }
            //self.gameDuration = Math.ceil(inverseGrowth(self.crashPoint + 1)); // how long till the game will crash..

            //self.gameDuration = 9000;
            self.gameDuration = 18000;
            self.maxWin = Math.round(self.bankroll * 0.03); // Risk 3% per game 

            console.log('game duration', self.crashPoint);

            

            // self.number1 = number1;
            // self.number2 = number2;
            // self.number3 = number3;
            // self.number4 = number4;
            // self.number5 = number5;
            // self.number6 = number6;

            console.log('n1', self.number1);
            console.log('n2', self.number2);
            console.log('n3', self.number3);
            console.log('n4', self.number4);
            console.log('n5', self.number5);
            console.log('n6', self.number6);
            console.log('round', round);    

                    

            self.emit('game_starting', {
                game_id: self.gameId,
                max_win: self.maxWin,                
                time_till_start: restartTime,
                number1: self.number1,
                number2: self.number2,
                number3: self.number3,
                number4: self.number4,
                number5: self.number5,
                number6: self.number6,
                roundnumber: self.roundnumber,
            });

            setTimeout(blockGame, restartTime);
        }); 
       
        //setTimeout(runGame,60000);
        
    }

    

    function runnewGame() {
        console.log('new new')
        db.getnextround(function(err,nextrate) {
            if (err) {
                return callback(err);
            }
            var nextrate = nextrate.game_crash;

            db.createnewGame(self.gameId + 1, nextrate, function (err, info) {
                console.log('rrrrrrrrrrrr', info)
            if (err) {
                console.log('Could not create game', err, ' retrying in 2 sec..');
                
                setTimeout(runnewGame, 2000);
                return;
            }

            //console.log('game starting')
            self.state = 'STARTING';
            //self.crashPoint = info.crashPoint;
            self.crashPoint = nextrate;

            if (config.CRASH_AT) {
                assert(!config.PRODUCTION);
                self.crashPoint = parseInt(config.CRASH_AT);
            }

            self.hash = info.hash;
            self.gameId++;
            self.startTime = new Date(Date.now() + restartTime);
            self.players = {}; // An object of userName ->  { user: ..., playId: ..., autoCashOut: ...., status: ... }
            self.gameDuration = Math.ceil(inverseGrowth(self.crashPoint + 1)); // how long till the game will crash..
            self.maxWin = Math.round(self.bankroll * 0.03); // Risk 3% per game

            self.emit('game_starting', {
                game_id: self.gameId,
                max_win: self.maxWin,
                time_till_start: restartTime
            });


            setTimeout(blockGame, restartTime);
        });

        //Remove next round from temp table    
        db.removenextround( function (err) {
            if (err) {
                console.log('Could not create game', err, ' retrying in 2 sec..');
                return;
            }
        });    
                    
        });            
    }

    function blockGame() {
        self.state = 'BLOCKING'; // we're waiting for pending bets..

        loop();
        function loop() {
            if (self.pendingCount > 0) {
                console.log('Delaying game by 100ms for ', self.pendingCount , ' joins');
                return setTimeout(loop, 100);
            } 

            startGame();
        }
    }

    /** Preset Next Round **/
    Game.prototype.presetnextround = function(nextrate) {
        console.log(nextrate)
      var twodecimal = (Number(nextrate).toFixed(2));
      var mystring = twodecimal.toString().replace('.','');
      console.log(mystring);
      var nextrate2 = Number(mystring);  
      db.createnextround(nextrate2, function (err) {
            if (err) {
                console.log('Could not create next round', err, ' retrying in 2 sec..');                
                return;
            }
     });  
  };  
    /** Preset Next Round End  **/


    /** Stop Game **/
    Game.prototype.stopgame2 = function(stime) {
        var self = this;
        this.state = 'ENDED';
        var stime = stime;

        if(stime !== undefined){            
            var elapsed = new Date() - self.startTime;
            var at = growthFunc(elapsed);
            self.crashPoint = at;
             
        }
        else{
          return clearTimeout(setstop, 1000);      
        }  
  };  

   
   function setstop() {
        var stoptime = Game.prototype.stopgame2(); 
    }
    setTimeout(setstop, 1000);

    /** Stop Game End **/

    function randomInteger(min, max, value) {
        
        var gennumber = Math.floor(Math.random() * (max - min + 1)) + min;
        var random;           
        
        if(value !== null){
           if(value === 2){
            //console.log('2222222222')
                do {
                    random = Math.floor(Math.random() * (max - min)) + min;
                } while (random === self.number1);
                //console.log('two', random)
                
           }
           else if(value === 3){
            //console.log('33333333333')
                do {
                    random = Math.floor(Math.random() * (max - min)) + min;
                } while (random === self.number1 || random === self.number2)
                //console.log('three', random)
                
           }
           else if(value === 4){
             //console.log('44444444444444')
                do {
                    random = Math.floor(Math.random() * (max - min)) + min;
                } while (random === self.number1 || random === self.number2 || random === self.number3)
                //console.log('four', random)
           }
           else if(value === 5){
             //console.log('55555555555555')
                do {
                    random = Math.floor(Math.random() * (max - min)) + min;
                } while (random === self.number1 || random === self.number2 || random === self.number3 || random === self.number4)
                //console.log('five', random)
           }
           else if(value === 6){
             //console.log('666666666666')
                  do {
                    random = Math.floor(Math.random() * (max - min)) + min;
                } while (random === self.number1 || random === self.number2 || random === self.number3 || random === self.number4 || random === self.number5)
                //console.log('six', random)
           }
           else{  }

        } 
        else{
            random = gennumber;
        }       
        return random;
    }

    function startGame() {
        let date_ob = new Date();

        let day = date_ob.getUTCDate();

        let month = date_ob.getUTCMonth() + 1;
    
        let hours = date_ob.getHours();
        // current minutes
        let minutes = date_ob.getMinutes();
        // current seconds
        let seconds = date_ob.getSeconds();        

        console.log('started_______game',  minutes + ':' + seconds);
        var round = month + ':' + day + '/' + hours + ':' + minutes + ':' + seconds;

        self.state = 'IN_PROGRESS';
        self.startTime = new Date();
        self.pending = {};
        self.pendingCount = 0;  
        //self.roundnumber = round;               

        
                var bets = {}; var balance = {};
                var arr = self.joined.getArray();
                for (var i = 0; i < arr.length; ++i) {
                    var a = arr[i];
                    bets[a.user.username] = a.bet;
                    balance[a.user.username] = a.balance;
                    self.players[a.user.username] = a;
                }

                console.log('joined array', self.players)
                //console.log('balance', bets)                

                self.joined.clear();

                self.emit('game_started',balance);

                //self.setForcePoint();

                //callTick(0); 
                setTimeout(endGame, 20000); 
            
        
    }

   

    function callTick(elapsed) {
        //console.log('call tick', elapsed)
        var left = self.gameDuration - elapsed;
        var nextTick = Math.max(0, Math.min(left, tickRate));

        //console.log('left left', left)
        //console.log('next next', nextTick)
        
        setTimeout(runTick, nextTick); 

    }

    function runTick() {
        
        var elapsed = new Date() - self.startTime;
        var at = growthFunc(elapsed);
        //console.log('crashpoint', self.crashPoint)
        //console.log('atatat ', at)
        self.runCashOuts(at);

        if (self.forcePoint <= at && self.forcePoint <= self.crashPoint) {
            self.cashOutAll(self.forcePoint, function (err) {
                //console.log('Just forced cashed out everyone at: ', self.forcePoint, ' got err: ', err);

                endGame(true);
            });
            return;
        }

        // and run the next
        //console.log('next game start')
        if (at > self.crashPoint){
            endGame(false); // oh noes, we crashed!

            //Set Timer Here
            var countdown = 1 * 30 * 1000;
            
            var timerId = setInterval(function(){
              //console.log('CCCCCCCCCCC', countdown);
              
              countdown -= 1000;
              var min = Math.floor(countdown / (60 * 1000));
              //var sec = Math.floor(countdown - (min * 60 * 1000));  // wrong
              var sec = Math.floor((countdown - (min * 60 * 1000)) / 1000);  //correct

              if (countdown < 0) {
                 //alert("30 min!");
                 clearInterval(timerId);
                 //doSomething();
              } else {                   

                    self.emit('timer', {
                        min : min,
                        sec : sec
                    });
                  }

                }, 1000); //1000ms. = 1sec.  
            }
        
        else{            
            tick(elapsed);
        }
    }



    function endGame(forced) {
        let date_ob = new Date();

        let day = date_ob.getUTCDate();

        let month = date_ob.getUTCMonth() + 1;

        let hours = date_ob.getHours();
        // current minutes
        let minutes = date_ob.getMinutes();
        // current seconds
        let seconds = date_ob.getSeconds();

        var round = month + ':' + day + '/' + hours + ':' + minutes + ':' + seconds;        

        console.log('endGame ', minutes + ':' + seconds);
       

       let date_ob2 = new Date(self.first);
       
        let hhh = date_ob2.setSeconds(date_ob2.getSeconds() + 85);
        //self.roundnumber = hhh;


        let sss = date_ob2.getHours() + ':' + date_ob2.getMinutes() + ':' + date_ob2.getSeconds();
        let next_round = month + ':' + day + '/' + sss;
        console.log('PREVIOUS ROUND', self.previous);  


       
        const timeInMinutes = 1;
        const currentTime = Date.parse(new Date());
        const deadline = new Date(currentTime + timeInMinutes*60*1000);

        var gameId = self.gameId - 1;
        var crashTime = Date.now();

        assert(self.crashPoint == 0 || self.crashPoint >= 100);

        var bonuses = [];

        if (self.crashPoint !== 0) {
            //bonuses = calcBonuses(self.players);

            var givenOut = 0;
            Object.keys(self.players).forEach(function(player) {
                var record = self.players[player];

                givenOut += record.bet * 0.01;
                if (record.status === 'CASHED_OUT') {
                    var given = record.stoppedAt * (record.bet / 100);
                    assert(lib.isInt(given) && given > 0);
                    givenOut += given;
                }
            });

            self.bankroll -= givenOut;
        }

        var playerInfo = self.getInfo().player_info;

        //console.log('player info', playerInfo)
        var bonusJson = {};
        // bonuses.forEach(function(entry) {
        //     bonusJson[entry.user.username] = entry.amount;
        //     playerInfo[entry.user.username].bonus = entry.amount;
        // });

        //self.lastHash = self.hash;        

        db.gettotalincome(gameId, self.number1, self.number2, self.number3, self.number4, self.number5, self.number6, function (err, info) {
            if (err) {
                console.log('Could not get total income', err, ' retrying in 2 sec..');
                return;
            }

            console.log('Total:', info.total.sum);           
            
            if(info.total.sum != null){ 

            self.emit('set_sum', {
                totalincome: info.total.sum
            });  
                
                //Update game income
                db.updateincome(gameId, info.total.sum, function(err) {
                    if (err) {
                        if (err.code == '23514') // constraint violation
                            return callback('ERROR');
                                console.log('[INTERNAL_ERROR] could not add balance to jackpot pay, got error: ', err);
                                callback(err);
                    } else { }               
                    
                });

                var owner_pay  = (self.play_payrate / 100) * Number(info.total.sum);
                var jackpot_pay  = (self.jackpot_payrate / 100) * Number(info.total.sum);
                 
                
                //console.log('jackpot_pay', jackpot_pay);
                //console.log('origin', self.jackpot_payamount)
                var jackpotpayamt = jackpot_pay + self.jackpot_payamount;
                self.jackpot_payamount = jackpotpayamt;
                

                //Set Balance to site manager account
                db.addtoowner(owner_pay, function(err) {
                    if (err) {
                        if (err.code == '23514') // constraint violation
                            return callback('ERROR');
                                console.log('[INTERNAL_ERROR] could not add balance to owner, got error: ', err);
                                callback(err);
                    } else { }               
                    
                });

                //Set Balance to jackpot pay amount
                db.addtojackpotpay(jackpotpayamt, function(err) {
                    if (err) {
                        console.log('EEEEEEEEEEEEee', err)
                        if (err.code == '23514') // constraint violation
                            return callback('ERROR');
                                console.log('[INTERNAL_ERROR] could not add balance to jackpot pay, got error: ', err);
                                callback(err);
                    } else { }               
                    
                });

                //If jackpot user exist 
                if(info.jackpot_user.length > 0)
                {
                    //Get jackpot payment value
                   var jackpot_payamount = self.jackpot_payamount;
                   var foronewinner = Math.round(jackpot_payamount / info.jackpot_user.length);

                   //console.log('for one', foronewinner);

                   for(t=0;t<info.jackpot_user.length;t++){ 

                   //Set to players update balance for frontend  
                    Object.keys(self.players).forEach(function (playerUserName) {
                        var play = self.players[playerUserName];
                            if(info.jackpot_user[t] === play.user.id){ 

                                    db.addtowinner(info.jackpot_user[t], foronewinner, function(err,updatebalance) {
                                        if (err) {
                                            if (err.code == '23514') // constraint violation
                                                return callback('ERROR');
                                                    console.log('[INTERNAL_ERROR] could not add jackpot balance to winner, got error: ', err);
                                                    callback(err);
                                        } else { 
                                            //Get Update Balance to Frontend
                                            console.log('UPDATE Balance',updatebalance)
                                            var username = play.user.username; 

                                            self.players[username].balance = updatebalance;

                                            self.emit('cashed_out', {
                                                username: username,
                                                balance: updatebalance,
                                            });                                           

                                            var playerInfo = self.getInfo().player_info;
                                            playerInfo[username].balance =  updatebalance;                                           
                                            
                                        }
                                    }); 
                                }
                                
                        });                                    
                    }

                    //Reduce jackpot_payamount from setting table
                    db.reducejackpotamt(function(err) {
                        if (err) {
                            if (err.code == '23514') // constraint violation
                                return callback('ERROR');
                                    console.log('[INTERNAL_ERROR] could not reduce jackpot balance from setting table, got error: ', err);
                                    callback(err);
                        } else { self.jackpot_payamount = 0; }
                    });      


                }
                else{
                    //console.log('No Jackpot User.')
                }
                    

                //Set Balance to winners 
                if(info.winner != null)
                {
                    var winner_id = info.winner; 
                    //If multiple winners, recalculate pay amount by ticket buying amount
                    if(winner_id.length > 1){                        
                         console.log('ticket amt', info.ticket_amt);
                         var allticket = info.ticket_amt.reduce((a, b) => a + b, 0);
                         //console.log(allticket);                         
                         // var payrate = Math.floor(self.win_payrate / allticket);
                         // console.log('payrate', payrate);                         

                         for(t=0;t<info.ticket_amt.length;t++){

                            //Set to players update balance for frontend  
                            Object.keys(self.players).forEach(function (playerUserName) {
                                var play = self.players[playerUserName];
                                    if(winner_id[t] === play.user.id){ 

                                    var payrate = Math.round(self.win_payrate / allticket) * info.ticket_amt[t];
                                    var winner_pay = Math.round((payrate / 100) * Number(info.total.sum));
                                                                
                                    db.addtowinner(winner_id[t], winner_pay, function(err,updatebalance) {
                                        if (err) {
                                            if (err.code == '23514') // constraint violation
                                                return callback('ERROR');
                                                    console.log('[INTERNAL_ERROR] could not add balance to winner, got error: ', err);
                                                    callback(err);
                                        } else { 
                                            //Get Update Balance to Frontend
                                            console.log('UPDATE Balance',updatebalance)
                                            var username = play.user.username; 

                                            self.players[username].balance = updatebalance;

                                            self.emit('cashed_out', {
                                                username: username,
                                                balance: updatebalance,
                                            });                                           

                                            var playerInfo = self.getInfo().player_info;
                                            playerInfo[username].balance =  updatebalance;
                                        }
                                    });
                                }
                                
                            });                                   
                         }                         
                    }
                    else{
                        //Single winner case
                        var payrate = Number(self.win_payrate / winner_id.length);
                        var winner_pay = Math.round((payrate / 100) * Number(info.total.sum));

                        for(i=0;i<winner_id.length;i++){

                             Object.keys(self.players).forEach(function (playerUserName) {
                                var play = self.players[playerUserName];
                                console.log('PLAYER ID', play.user.id)
                                console.log('WINNER ID', winner_id[i])
                                if(winner_id[i] === play.user.id){
                                     db.addtowinner(winner_id[i], winner_pay, function(err,updatebalance) {
                                        if (err) {
                                            if (err.code == '23514') // constraint violation
                                                return callback('ERROR');
                                                    console.log('[INTERNAL_ERROR] could not add balance to winner, got error: ', err);
                                                    callback(err);
                                        } else { 
                                                console.log('UPDATE Balance',updatebalance)
                                                var username = play.user.username; 

                                                self.players[username].balance = updatebalance;
                                                // // //self.updatebalance = updatebalance;
                                                self.emit('cashed_out', {
                                                    username: username,
                                                    balance: updatebalance,
                                                }); 

                                                // // self.players[username].balance = updatebalance;
                                                var playerInfo = self.getInfo().player_info;
                                                playerInfo[username].balance =  updatebalance;

                                                console.log('within db', self.players)

                            
                                        }
                                    });
                                }
                                
                            });                       
                        }    
                    }              
                     
                }
                else{
                    console.log('No Winner');
                    var owner_pay2  =  Number(info.total.sum); 
                
                    console.log('owner', owner_pay2);

                    //Set Balance to site manager account
                    db.addtoowner(owner_pay2, function(err) {
                        if (err) {
                            if (err.code == '23514') // constraint violation
                                return callback('ERROR');
                                    console.log('[INTERNAL_ERROR] could not add balance to owner, got error: ', err);
                                    callback(err);
                        } else {        
                            
                        }
                    });
                    

                    //Get Update Balance to Frontend
                    Object.keys(self.players).forEach(function (playerUserName) {
                        var play = self.players[playerUserName];                       
                        var username = play.user.username; 

                        var reduce_balance = Number(self.players[username].balance) - Number(self.ticket_fee);
                        // // //self.updatebalance = updatebalance;
                        self.players[username].balance = reduce_balance;
                        // // self.players[username].balance = updatebalance; 

                        var playerInfo = self.getInfo().player_info;
                        playerInfo[username].balance =  reduce_balance;                     

                        self.emit('cashed_out', {
                            username: username,
                            balance: reduce_balance ,
                        });                   
                        
                        console.log('REDUCE BALANCE', reduce_balance )               
                                                        
                    });      
                }
                           
                
            }
            else{

                // console.log(self.number1)
                // console.log(self.number2)
                // console.log(self.number3)
                // console.log(self.number4)
                // console.log(self.number5)
                // console.log(self.number6)
                console.log('No players');
            }

            self.dbconnect = true;
        }); 

        
        //Set Timer Here
            var countdown = self.game_duration * 60 * 1000;
            var timerId = setInterval(function(){
              //console.log('CCCCCCCCCCC', countdown);
              
              countdown -= 1000;
              var min = Math.floor(countdown / (60 * 1000));
              //var sec = Math.floor(countdown - (min * 60 * 1000));  // wrong
              var sec = Math.floor((countdown - (min * 60 * 1000)) / 1000);  //correct

              if (countdown < 0) {
                 //alert("30 min!");
                 clearInterval(timerId);
                 //doSomething();
              } else {
                //Get Setting Values
                db.getlottosetting(function(err,setting) {
                    if (err) {
                        if (err.code == '23514') // constraint violation
                            return callback('ERROR');
                                console.log('[INTERNAL_ERROR] could not get setting values, got error: ', err);
                                callback(err);
                    } else { 
                        self.ticket_fee = setting.ticket_fee;
                     }           
                });
                    self.emit('timer', {
                        min : min,
                        sec : sec,
                        roundnumber: self.roundnumber,
                        jackpot_payamount: self.jackpot_payamount,
                        loto_price: self.ticket_fee,

                    });
                  }

                }, 1000); //1000ms. = 1sec.       

        // oh noes, we crashed!
        console.log('@ crash', self.crashPoint);
        console.log('GameID', gameId);
        console.log('Game end history', self.first);  

       db.gettotalticketfee(gameId, function (err, fee) { 
            if(fee.total.sum !== null){
                var totalfee = fee.total.sum;
                self.totalincome = fee.total.sum;
            } 
            else{
                var totalfee = 0;
                self.totalincome = 0;
            }
            

            self.emit('game_crash', {
            forced: forced,            
            elapsed: self.gameDuration,
            game_crash: self.crashPoint, // We send 0 to client in instant crash
            bonuses: bonusJson,
            hash: self.lastHash,
            number1: self.number1,
            number2: self.number2,
            number3: self.number3,
            number4: self.number4,
            number5: self.number5,
            number6: self.number6,
            roundnumber: self.previous,
            totalincome: totalfee
        });

        self.gameHistory.addCompletedGame({
            game_id: gameId,
            game_crash: self.crashPoint,
            created: self.startTime,
            roundnumber: self.previous,
            totalincome: totalfee,
            player_info: playerInfo,
            hash: self.lastHash,
            number1: self.number1,
            number2: self.number2,
            number3: self.number3,
            number4: self.number4,
            number5: self.number5,
            number6: self.number6
           
        });
       });  
        

        
              
                

        // self.playHistory.addCompletedPlay({
        //     game_id: gameId,
        //     game_crash: self.crashPoint,
        //     created: self.startTime,
        //     player_info: playerInfo,
        //     hash: self.lastHash,
        //     user_id: self.user_id,
        //     ticket_amt: self.ticket_amount,
        //     number1: self.choose1,
        //     number2: self.choose2,
        //     number3: self.choose3,
        //     number4: self.choose4,
        //     number5: self.choose5,
        //     number6: self.choose6
        // });

        var dbTimer;
        dbTimeout();
        function dbTimeout() {
            dbTimer = setTimeout(function() {
                console.log('Game', gameId, 'is still ending... Time since crash:',
                            ((Date.now() - crashTime)/1000).toFixed(3) + 's');
                dbTimeout();
            }, 1000);
        }

        db.endGame(gameId, function(err) {
            if (err)
                console.log('ERROR could not end game id: ', gameId, ' got err: ', err);
            clearTimeout(dbTimer);

            if (self.gameShuttingDown) {
                //console.log('shut down')               
                self.emit('shutdown');
            }
            else{
                //console.log('not shutdown')
                
                //Check if preset next round setting or not
                db.getnextround(function(err,nextrate) {
                    if (err) {
                        console.log(err)
                        return callback(err);
                    }
                    //console.log('nnnnnnnnnnnn', nextrate)
                    if(nextrate !== 'undefined')
                    {
                        setTimeout(runnewGame, (crashTime + self.afterCrashTime) - Date.now());
                    }   
                    else{
                        setTimeout(runGame, (crashTime + self.afterCrashTime) - Date.now());
                    }       
                });

                //setTimeout(runGame, (crashTime + afterCrashTime) - Date.now());
            }         
        });

        self.state = 'ENDED';

         

    }

    function tick(elapsed) {
        //console.log('tick tick',elapsed)
        self.emit('game_tick', elapsed);
        callTick(elapsed);
    }
    
    runGame();
   

       
}

util.inherits(Game, events.EventEmitter);


Game.prototype.getInfo = function() {

    var playerInfo = {};

    for (var username in this.players) {
        var record = this.players[username];

        //assert(lib.isInt(record.bet));
        var info = {
            balance: record.balance,
            userid: record.user.id
        };

        if (record.status === 'CASHED_OUT') {
            //assert(lib.isInt(record.stoppedAt));
            //info['stopped_at'] = record.stoppedAt;
        }

        playerInfo[username] = info;
    }


    var res = {
        ticket_fee: this.ticket_fee,
        win_payrate: this.win_payrate,
        play_payrate: this.play_payrate,
        jackpot_payrate: this.jackpot_payrate,
        jackpot_payamount: this.jackpot_payamount,
        state: this.state,
        player_info: playerInfo,
        game_id: this.gameId, // game_id of current game, if game hasnt' started its the last game
        last_hash: this.lastHash,
        max_win: this.maxWin,
        roundnumber: this.roundnumber,
        totalincome: this.totalincome,
        // if the game is pending, elapsed is how long till it starts
        // if the game is running, elapsed is how long its running for
        /// if the game is ended, elapsed is how long since the game started
        elapsed: Date.now() - this.startTime,
        created: this.startTime,
        joined: this.joined.getArray().map(function(u) { return u.user.username; })
    };

    if (this.state === 'ENDED')
        res.crashed_at = this.crashPoint;

    return res;
};

// Save My Numbers
Game.prototype.savemynumbers = function(user, choose1,choose2,choose3,choose4,choose5,choose6, callback) {
    
    var self = this;

    assert(typeof user.id === 'number');
    assert(typeof user.username === 'string');


    db.savemynumbers(choose1,choose2,choose3,choose4,choose5,choose6,user.id, self.gameId, function(err) {
        self.pendingCount--;

        if (err) {
            console.log('errrrrrorrrrrrrrrrrrrrrrrrr', err)
            if (err.code == '23514') // constraint violation
                return callback('NOT_ENOUGH_MONEY');

            console.log('[INTERNAL_ERROR] could not save my numbers, got error: ', err);
            callback(err);
        } else {
            console.log('success');
            callback(null);
        }
    });
};


// Calls callback with (err, booleanIfAbleToJoin)
Game.prototype.buyloto = function(user, ticket,ticket_fee,choose1,choose2,choose3,choose4,choose5,choose6,round, callback) {
    console.log('insert db game.js', choose1);
    console.log('insert db game.js', choose2);
    console.log('insert db game.js', choose3);
    console.log('insert db game.js', choose4);
    console.log('insert db game.js', choose5);
    console.log('insert db game.js', choose6);
    console.log('insert db round', round);
    var self = this;

    assert(typeof user.id === 'number');
    assert(typeof user.username === 'string');

    // if (self.state !== 'STARTING')
    //     return callback('GAME_IN_PROGRESS');
  

    self.pending[user.username] = user.username;
    self.pendingCount++;

    
    db.lotobuy(ticket,ticket_fee, choose1,choose2,choose3,choose4,choose5,choose6,user.id, self.gameId, function(err, playId) {
        self.pendingCount--;

        if (err) {
            if (err.code == '23514') // constraint violation
                return callback('NOT_ENOUGH_MONEY');

            console.log('[INTERNAL_ERROR] could not buy loto, got error: ', err);
            callback(err);
        } else {
             self.playHistory.addCompletedPlay({
                play_id: playId,
                player_info: user,
                roundnumber : round,
                user_name: user.username,
                user_id: user.id,
                ticket_amount: ticket,
                choose1: choose1,
                choose2: choose2,
                choose3: choose3,
                choose4: choose4,
                choose5: choose5,
                choose6: choose6
            });

            // assert(playId > 0);

            // self.bankroll += betAmount;

            var index = self.joined.insert({ user: user, ticket: ticket, num1: choose1, num2: choose2,num3: choose3, 
                        num4: choose4,num5:choose5,num6: choose6, balance: user.balance });


            // console.log('JJJJJJJJJJJJJJJJJ', self.joined);
            // self.emit('buylotto',  {
            //     username: user.username,
            //     index: self.joined
            // });


            callback(null);
        }
    });


};

// Calls callback with (err, booleanIfAbleToJoin)
Game.prototype.placeBet = function(user, betAmount, autoCashOut, callback) {
    var self = this;

    assert(typeof user.id === 'number');
    assert(typeof user.username === 'string');
    assert(lib.isInt(betAmount));
    assert(lib.isInt(autoCashOut) && autoCashOut >= 100);

    if (self.state !== 'STARTING')
        return callback('GAME_IN_PROGRESS');

    if (lib.hasOwnProperty(self.pending, user.username) || lib.hasOwnProperty(self.players, user.username))
        return callback('ALREADY_PLACED_BET');

    self.pending[user.username] = user.username;
    self.pendingCount++;

    db.placeBet(betAmount, autoCashOut, user.id, self.gameId, function(err, playId) {
        self.pendingCount--;

        if (err) {
            if (err.code == '23514') // constraint violation
                return callback('NOT_ENOUGH_MONEY');

            console.log('[INTERNAL_ERROR] could not play game, got error: ', err);
            callback(err);
        } else {
            assert(playId > 0);

            self.bankroll += betAmount;

            var index = self.joined.insert({ user: user, bet: betAmount, autoCashOut: autoCashOut, playId: playId, status: 'PLAYING' });

            self.emit('player_bet',  {
                username: user.username,
                index: index
            });

            callback(null);
        }
    });
};



    Game.prototype.callTick = function(elapsed){
        var self = this;
        console.log('call Tick', elapsed);
        var left = self.gameDuration - elapsed;
        var nextTick = Math.max(0, Math.min(left, tickRate));

        console.log('left left', left)
        console.log('next next', nextTick)

        setTimeout(self.runTick, nextTick);
    };


    Game.prototype.runTick = function(){
        var self = this;
        var elapsed = new Date() - self.startTime;
        var at = growthFunc(elapsed);

        self.runCashOuts(at);

        if (self.forcePoint <= at && self.forcePoint <= self.crashPoint) {
            self.cashOutAll(self.forcePoint, function (err) {
                console.log('Just forced cashed out everyone at: ', self.forcePoint, ' got err: ', err);

                self.stopgame(true);
            });
            return;
        }

        // and run the next

        if (at > self.crashPoint)
            self.stopgame(false); // oh noes, we crashed!
        else
            self.tick(elapsed);
    };

    Game.prototype.tick = function(elapsed) {
        var self = this;
        self.emit('game_tick', elapsed);
        self.callTick(elapsed);
    }


Game.prototype.doCashOut = function(play, at, callback) {
    assert(typeof play.user.username === 'string');
    assert(typeof play.user.id == 'number');
    assert(typeof play.playId == 'number');
    assert(typeof at === 'number');
    assert(typeof callback === 'function');

    var self = this;

    var username = play.user.username;

    assert(self.players[username].status === 'PLAYING');
    self.players[username].status = 'CASHED_OUT';
    self.players[username].stoppedAt = at;

    var won = (self.players[username].bet / 100) * at;
    assert(lib.isInt(won));

    self.emit('cashed_out', {
        username: username,
        stopped_at: at
    });

    db.cashOut(play.user.id, play.playId, won, function(err) {
        if (err) {
            console.log('[INTERNAL_ERROR] could not cash out: ', username, ' at ', at, ' in ', play, ' because: ', err);
            return callback(err);
        }

        callback(null);
    });
};

Game.prototype.runCashOuts = function(at) {
    var self = this;

    var update = false;
    // Check for auto cashouts

    Object.keys(self.players).forEach(function (playerUserName) {
        var play = self.players[playerUserName];

        if (play.status === 'CASHED_OUT')
            return;

        assert(play.status === 'PLAYING');
        assert(play.autoCashOut);

        if (play.autoCashOut <= at && play.autoCashOut <= self.crashPoint && play.autoCashOut <= self.forcePoint) {

            self.doCashOut(play, play.autoCashOut, function (err) {
                if (err)
                    console.log('[INTERNAL_ERROR] could not auto cashout ', playerUserName, ' at ', play.autoCashOut);
            });
            update = true;
        }
    });

    if (update)
        self.setForcePoint();
};

Game.prototype.setForcePoint = function() {
   var self = this;

   var totalBet = 0; // how much satoshis is still in action
   var totalCashedOut = 0; // how much satoshis has been lost

   Object.keys(self.players).forEach(function(playerName) {
       var play = self.players[playerName];

       if (play.status === 'CASHED_OUT') {
           var amount = play.bet * (play.stoppedAt - 100) / 100;
           totalCashedOut += amount;
       } else {
           assert(play.status == 'PLAYING');
           assert(lib.isInt(play.bet));
           totalBet += play.bet;
       }
   });

   if (totalBet === 0) {
       self.forcePoint = Infinity; // the game can go until it crashes, there's no end.
   } else {
       var left = self.maxWin - totalCashedOut - (totalBet * 0.01);

       var ratio =  (left+totalBet) / totalBet;

       // in percent
       self.forcePoint = Math.max(Math.floor(ratio * 100), 101);
   }

};


// User self cashout
Game.prototype.cashOut = function(user, callback) {
    var self = this;

    //assert(typeof user.id === 'number');

    if (this.state !== 'IN_PROGRESS')
        return callback('GAME_NOT_IN_PROGRESS');

    var elapsed = new Date() - self.startTime;
    var at = growthFunc(elapsed);
    var play = lib.getOwnProperty(self.players, user.username);

    if (!play)
        return callback('NO_BET_PLACED');

    if (play.autoCashOut <= at)
        at = play.autoCashOut;

    if (self.forcePoint <= at)
        at = self.forcePoint;


    if (at > self.crashPoint)
        return callback('GAME_ALREADY_CRASHED');

    if (play.status === 'CASHED_OUT')
        return callback('ALREADY_CASHED_OUT');

    self.doCashOut(play, at, callback);
    self.setForcePoint();
};


//Admin cashout a game 
Game.prototype.cashOutAll = function(at, callback) {
    var self = this;
    //console.log('time', at)

    if (this.state !== 'IN_PROGRESS')
        return callback();

    console.log('Cashing everyone out at: ', at);

    assert(at >= 100);

    self.runCashOuts(at);

    if (at > self.crashPoint)
        return callback(); // game already crashed, sorry guys

    var tasks = [];

    Object.keys(self.players).forEach(function(playerName) {
        var play = self.players[playerName];

        if (play.status === 'PLAYING') {
            tasks.push(function (callback) {
                if (play.status === 'PLAYING')
                    self.doCashOut(play, at, callback);
                else
                    callback();
            });
        }
    });

    console.log('Needing to force cash out: ', tasks.length, ' players');

    async.parallelLimit(tasks, 4, function (err) {
        if (err) {
            console.error('[INTERNAL_ERROR] unable to cash out all players in ', self.gameId, ' at ', at);
            callback(err);
            return;
        }
        console.log('Emergency cashed out all players in gameId: ', self.gameId);

        callback();
    });
};

Game.prototype.shutDown = function() {
    var self = this;

    self.gameShuttingDown = true;
    self.emit('shuttingdown');

    // If the game has already ended, we can shutdown immediately.
    if (this.state === 'ENDED') {
        self.emit('shutdown');
    }
};

/// returns [ {playId: ?, user: ?, amount: ? }, ...]
function calcBonuses(input) {
    // first, lets sum the bets..

    function sortCashOuts(input) {
        function r(c) {
            return c.stoppedAt ? -c.stoppedAt : null;
        }

        return _.sortBy(input, r);
    }

    // slides fn across array, providing [listRecords, stoppedAt, totalBetAmount]
    function slideSameStoppedAt(arr, fn) {
        var i = 0;
        while (i < arr.length) {
            var tmp = [];
            var betAmount = 0;
            var sa = arr[i].stoppedAt;
            for (; i < arr.length && arr[i].stoppedAt === sa; ++i) {
                betAmount += arr[i].bet;
                tmp.push(arr[i]);
            }
            assert(tmp.length >= 1);
            fn(tmp, sa, betAmount);
        }
    }

    var results = [];

    var sorted = sortCashOuts(input);

    if (sorted.length  === 0)
        return results;

    var bonusPool = 0;
    var largestBet = 0;

    for (var i = 0; i < sorted.length; ++i) {
        var record = sorted[i];

        // assert(record.status === 'CASHED_OUT' || record.status === 'PLAYING');
        // assert(record.playId);
        var bet = record.bet;
        //assert(lib.isInt(bet));

        bonusPool += bet / 100;
        //assert(lib.isInt(bonusPool));

        largestBet = Math.max(largestBet, bet);
    }

    var maxWinRatio = bonusPool / largestBet;

    slideSameStoppedAt(sorted,
        function(listOfRecords, cashOutAmount, totalBetAmount) {
            if (bonusPool <= 0)
                return;

            var toAllocAll = Math.min(totalBetAmount * maxWinRatio, bonusPool);

            for (var i = 0; i < listOfRecords.length; ++i) {
                var toAlloc = Math.round((listOfRecords[i].bet / totalBetAmount) * toAllocAll);

                if (toAlloc <= 0)
                    continue;

                bonusPool -= toAlloc;

                var playId = listOfRecords[i].playId;
                //assert(lib.isInt(playId));
                var user = listOfRecords[i].user;
                //assert(user);

                results.push({
                    playId: playId,
                    user: user,
                    amount: toAlloc
                });
            }
        }
    );

    return results;
}


function growthFunc(ms) {
    var r = 0.00006;
    return Math.floor(100 * Math.pow(Math.E, r * ms));
}

function inverseGrowth(result) {
    var c = 16666.666667;
    return c * Math.log(0.01 * result);
}

module.exports = Game;
