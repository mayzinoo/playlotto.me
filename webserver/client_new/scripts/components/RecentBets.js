define([
    'react',
    'game-logic/clib',
    'game-logic/engine'
], function(
    React,
    Clib,
    Engine
){

    /** Constants **/
    var MAX_GAMES_SHOWED = 50;

    var D = React.DOM;

    function getState(){
        return {
            engine: Engine
        }
    }

    function copyHash(gameId, hash) {
        return function() {
            prompt('Game ' + gameId + ' Hash: ', hash);
        }
    }

    return React.createClass({
        displayName: 'recentBets',

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
            var self = this;

            var rows = self.state.engine.tableHistory.slice(0, MAX_GAMES_SHOWED).map(function (game, i) {
                var cashed_at, bet, profit, bonus;
                var player = game.player_info[self.state.engine.username];
                if (player) {
                    //bonus = player.bonus*100;
                    bonus = 0;
                    bet = player.bet*100;

                    //If the player won
                    if (player.stopped_at) {
                        profit = ((player.stopped_at / 100) * player.bet) - player.bet;
                        cashed_at = Clib.formatSatoshis(player.stopped_at);
                        //If the player lost
                    } else {
                        profit = -bet/100;
                        cashed_at = '-';
                    }

                    //If we got a bonus
                    if (bonus) {
                        //profit = profit + bonus;
                        //bonus = Clib.formatDecimals(bonus*100/bet, 2)+'%';
                        bonus = '0%';
                        profit = profit;
                    } else {
                        //bonus = '0%';
                        bonus = '-';
                    }

                    profit = Clib.formatSatoshis(profit*100);
                    bet = Clib.formatSatoshis(bet);

                    //If we didn't play
                } else {
                    cashed_at = 'Tom Bass';
                    bet = 'Ξ 1.00000000';
                    profit = 'Ξ 29';
                    bonus = 'x1.29';
                }

                var className;
                if (game.game_crash >= 198)
                    className = 'games-log-goodcrash';
                else if (game.game_crash <= 196)
                    className = 'games-log-badcrash';
                else
                    className = '';

                return D.tr({ key: 'game_' + i },
                    //D.td(null, Clib.formatSatoshis(game.game_crash), D.i(null, 'x')),
                    D.td(null, entry.username),
                    D.td(null, bet),
                    D.td(null, profit),
                    D.td(null, bonus)

                );
            });

            return D.div({ id: 'games-log-container' },
                D.div({ className: 'responsive-table' }),                
                    D.table({ className: 'table table-dark' },
                        D.thead(null,
                            D.tr(null,
                                D.th(null,  D.div({ className: 'actlog'}, 'Player')),
                                D.th(null,  D.div({ className: 'actlog'}, 'Bet')),
                                D.th(null,  D.div({ className: 'actlog'}, 'Profit')),
                                D.th(null,  D.div({ className: 'actlog'}, 'Payout'))
                            )
                        ),
                        D.tbody(null,
                            rows
                        )
                    ) 
               );
        }

    });

});
