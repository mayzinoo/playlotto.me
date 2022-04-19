define([
    'react',
    'game-logic/engine',
    'stores/GameSettingsStore',
    'actions/GameSettingsActions',
    'game-logic/clib',
    'screenfull'
], function(
    React,
    Engine,
    GameSettingsStore,
    GameSettingsActions,
    Clib,
    Screenfull //Attached to window.screenfull
) {
    var D = React.DOM;

    function getState() {

        // let a = GameSettingsStore.getCurrentTheme();
        // console.log('theme' , a);
        return {
            balanceBitsFormatted: Clib.formatBits(Engine.balance),
            theme: GameSettingsStore.getCurrentTheme()//black || white
            // theme: 'black'
        }
    }

    return React.createClass({
        displayName: 'TopBar',

        propTypes: {
            isMobileOrSmall: React.PropTypes.bool.isRequired
        },

        getInitialState: function() {
            var state = getState();
            GameSettingsActions.toggleTheme();
            state.username = Engine.username;
            state.fullScreen = false;
            return state;
        },

        componentDidMount: function() {
            Engine.on({
                game_started: this._onChange,
                game_crash: this._onChange,
                cashed_out: this._onChange
            });
            GameSettingsStore.on('all', this._onChange);
        },

        componentWillUnmount: function() {
            Engine.off({
                game_started: this._onChange,
                game_crash: this._onChange,
                cashed_out: this._onChange
            });
            GameSettingsStore.off('all', this._onChange);
        },

        _onChange: function() {
            this.setState(getState());
        },

        _toggleTheme: function() {
            GameSettingsActions.toggleTheme();
        },

        _toggleFullScreen: function() {
            window.screenfull.toggle();
            this.setState({ fullScreen: !this.state.fullScreen });
        },

        render: function() {

            var userLogin;
            if(this.state.username) {
                userLogin = D.div({ className: 'user-login' },
                    D.div({ className: 'balance-bits' },
                        // D.span(null, 'Bits: '),
                        D.span({ className: 'balance' }, this.state.balanceBitsFormatted )
                    ),
                    D.div({ className: 'burger-btn username' },
                       
                        D.a({ href: '/account'}, 
                        D.i({className:'fa fa-bars'})
                        )   

                    )
                );
            } else {
                userLogin = D.div({ className: 'user-login' },
                    D.div({ className: 'register' },
                        D.a({ href: '/register' }, 'Register' )
                    ),
                    D.div({ className: 'login' },
                        D.a({ href: '/login'}, 'Log in' )
                    )
                );
            }

            return D.div({ id: 'top-bar' },

                    D.div({className:'container'},
                        D.div({className:'row header_wrapper'},
                            D.div({className:'col-md-12 col-lg-12 col-sm-12 header'},
                                D.div({className:'left_header'},
                                    D.div({ className: 'title' },
                                            D.a({ href: '/' },
                                                // D.h1(null, this.props.isMobileOrSmall? 'WWGO' : 'Wowgo')
                                                // D.h1(null, 'Wowgo')
                                                D.h1(null, 'LuckyBall')
                                            )
                                        )
                                    ),
                                D.div({className:'right_header'},
                                        userLogin
                                    )
                            )


                            )

                            
                    ),

                // D.div({ className: 'toggle-view noselect' + ((this.state.theme === 'black')? ' black' : ' white'), onClick: this._toggleTheme },
                //     D.a(null,
                //         (this.state.theme === 'white')? 'Lights Off' : 'Lights On'
                //         // (this.state.theme === 'black')
                //     )
                // ),
                D.div({ className: 'full-screen noselect', onClick: this._toggleFullScreen },
                     this.state.fullScreen? D.i({ className: 'fa fa-compress' }) : D.i({ className: 'fa fa-expand' })
                )
            )
        }
    });
});