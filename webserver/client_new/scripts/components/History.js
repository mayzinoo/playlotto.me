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
        displayName: 'gamesLog',

        getInitialState: function () {
            var state = GameSettingsStore.getState();
            state.currentTab = 'history';
            state.engine = Engine;
            return state;
        },

        componentDidMount: function() {
            Engine.on({
                game_crash: this._onChange
            });
             this.handleClick = this.handleClick.bind(this);
        },

        componentWillUnmount: function() {
            Engine.off({
                game_crash: this._onChange
            });
        },

        handleClick:function (event) {
        //alert(event.currentTarget.id);
        this.setState({'currentTab':event.currentTarget.id }); 
      },

        _onChange: function() {
            //Check if its mounted because when Game view receives the disconnect event from EngineVirtualStore unmounts all views
            //and the views unregister their events before the event dispatcher dispatch them with the disconnect event
            if(this.isMounted())
                this.setState(getState());
        },

        render: function () {
            var self = this;
            //console.log('Length', self.state.engine.tableHistory)
            if(this.state.currentTab === 'history'){
                var rows = self.state.engine.tableHistory.slice(0, MAX_GAMES_SHOWED).map(function (game, i) {
                var cashed_at, bet, profit, bonus;
                var player = game.player_info[self.state.engine.username];
                var number1 = game.number1;
                var number2 = game.number2;
                var number3 = game.number3;
                var number4 = game.number4;
                var number5 = game.number5;
                var number6 = game.number6;
                var round = game.roundnumber;
                var sum = game.totalincome;

                //console.log('RRRRRRRRRr', sum)

                var opt= {
                    timeZone: Engine.timezone,
                    month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric'
                };

                var formatter = new Intl.DateTimeFormat([], opt);
                var localTime = formatter.format(new Date(round));

                if (player) {
                    bonus = player.bonus;
                    bet = player.bet;

                    //If the player won
                    if (player.stopped_at) {
                        profit = ((player.stopped_at / 100) * player.bet) - player.bet;
                        cashed_at = Clib.formatSatoshis(player.stopped_at);

                        //If the player lost
                    } else {
                        profit = -bet;
                        cashed_at = '-';

                    }

                    //If we got a bonus
                    if (bonus) {
                        profit = profit + bonus;
                        bonus = Clib.formatDecimals(bonus*100/bet, 2)+'%';
                    } else {
                        bonus = '0%';
                    }

                    profit = Clib.formatSatoshis(profit);
                    bet = Clib.formatSatoshis(bet);

                    //If we didn't play
                } else {
                    cashed_at = '-';
                    bet = '-';
                    profit = '-';
                    bonus = '-';

                }

                var className;
                if (game.game_crash >= 198)
                    className = 'games-log-goodcrash';
                else if (game.game_crash <= 196)
                    className = 'games-log-badcrash';
                else
                    className = '';

                var spanStyle1 = { backgroundColor: 'red' };  
                var spanStyle2 = { backgroundColor: 'green' };  
                var spanStyle3 = { backgroundColor: 'blue' };  
                var spanStyle4 = { backgroundColor: 'orange' };  
                var spanStyle5 = { backgroundColor: 'pink' };  
                var spanStyle6 = { backgroundColor: 'red' };     

                return D.tr({ className: "result-row",  key: 'game_' + i },
                  
                  D.td( { className: "roundnum" },  sum),
                  D.td( { className: "result-ball-text2"},   number2),
                  D.td( { className: "result-ball-text3"},  number3),
                  D.td(  { className: "result-ball-text4"},  number4),
                  D.td(  { className: "result-ball-text5"},  number5),
                  D.td(  { className: "result-ball-text6"},  number6),
                
                );
            });
            }
            else{
                var rows = self.state.engine.tableHistory.slice(0, MAX_GAMES_SHOWED).map(function (game, i) {
                var cashed_at, bet, profit, bonus;
                var player = game.player_info[self.state.engine.username];
                var number1 = game.number1;
                var number2 = game.number2;
                var number3 = game.number3;
                var number4 = game.number4;
                var number5 = game.number5;
                var number6 = game.number6;

                if (player) {
                    bonus = player.bonus;
                    bet = player.bet;

                    //If the player won
                    if (player.stopped_at) {
                        profit = ((player.stopped_at / 100) * player.bet) - player.bet;
                        cashed_at = Clib.formatSatoshis(player.stopped_at);

                        //If the player lost
                    } else {
                        profit = -bet;
                        cashed_at = '-';

                    }

                    //If we got a bonus
                    if (bonus) {
                        profit = profit + bonus;
                        bonus = Clib.formatDecimals(bonus*100/bet, 2)+'%';
                    } else {
                        bonus = '0%';
                    }

                    profit = Clib.formatSatoshis(profit);
                    bet = Clib.formatSatoshis(bet);

                    //If we didn't play
                } else {
                    cashed_at = '-';
                    bet = '-';
                    profit = '-';
                    bonus = '-';

                }

                var className;
                if (game.game_crash >= 198)
                    className = 'games-log-goodcrash';
                else if (game.game_crash <= 196)
                    className = 'games-log-badcrash';
                else
                    className = '';

                var spanStyle1 = { backgroundColor: 'red' };  
                var spanStyle2 = { backgroundColor: 'green' };  
                var spanStyle3 = { backgroundColor: 'blue' };  
                var spanStyle4 = { backgroundColor: 'orange' };  
                var spanStyle5 = { backgroundColor: 'pink' };  
                var spanStyle6 = { backgroundColor: 'red' };     

                return D.tr({ className: "result-row",  key: 'game_' + i },
                  D.td( { className: "result-ball-text1"}, 'Time'),
                  D.td( { className: "result-ball-text2"},   'Round'),
                  D.td( { className: "result-ball-text3"},  'Buy Quantity'),
                  D.td(  { className: "result-ball-text4"},  'Purchased Numbers'),                 
                
                    );
                D.tr({ className: "result-row",  key: 'game_' + i },
                  D.td( { className: "result-ball-text1"}, 'Time'),
                  D.td( { className: "result-ball-text2"},   'Round'),
                  D.td( { className: "result-ball-text3"},  'Buy Quantity'),
                  D.td(  { className: "result-ball-text4"},  'Purchased Numbers'),                 
                
                    );
                });
            }

            
            spanStyle = {
                  top: "30px"
                };

                                  
             return D.div({ className: 'cell-wrapper' , style: spanStyle},
                                   D.div( {},
                                        D.div({ className: 'tab' },
                                            D.button({ className:"tablinks", id: 'history', key: "history", onClick: this.handleClick }, "History"),
                                            D.button({ className:"tablinks", id: 'lotto', key: "lotto", onClick: this.handleClick  },  "My Lotto"),
                                        ),
                                        D.div({ className: 'widget-container tabcontent active' },
                                            D.div({ className: 'table-inner' },
                                              D.table({ className: 'games-log' },
                                                  // D.thead(null,
                                                  //     D.tr(null,

                                                  //         D.th(null, D.div({ className: 'th-inner'}, 'Crash')),
                                                  //         D.th(null, D.div({ className: 'th-inner'}, '@')),
                                                  //         D.th(null, D.div({ className: 'th-inner'}, 'Bet')),
                                                  //         D.th(null, D.div({ className: 'th-inner'}, 'Bonus')),
                                                  //         D.th(null, D.div({ className: 'th-inner'}, 'Profit')),
                                                  //         D.th(null, D.div({ className: 'th-inner'}, 'Hash'))
                                                  //     )
                                                  // ),
                                                  D.tbody(null,
                                                      rows
                                                  )
                                              )
                                          )

                                        )                                       
                
                                  )
                                )
        }
    });
});