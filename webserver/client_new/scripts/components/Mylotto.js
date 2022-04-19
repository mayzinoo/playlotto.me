define([
    'react',
    'lodash',
    'game-logic/clib',    
    'game-logic/engine',
    'stores/ChartStore',
    'stores/GameSettingsStore',    
], function(
    React,
    _,
    Clib,    
    Engine,
    ChartStore,
    GameSettingsStore,    
){

    /** Constants **/
    var MAX_GAMES_SHOWED = 50;

    var D = React.DOM;

    function getState(){
        return {
            currentTab: 'history',
            engine: Engine
        }
    }

    function copyHash(gameId, hash) {
        return function() {
            prompt('Game ' + gameId + ' Hash: ', hash);
        }
    }

    return React.createClass({
        displayName: 'Mylotto',

        getInitialState: function () {            
            return getState();
        },

        componentDidMount: function() {
            Engine.on({
                game_crash: this._onChange
            });            
        },

        componentWillUnmount: function() {
            Engine.off({
                game_crash: this._onChange
            });
        },       

        _onChange: function() {
            //Check if its mounted because when Game view receives the disconnect event from EngineVirtualStore unmounts all views
            //and the views unregister their events before the event dispatcher dispatch them with the disconnect event
            if(this.isMounted())
                this.setState(getState());
        },
       

        render: function () {
            const header = [];
            header.push(D.tr({  className: "lototitle"},
                  D.td( { },   'Round'),
                  D.td( { },  'Buy Quantity'),
                  D.td(  { },  'Purchased Numbers') )
                  
                  );

            var self = this;
            //console.log('Play history', self.state.engine.playHistory) 
            //console.log('engine user', Engine.userid)
            var phistory = self.state.engine.playHistory;
            var userplay = [];
            for(var i=0; i < phistory.length; i++) {
              //console.log('pppppp', phistory[i].player_info)
               if(phistory[i].user_id === Engine.userid){
                userplay.push(phistory[i]);
               }
            }

            //console.log('User history', userplay)  
                        
                //var rows = self.state.engine.playHistory.slice(0, MAX_GAMES_SHOWED).map(function (game, i) {

                var rows = self.state.engine.playHistory.slice(0, MAX_GAMES_SHOWED).map(function (game, i) {
                var cashed_at, bet, profit, bonus;
                var playerid = game.user_id;
                var number1 = game.choose1;
                var number2 = game.choose2;
                var number3 = game.choose3;
                var number4 = game.choose4;
                var number5 = game.choose5;
                var number6 = game.choose6;
                var ticket_amt = game.ticket_amount;
                var round = game.roundnumber;

                

                var created_first = game.created_at;                
                    var spanStyle1 = { backgroundColor: 'red' };  
                    var spanStyle2 = { backgroundColor: 'green' };  
                    var spanStyle3 = { backgroundColor: 'blue' };  
                    var spanStyle4 = { backgroundColor: 'orange' };  
                    var spanStyle5 = { backgroundColor: 'pink' };  
                    var spanStyle6 = { backgroundColor: 'red' };     

                    if(Number(playerid) === Number(Engine.userid)){
                        console.log('rounddddd', round)
                        var opt= {
                            timeZone: Engine.timezone,
                            month: 'numeric', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric'
                        };

                
                    var formatter = new Intl.DateTimeFormat([], opt);
                    var localTime = formatter.format(new Date(round));

                    return D.tr({ className: "lotoresult" },
                        D.td( { className: "lotoresult" }, localTime),
                        D.td( { className: "lotoresult" }, ticket_amt),                        
                        D.td( {}, number1 ),
                        D.td( {}, number2 ),
                        D.td( {}, number3 ),
                        D.td( {}, number4 ),
                        D.td( {}, number5 ),
                        D.td( {}, number6 )                       
                                          
                      );
               

                
                        
                       
                    }
                    else{
                      return null;
                    }
                         
                    
                    
                    
            });         
            
            spanStyle = {
                  top: "30px"
            };

                                  
             return D.div({ className: 'mylotto' },                                  
                                        D.h3({className:'mylotto-title'},'My Lotto'),
                                        D.div({ className: 'mylotto-list' },
                                            D.div({ className: 'table-inner' },
                                              D.table({ className: 'games-log' },
                                                  D.tbody(null,
                                                      header,
                                                      rows
                                                  )
                                              )
                                          )
                                    )                                    
                
                                
                                )
        }
    });
});